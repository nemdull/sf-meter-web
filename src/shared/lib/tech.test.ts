import { describe, expect, it } from 'vitest'

import { SAMPLE_TECHS } from '@/shared/data/sample'

import {
  DEFAULT_QUERY,
  apiParams,
  applyQuery,
  levelOf,
  queryFromSearch,
  searchFromQuery,
  statsOf,
  type Tech,
  type TechQuery,
} from './tech'

const names = (techs: Tech[]) => techs.map((tech) => tech.name)
const query = (patch: Partial<TechQuery>): TechQuery => ({ ...DEFAULT_QUERY, ...patch })

describe('levelOf', () => {
  it.each([
    [0, 'fiction'],
    [29, 'fiction'],
    [30, 'emerging'],
    [69, 'emerging'],
    [70, 'reality'],
    [100, 'reality'],
  ] as const)('実現度 %i は %s', (score, level) => {
    expect(levelOf(score)).toBe(level)
  })
})

// ここの期待値は、API 側のテスト（sf-meter-api の presentation/handler_test.go）と同じにしてある。
// API につながらないときにサンプルデータへ切り替えても、同じ条件なら同じ結果になることを確かめる
describe('applyQuery（API と同じ結果になること）', () => {
  it('実現度の高い順の先頭 3 件', () => {
    expect(names(applyQuery(SAMPLE_TECHS, query({ sort: '-score' }))).slice(0, 3)).toEqual([
      'シビラシステム',
      '量子暗号通信',
      'ニューラルリンク',
    ])
  })

  it('実現度の低い順の 3・4 件目', () => {
    expect(names(applyQuery(SAMPLE_TECHS, query({ sort: 'score' }))).slice(2, 4)).toEqual(['反重力エンジン', 'AI人格移植'])
  })

  it('文字で絞り込む（名前と説明の両方を見る）', () => {
    expect(names(applyQuery(SAMPLE_TECHS, query({ q: '通信', sort: 'id' })))).toEqual(['ホログラム通信', '量子暗号通信'])
  })

  it('英字は大文字と小文字を区別しない', () => {
    expect(names(applyQuery(SAMPLE_TECHS, query({ q: 'bci' })))).toEqual(['ニューラルリンク'])
  })

  it('当たらなければ空', () => {
    expect(applyQuery(SAMPLE_TECHS, query({ q: 'ワープ' }))).toEqual([])
  })

  it('段階で絞り込む', () => {
    expect(names(applyQuery(SAMPLE_TECHS, query({ level: 'reality', sort: 'id' })))).toEqual([
      'シビラシステム',
      'ニューラルリンク',
      'ホログラム通信',
      '量子暗号通信',
    ])
    expect(applyQuery(SAMPLE_TECHS, query({ level: 'fiction' }))).toHaveLength(5)
    expect(applyQuery(SAMPLE_TECHS, query({ level: 'emerging' }))).toHaveLength(6)
  })

  it('名前順は文字コード順（英字 → カタカナ → 漢字）', () => {
    const sorted = names(applyQuery(SAMPLE_TECHS, query({ sort: 'name' })))
    expect(sorted[0]).toBe('AI人格移植')
    expect(sorted.at(-1)).toBe('量子暗号通信')
  })

  it('同じ実現度どうしは ID 順で、結果がぶれない', () => {
    const tied: Tech[] = [
      { id: 3, name: 'c', description: '', score: 50, level: 'emerging' },
      { id: 1, name: 'a', description: '', score: 50, level: 'emerging' },
      { id: 2, name: 'b', description: '', score: 50, level: 'emerging' },
    ]
    expect(applyQuery(tied, query({ sort: '-score' })).map((tech) => tech.id)).toEqual([1, 2, 3])
    expect(applyQuery(tied, query({ sort: 'score' })).map((tech) => tech.id)).toEqual([1, 2, 3])
  })

  it('元の配列は並べ替えない', () => {
    const before = names([...SAMPLE_TECHS])
    applyQuery(SAMPLE_TECHS, query({ sort: 'name' }))
    expect(names([...SAMPLE_TECHS])).toEqual(before)
  })
})

describe('statsOf', () => {
  it('サンプルデータの集計が、API の /stats と同じになる', () => {
    expect(statsOf(SAMPLE_TECHS)).toEqual({
      count: 15,
      average: 46.9,
      min: 1,
      max: 91,
      levels: { fiction: 5, emerging: 6, reality: 4 },
    })
  })

  it('0 件のときは、すべて 0', () => {
    expect(statsOf([])).toEqual({ count: 0, average: 0, min: 0, max: 0, levels: { fiction: 0, emerging: 0, reality: 0 } })
  })
})

describe('URL との行き来', () => {
  it('既定の条件は、URL に何も書かない', () => {
    expect(searchFromQuery(DEFAULT_QUERY)).toBe('')
  })

  it('書いた条件は、読み戻すと同じになる', () => {
    const original = query({ q: '通信', level: 'reality', sort: 'name' })
    expect(queryFromSearch(searchFromQuery(original))).toEqual(original)
  })

  it('知らない値は、既定値に戻す', () => {
    expect(queryFromSearch('?level=galaxy&sort=price')).toEqual(DEFAULT_QUERY)
  })

  it('長すぎる検索の文字は 100 文字で切る', () => {
    expect(queryFromSearch(`?q=${'a'.repeat(300)}`).q).toHaveLength(100)
  })
})

describe('apiParams', () => {
  it('段階を、API の min_score / max_score に直す', () => {
    const params = new URLSearchParams(apiParams(query({ level: 'emerging', q: ' ナノ ', sort: 'score' })))
    expect(Object.fromEntries(params)).toEqual({ sort: 'score', limit: '100', q: 'ナノ', min_score: '30', max_score: '69' })
  })

  it('絞り込みが無ければ、並び順と件数だけ', () => {
    expect(apiParams(DEFAULT_QUERY)).toBe('sort=-score&limit=100')
  })
})
