import { useEffect, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, Outlet } from '@tanstack/react-router'
import { useStore } from './store'
import { useMedia, useWidth } from './hooks'
import { CardBox, HeaderBox, Scaled, Sheet } from './Sheet'
import { exportDocx, exportPng } from './exporters'
import { ALL_ITEMS, CARDS, HEADER, SHEET_H, SHEET_W, resolveAll } from './layout'

export const useMobile = () => useMedia('(max-width: 820px)')

function useExports() {
  const notify = useStore((s) => s.notify)
  const png = useMutation({ mutationFn: ({ t, n }: { t: Record<string, string>; n?: string }) => exportPng(t, n), onSuccess: () => notify('PNG exported (1131×1600)'), onError: (e) => notify('PNG export failed: ' + (e as Error).message) })
  const docx = useMutation({ mutationFn: ({ t, n }: { t: Record<string, string>; n?: string }) => exportDocx(t, n), onSuccess: () => notify('DOCX exported'), onError: (e) => notify('DOCX export failed: ' + (e as Error).message) })
  return { png, docx }
}

export function Root() {
  const toast = useStore((s) => s.toast)
  return (
    <div className="app">
      <nav className="nav">
        <b>Kartu Data Sastra</b>
        <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: 'on' }}>Editor</Link>
        <Link to="/compare" activeProps={{ className: 'on' }}>Snapshots</Link>
      </nav>
      <Outlet />
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export function EditorPage() {
  const mobile = useMobile()
  const { texts, setText, saveSnapshot, resetAll, snapshots } = useStore()
  const { png, docx } = useExports()
  const t = resolveAll(texts)
  return (
    <>
      <div className="bar">
        <button onClick={() => saveSnapshot()}>📸 Snapshot{snapshots.length ? ` (${snapshots.length})` : ''}</button>
        <button disabled={png.isPending} onClick={() => png.mutate({ t })}>{png.isPending ? 'Exporting…' : '⬇ PNG'}</button>
        <button disabled={docx.isPending} onClick={() => docx.mutate({ t })}>{docx.isPending ? 'Exporting…' : '⬇ DOCX'}</button>
        <button className="ghost" onClick={() => confirm('Reset all text to the original?') && resetAll()}>Reset</button>
      </div>
      {mobile ? <Pager t={t} onChange={setText} /> : <Desktop t={t} onChange={setText} />}
    </>
  )
}

function Desktop({ t, onChange }: { t: Record<string, string>; onChange: (id: string, v: string) => void }) {
  const [ref, w] = useWidth<HTMLDivElement>()
  const scale = Math.min(1, Math.max(0.3, (w - 32) / SHEET_W))
  return (
    <div ref={ref} className="stage">
      <div className="hint">Click any text to edit · changes save automatically</div>
      <Scaled scale={scale} w={SHEET_W} h={SHEET_H}>
        <div className="paper"><Sheet texts={t} onChange={onChange} /></div>
      </Scaled>
    </div>
  )
}

type Slide = { key: string; label: string; w: number; h: number; idx: number }
const SLIDES: Slide[] = [
  { key: 'h', label: 'Header', w: SHEET_W, h: HEADER.h, idx: 0 },
  ...CARDS.map((c, i) => ({ key: c.key, label: `${c.n}. ${c.title.text}`, w: c.w, h: c.h, idx: i + 1 })),
]

function Pager({ t, onChange }: { t: Record<string, string>; onChange: (id: string, v: string) => void }) {
  const { slide, setSlide, zoom, setZoom } = useStore()
  const i = Math.min(Math.max(slide, 0), SLIDES.length - 1)
  const s = SLIDES[i]
  const [ref, w] = useWidth<HTMLDivElement>()
  const fit = Math.max(0.2, (w - 28) / s.w)
  const scale = zoom === 'fit' ? fit : zoom === '100' ? 1 : 1.5
  const go = (d: number) => setSlide(Math.min(SLIDES.length - 1, Math.max(0, i + d)))
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).isContentEditable) return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  })
  const next = () => setZoom(zoom === 'fit' ? '100' : zoom === '100' ? '150' : 'fit')
  return (
    <div className="pager">
      <div className="pager-top">
        <select value={i} onChange={(e) => setSlide(+e.target.value)}>
          {SLIDES.map((x) => <option key={x.key} value={x.idx}>{x.label}</option>)}
        </select>
        <button className="ghost" onClick={next}>🔍 {zoom === 'fit' ? 'Fit' : zoom === '100' ? '100%' : '150%'}</button>
      </div>
      <div ref={ref} className="slide-wrap">
        <Scaled scale={scale} w={s.w} h={s.h}>
          <div className="paper" style={i ? { borderRadius: 30, overflow: "hidden" } : undefined}>
            {i === 0 ? <HeaderBox texts={t} onChange={onChange} /> : <CardBox def={CARDS[i - 1]} texts={t} onChange={onChange} />}
          </div>
        </Scaled>
      </div>
      <div className="pager-bar">
        <button disabled={i === 0} onClick={() => go(-1)}>‹ Prev</button>
        <span>{i + 1} / {SLIDES.length}</span>
        <button disabled={i === SLIDES.length - 1} onClick={() => go(1)}>Next ›</button>
      </div>
    </div>
  )
}

/* ---------------- Snapshots & compare ---------------- */

