import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { resolveAll } from './layout'

export type Snapshot = { id: string; name: string; createdAt: number; texts: Record<string, string> }

type State = {
  texts: Record<string, string> // overrides on top of DEFAULTS
  snapshots: Snapshot[]
  slide: number
  zoom: 'fit' | '100' | '150'
  compare: { a: string; b: string }
  toast: string | null
  setText: (id: string, t: string) => void
  resetAll: () => void
  saveSnapshot: (name?: string) => void
  renameSnapshot: (id: string, name: string) => void
  deleteSnapshot: (id: string) => void
  restoreSnapshot: (id: string) => void
  setSlide: (n: number) => void
  setZoom: (z: State['zoom']) => void
  setCompare: (c: Partial<State['compare']>) => void
  notify: (msg: string) => void
}

let timer: ReturnType<typeof setTimeout> | undefined

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      texts: {},
      snapshots: [],
      slide: 0,
      zoom: 'fit',
      compare: { a: 'current', b: 'current' },
      toast: null,
      setText: (id, t) => set((s) => ({ texts: { ...s.texts, [id]: t } })),
      resetAll: () => set({ texts: {} }),
      saveSnapshot: (name) => {
        const n = get().snapshots.length + 1
        const now = new Date()
        const label = name || `Snapshot ${n} · ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
        const snap: Snapshot = { id: crypto.randomUUID(), name: label, createdAt: now.getTime(), texts: resolveAll(get().texts) }
        set((s) => ({ snapshots: [snap, ...s.snapshots] }))
        get().notify(`Saved “${label}”`)
      },
      renameSnapshot: (id, name) => set((s) => ({ snapshots: s.snapshots.map((x) => (x.id === id ? { ...x, name } : x)) })),
      deleteSnapshot: (id) => set((s) => ({ snapshots: s.snapshots.filter((x) => x.id !== id) })),
      restoreSnapshot: (id) => {
        const snap = get().snapshots.find((x) => x.id === id)
        if (!snap) return
        set({ texts: { ...snap.texts } })
        get().notify(`Restored “${snap.name}”`)
      },
      setSlide: (n) => set({ slide: n }),
      setZoom: (zoom) => set({ zoom }),
      setCompare: (c) => set((s) => ({ compare: { ...s.compare, ...c } })),
      notify: (msg) => {
        set({ toast: msg })
        clearTimeout(timer)
        timer = setTimeout(() => set({ toast: null }), 2600)
      },
    }),
    {
      name: 'kartu-sastra-v1',
      partialize: (s) => ({ texts: s.texts, snapshots: s.snapshots, slide: s.slide, zoom: s.zoom }),
    },
  ),
)
