// 画面と API で共通の、テクノロジーの型と決まりごと。
// 絞り込み・並べ替え・集計は、API（sf-meter-api）と同じ結果になるように書いてある。
// API につながらないときは、ここの関数でサンプルデータを同じように処理する。

export type Level = 'fiction' | 'emerging' | 'reality'

export type Tech = {
  id: number
  name: string
  description: string
  /** 実現度。0〜100 */
  score: number
  level: Level
}

export type SortKey = 'id' | 'score' | '-score' | 'name'

export type TechQuery = {
  /** 名前か説明に含まれる文字 */
  q: string
  /** 段階で絞り込む。'all' なら絞り込まない */
  level: Level | 'all'
  sort: SortKey
}

export type Stats = {
  count: number
  average: number
  min: number
  max: number
  levels: Record<Level, number>
}

export const LEVELS: readonly Level[] = ['fiction', 'emerging', 'reality']

/** 段階ごとの、実現度の範囲（両端を含む）・呼び名（short は、幅の狭い所に出す短い呼び名）・色 */
export const LEVEL_INFO: Record<Level, { min: number; max: number; label: string; short: string; color: string }> = {
  fiction: { min: 0, max: 29, label: 'まだ SF', short: 'まだ SF', color: '#ff7088' },
  emerging: { min: 30, max: 69, label: '研究が進んでいる', short: '研究中', color: '#ffc857' },
  reality: { min: 70, max: 100, label: 'ほぼ現実', short: 'ほぼ現実', color: '#62e6a0' },
}

export const SORT_LABELS: Record<SortKey, string> = {
  '-score': '実現度の高い順',
  score: '実現度の低い順',
  name: '名前順',
  id: '登録した順',
}

export const DEFAULT_QUERY: TechQuery = { q: '', level: 'all', sort: '-score' }

/** 実現度から段階を決める。API の domain.Tech.Level と同じ区切り */
export function levelOf(score: number): Level {
  if (score >= LEVEL_INFO.reality.min) return 'reality'
  if (score >= LEVEL_INFO.emerging.min) return 'emerging'
  return 'fiction'
}

/** 文字コード順の比較。API（Go の strings.Compare、PostgreSQL の COLLATE "C"）と同じ並びにするため、localeCompare は使わない */
function compareByCodePoint(a: string, b: string): number {
  const left = Array.from(a)
  const right = Array.from(b)
  const length = Math.min(left.length, right.length)
  for (let index = 0; index < length; index++) {
    const diff = left[index].codePointAt(0)! - right[index].codePointAt(0)!
    if (diff !== 0) return diff
  }
  return left.length - right.length
}

/** 条件に合うものだけを、指定の順に並べて返す（元の配列は変えない） */
export function applyQuery(techs: readonly Tech[], query: TechQuery): Tech[] {
  const keyword = query.q.trim().toLowerCase()
  const range = query.level === 'all' ? { min: 0, max: 100 } : LEVEL_INFO[query.level]

  const matched = techs.filter((tech) => {
    if (tech.score < range.min || tech.score > range.max) return false
    if (keyword === '') return true
    return tech.name.toLowerCase().includes(keyword) || tech.description.toLowerCase().includes(keyword)
  })

  return matched.sort((a, b) => {
    let order = 0
    if (query.sort === 'score') order = a.score - b.score
    else if (query.sort === '-score') order = b.score - a.score
    else if (query.sort === 'name') order = compareByCodePoint(a.name, b.name)
    // 同じ値どうしは ID 順にして、結果がぶれないようにする
    return order !== 0 ? order : a.id - b.id
  })
}

/** 全体の集計。平均は小数第 1 位まで */
export function statsOf(techs: readonly Tech[]): Stats {
  const levels: Record<Level, number> = { fiction: 0, emerging: 0, reality: 0 }
  if (techs.length === 0) return { count: 0, average: 0, min: 0, max: 0, levels }

  let sum = 0
  let min = techs[0].score
  let max = techs[0].score
  for (const tech of techs) {
    sum += tech.score
    min = Math.min(min, tech.score)
    max = Math.max(max, tech.score)
    levels[levelOf(tech.score)]++
  }
  return { count: techs.length, average: Math.round((sum / techs.length) * 10) / 10, min, max, levels }
}

const isSortKey = (value: string | null): value is SortKey => value !== null && value in SORT_LABELS
const isLevel = (value: string | null): value is Level => value !== null && value in LEVEL_INFO

/** URL の ?q=&level=&sort= から条件を読む。知らない値は既定値に戻す */
export function queryFromSearch(search: string): TechQuery {
  const params = new URLSearchParams(search)
  const level = params.get('level')
  const sort = params.get('sort')
  return {
    q: (params.get('q') ?? '').slice(0, 100),
    level: isLevel(level) ? level : DEFAULT_QUERY.level,
    sort: isSortKey(sort) ? sort : DEFAULT_QUERY.sort,
  }
}

/** 条件を URL のクエリ文字列にする。既定値と同じ項目は書かない（URL を短く保つ） */
export function searchFromQuery(query: TechQuery): string {
  const params = new URLSearchParams()
  if (query.q.trim() !== '') params.set('q', query.q.trim())
  if (query.level !== DEFAULT_QUERY.level) params.set('level', query.level)
  if (query.sort !== DEFAULT_QUERY.sort) params.set('sort', query.sort)
  const text = params.toString()
  return text === '' ? '' : `?${text}`
}

/** API に渡すクエリ文字列を組み立てる */
export function apiParams(query: TechQuery): string {
  const params = new URLSearchParams({ sort: query.sort, limit: '100' })
  if (query.q.trim() !== '') params.set('q', query.q.trim())
  if (query.level !== 'all') {
    params.set('min_score', String(LEVEL_INFO[query.level].min))
    params.set('max_score', String(LEVEL_INFO[query.level].max))
  }
  return params.toString()
}