const fmt = (n: number) => new Date(n).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })

export function ComparePage() {
  const { snapshots, texts, compare, setCompare, renameSnapshot, deleteSnapshot, restoreSnapshot, saveSnapshot } = useStore()
  const { png, docx } = useExports()
  const mobile = useMobile()
  const [view, setView] = useState<'changes' | 'visual'>('changes')
  const [ref, w] = useWidth<HTMLDivElement>()
  const live = resolveAll(texts)
  const ok = (id: string) => id === 'current' || snapshots.some((s) => s.id === id)
  const aId = ok(compare.a) && compare.a !== 'current' ? compare.a : snapshots[0]?.id ?? 'current'
  const bId = ok(compare.b) ? compare.b : 'current'
  const get = (id: string) => (id === 'current' ? live : resolveAll(snapshots.find((s) => s.id === id)?.texts ?? {}))
  const A = get(aId), B = get(bId)
  const changed = useMemo(() => new Set(ALL_ITEMS.filter((it) => A[it.id] !== B[it.id]).map((it) => it.id)), [A, B])

  const groups = useMemo(() => {
    const out: { title: string; rows: { label: string; a: string; b: string }[] }[] = []
    const push = (title: string, ids: { id: string; label: string }[]) => {
      const rows = ids.filter((x) => changed.has(x.id)).map((x) => ({ label: x.label, a: A[x.id], b: B[x.id] }))
      if (rows.length) out.push({ title, rows })
    }
    push('Header', HEADER.items.filter((i) => !i.static).map((i) => ({ id: i.id, label: i.text.replace(/:$/, '') === A[i.id] ? i.id : i.id.replace('h.', '') })))
    for (const c of CARDS) {
      const labelOf = new Map(c.doc.filter((d) => d.l).map((d) => [d.v, B[d.l!]]))
      const ids = [c.title, ...(c.titleEm ? [c.titleEm] : []), ...c.items.filter((i) => !i.static)].map((i) => ({ id: i.id, label: i === c.title || i === c.titleEm ? 'Title' : labelOf.get(i.id) ?? (i.id.match(/\.l\d+$/) ? 'Label' : 'Text') }))
      push(`${c.n}. ${B[c.title.id]}`, ids)
    }
    return out
  }, [A, B, changed])

  const sideBySide = !mobile && w > 900
  const scale = sideBySide ? Math.min(1, (w - 16) / 2 / SHEET_W) : Math.min(1, (w - 8) / SHEET_W)
  const opts = [{ id: 'current', name: 'Current (live)' }, ...snapshots.map((s) => ({ id: s.id, name: s.name }))]
  const nameOf = (id: string) => opts.find((o) => o.id === id)?.name ?? ''

  return (
    <div className="cmp">
      <div className="bar">
        <button onClick={() => saveSnapshot()}>📸 New snapshot</button>
      </div>
      <h3>Saved snapshots</h3>
      {snapshots.length === 0 && <p className="muted">No snapshots yet. Hit “Snapshot” in the editor to save the current state, then compare versions here.</p>}
      <ul className="snaps">
        {snapshots.map((s) => (
          <li key={s.id}>
            <input value={s.name} onChange={(e) => renameSnapshot(s.id, e.target.value)} />
            <small>{fmt(s.createdAt)}</small>
            <span className="row">
              <button onClick={() => restoreSnapshot(s.id)}>Restore</button>
              <button disabled={png.isPending} onClick={() => png.mutate({ t: s.texts, n: s.name })}>PNG</button>
              <button disabled={docx.isPending} onClick={() => docx.mutate({ t: s.texts, n: s.name })}>DOCX</button>
              <button className="ghost" onClick={() => confirm(`Delete “${s.name}”?`) && deleteSnapshot(s.id)}>✕</button>
            </span>
          </li>
        ))}
      </ul>

      <h3>Compare</h3>
      <div className="pick">
        <label>Before <select value={aId} onChange={(e) => setCompare({ a: e.target.value })}>{opts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
        <label>After <select value={bId} onChange={(e) => setCompare({ b: e.target.value })}>{opts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
        <span className="seg">
          <button className={view === 'changes' ? 'on' : ''} onClick={() => setView('changes')}>Changes ({changed.size})</button>
          <button className={view === 'visual' ? 'on' : ''} onClick={() => setView('visual')}>Visual</button>
        </span>
      </div>

      <div ref={ref}>
        {view === 'changes' ? (
          groups.length === 0 ? <p className="muted">No differences between these two versions.</p> : (
            groups.map((g) => (
              <section key={g.title} className="grp">
                <h4>{g.title}</h4>
                {g.rows.map((r, i) => (
                  <div key={i} className="diff">
                    <em>{r.label}</em>
                    <del>{r.a || '∅'}</del>
                    <ins>{r.b || '∅'}</ins>
                  </div>
                ))}
              </section>
            ))
          )
        ) : (
          <div className={sideBySide ? 'duo' : 'solo'}>
            {[[aId, A], [bId, B]].map(([id, t], k) => (
              <div key={k}>
                <div className="cap">{k ? 'After' : 'Before'} · {nameOf(id as string)}</div>
                <Scaled scale={scale} w={SHEET_W} h={SHEET_H}><div className="paper"><Sheet texts={t as Record<string, string>} readOnly hl={changed} /></div></Scaled>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
