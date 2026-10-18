import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import headerBg from './header-bg.jpg'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import '@fontsource/oswald/700.css'
import { CARDS, HEADER, INK, RED, SHEET_H, SHEET_W, type CardDef, type Item } from './layout'

export type Texts = Record<string, string>
type Common = { texts: Texts; readOnly?: boolean; hl?: Set<string>; onChange?: (id: string, t: string) => void }

function Ed({ text, onChange, style, readOnly, changed }: { text: string; onChange?: (t: string) => void; style: CSSProperties; readOnly?: boolean; changed?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (el && document.activeElement !== el && el.innerText !== text) el.innerText = text
  }, [text, readOnly])
  const st = changed ? { ...style, background: 'rgba(250,204,21,.55)', borderRadius: 3 } : style
  if (readOnly || !onChange) return <div style={st}>{text}</div>
  return (
    <div
      ref={ref}
      className="ed"
      style={st}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck={false}
      onInput={(e) => onChange(e.currentTarget.innerText.replace(/\n$/, ''))}
      onBlur={() => { if (ref.current) ref.current.innerText = text }}
    />
  )
}

function itemStyle(it: Item, ox: number, oy: number, right: number): CSSProperties {
  const lh = it.lh ?? Math.round(it.size * 1.4)
  return {
    position: 'absolute', left: it.x - ox, top: it.cy - oy - lh / 2,
    width: it.w ?? (it.static ? undefined : right - it.x + 40),
    fontFamily: it.family === 'oswald' ? 'Oswald, sans-serif' : 'Poppins, sans-serif',
    fontSize: it.size, fontWeight: it.weight ?? 400, lineHeight: `${lh}px`,
    color: it.color ?? INK, textAlign: it.align, fontStyle: it.italic ? 'italic' : undefined,
    letterSpacing: it.sp, whiteSpace: it.static ? 'pre' : 'pre-wrap',
  }
}

function Txt({ it, ox, oy, right, texts, readOnly, hl, onChange }: Common & { it: Item; ox: number; oy: number; right: number }) {
  const text = it.static ? it.text : texts[it.id] ?? it.text
  return <Ed text={text} readOnly={readOnly || it.static} style={itemStyle(it, ox, oy, right)} changed={hl?.has(it.id)} onChange={onChange && !it.static ? (t) => onChange(it.id, t) : undefined} />
}

export function CardBox({ def, ...c }: Common & { def: CardDef }) {
  const right = def.x + def.w
  const t = def.title
  const ed = (it: Item, style: CSSProperties) => (
    <Ed text={c.texts[it.id] ?? it.text} readOnly={c.readOnly} style={style} changed={c.hl?.has(it.id)} onChange={c.onChange ? (v) => c.onChange!(it.id, v) : undefined} />
  )
  const ts = (it: Item): CSSProperties => ({ fontFamily: 'Poppins, sans-serif', fontSize: it.size, fontWeight: it.weight, lineHeight: '30px', color: INK, whiteSpace: 'pre', fontStyle: it.italic ? 'italic' : undefined })
  return (
    <div style={{ position: 'relative', width: def.w, height: def.h, background: '#fff' }}>
      <div style={{ position: 'absolute', inset: 0, border: `4px solid ${RED}`, borderRadius: 30, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: def.badge.cx - def.x - 17, top: def.badge.cy - def.y - 17, width: 34, height: 34, borderRadius: 17, background: RED, color: '#fff', font: '700 18px Poppins, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{def.n}</div>
      <div style={{ position: 'absolute', left: t.x - def.x, top: t.cy - def.y - 16, height: 32, display: 'flex', alignItems: 'center', gap: 10, borderBottom: `2px solid ${INK}` }}>
        {ed(t, ts(t))}
        {def.titleEm && ed(def.titleEm, ts(def.titleEm))}
      </div>
      {def.decos.map((d, i) => (
        <div key={i} style={{ position: 'absolute', left: d.x - def.x, top: d.y - def.y, width: d.w, height: d.h, boxSizing: 'border-box', ...(d.kind === 'box' ? { border: `3px solid ${RED}`, borderRadius: 6 } : { background: RED }) }} />
      ))}
      {def.items.map((it) => <Txt key={it.id} it={it} ox={def.x} oy={def.y} right={right} {...c} />)}
    </div>
  )
}

export function HeaderBox(c: Common) {
  return (
    <div style={{ position: 'relative', width: SHEET_W, height: HEADER.h, background: '#fff' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: SHEET_W, height: 155, backgroundImage: `url(${headerBg})`, backgroundSize: '100% 100%' }} />
      <div style={{ position: 'absolute', left: 0, top: 155, width: SHEET_W, height: 35, background: RED }} />
      {HEADER.items.map((it) => <Txt key={it.id} it={it} ox={0} oy={0} right={SHEET_W} {...c} />)}
    </div>
  )
}

export function Sheet(c: Common) {
  return (
    <div style={{ position: 'relative', width: SHEET_W, height: SHEET_H, background: '#fff', overflow: 'hidden' }}>
      <HeaderBox {...c} />
      {CARDS.map((def) => (
        <div key={def.key} style={{ position: 'absolute', left: def.x, top: def.y }}>
          <CardBox def={def} {...c} />
        </div>
      ))}
    </div>
  )
}

export function Scaled({ scale, w, h, children }: { scale: number; w: number; h: number; children: React.ReactNode }) {
  return (
    <div style={{ width: w * scale, height: h * scale, position: 'relative', flex: 'none' }}>
      <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', left: 0, top: 0 }}>{children}</div>
    </div>
  )
}
