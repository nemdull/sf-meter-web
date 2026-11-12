import { SAMPLE_TECHS } from '@/shared/data/sample'
import { apiParams, applyQuery, levelOf, statsOf, type Level, type Stats, type Tech, type TechQuery } from '@/shared/lib/tech'

/** データの出どころ。API につながらないときは、同梱のサンプルデータに切り替える */
export type Source = 'api' | 'sample'

export type Board = {
  /** 条件に合うテクノロジー */
  techs: Tech[]
  /** 全体の集計（絞り込みの影響を受けない） */
  stats: Stats
  source: Source
}

// API の置き場所。空なら、画面と同じオリジンの /api を見る（開発中は Vite が :8080 へ中継する）
const BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const TIMEOUT_MS = 4000

/** API がつながらない（落ちている・置かれていない）ことを表す。サンプルデータに切り替える合図 */
class ApiUnavailable extends Error {}

async function getJSON(path: string, signal: AbortSignal): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)]),
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    // 呼び出し側が取り消したときは、そのまま伝える（サンプルデータには切り替えない）
    if (signal.aborted) throw error
    throw new ApiUnavailable('API に届かない')
  }
  // 静的なホスティングに画面だけ置いたときは、/api が 404 や HTML で返ってくる
  const type = response.headers.get('Content-Type') ?? ''
  if (!response.ok || !type.includes('application/json')) throw new ApiUnavailable(`API の応答が ${response.status}`)
  return response.json()
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

/** API の応答を信用しきらず、形を確かめてから使う */
function toTech(value: unknown): Tech {
  if (!isRecord(value) || typeof value.id !== 'number' || typeof value.name !== 'string' || typeof value.score !== 'number') {
    throw new ApiUnavailable('API の応答の形が違う')
  }
  return {
    id: value.id,
    name: value.name,
    description: typeof value.description === 'string' ? value.description : '',
    score: value.score,
    // level は API が返すが、付いていなければ同じ決まりで計算する
    level: levelOf(value.score),
  }
}

function toStats(value: unknown): Stats {
  if (!isRecord(value) || typeof value.count !== 'number' || typeof value.average !== 'number' || !isRecord(value.levels)) {
    throw new ApiUnavailable('API の応答の形が違う')
  }
  const levels = value.levels
  const count = (level: Level) => {
    const found = levels[level]
    return typeof found === 'number' ? found : 0
  }
  return {
    count: value.count,
    average: value.average,
    min: typeof value.min === 'number' ? value.min : 0,
    max: typeof value.max === 'number' ? value.max : 0,
    levels: { fiction: count('fiction'), emerging: count('emerging'), reality: count('reality') },
  }
}

function sampleBoard(query: TechQuery): Board {
  return { techs: applyQuery(SAMPLE_TECHS, query), stats: statsOf(SAMPLE_TECHS), source: 'sample' }
}

/**
 * 条件に合う一覧と、全体の集計を取る。
 * API につながらなければ、同じ条件をサンプルデータに当てて返す（画面は止めない）。
 */
export async function loadBoard(query: TechQuery, signal: AbortSignal, prefer: Source = 'api'): Promise<Board> {
  if (prefer === 'sample') return sampleBoard(query)
  try {
    const [list, stats] = await Promise.all([
      getJSON(`/api/v1/techs?${apiParams(query)}`, signal),
      getJSON('/api/v1/stats', signal),
    ])
    if (!Array.isArray(list)) throw new ApiUnavailable('API の応答の形が違う')
    return { techs: list.map(toTech), stats: toStats(stats), source: 'api' }
  } catch (error) {
    if (error instanceof ApiUnavailable) return sampleBoard(query)
    throw error
  }
}

/** どれか 1 件を引く。API なら /techs/random、サンプルなら手元で選ぶ */
export async function drawRandom(source: Source, signal: AbortSignal): Promise<Tech> {
  if (source === 'api') {
    try {
      return toTech(await getJSON('/api/v1/techs/random', signal))
    } catch (error) {
      if (!(error instanceof ApiUnavailable)) throw error
    }
  }
  return SAMPLE_TECHS[Math.floor(Math.random() * SAMPLE_TECHS.length)]
}
