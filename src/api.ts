import type { Tech } from './types'

// Tech一覧を取得する(1件だけ)
// export async function getTech(id: number): Promise<Tech> {
//     const res = await fetch(`/api/v1/tech?id=${id}`)
//     if (!res.ok) throw new Error('Failed to fetch tech')
//     return res.json()
// }

// Tech一覧を取得する(全件)
export async function getTechs(): Promise<Tech[]> {
    const res = await fetch('/api/v1/techs')
    if (!res.ok) throw new Error('Failed to fetch techs')
    return res.json()
}