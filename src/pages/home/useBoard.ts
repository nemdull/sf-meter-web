import { useCallback, useEffect, useState } from 'react'

import { loadBoard, type Board, type Source } from '@/shared/api/techs'
import type { TechQuery } from '@/shared/lib/tech'

/** 値が落ち着くまで待ってから返す。1 文字打つたびに API を呼ばないため */
function useDebounced<T>(value: T, delayMs: number): T {
  const [settled, setSettled] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])
  return settled
}

type BoardState = {
  board: Board | null
  loading: boolean
  /** API にもサンプルにも切り替えられない、想定外の失敗 */
  failed: boolean
}

/**
 * 条件に合う一覧と集計を読み込む。
 * 一度サンプルデータに切り替わったら、つなぎ直すまでは API を呼ばない（毎回タイムアウトを待たせないため）。
 */
export function useBoard(query: TechQuery) {
  const [state, setState] = useState<BoardState>({ board: null, loading: true, failed: false })
  const [prefer, setPrefer] = useState<Source>('api')
  const [attempt, setAttempt] = useState(0)

  // 文字の入力だけ少し待つ。段階と並び順は、押したらすぐ反映する
  const q = useDebounced(query.q, 250)
  const { level, sort } = query

  useEffect(() => {
    const controller = new AbortController()
    setState((current) => ({ ...current, loading: true, failed: false }))
    loadBoard({ q, level, sort }, controller.signal, prefer)
      .then((board) => {
        setState({ board, loading: false, failed: false })
        if (board.source === 'sample') setPrefer('sample')
      })
      .catch(() => {
        // 条件が変わって取り消したぶんは、失敗として扱わない
        if (!controller.signal.aborted) setState((current) => ({ ...current, loading: false, failed: true }))
      })
    return () => controller.abort()
  }, [q, level, sort, prefer, attempt])

  const reconnect = useCallback(() => {
    setPrefer('api')
    setAttempt((count) => count + 1)
  }, [])

  return { ...state, reconnect }
}
