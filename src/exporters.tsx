import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { toPng } from 'html-to-image'
import { saveAs } from 'file-saver'
import {
  AlignmentType, BorderStyle, Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType,
} from 'docx'
import { Sheet, type Texts } from './Sheet'
import { CARDS, SHEET_H, SHEET_W, resolveAll } from './layout'

const stamp = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')

export async function exportPng(texts: Texts, label = 'kartu-sastra') {
  const host = document.createElement('div')
  host.style.cssText = `position:fixed;left:-20000px;top:0;width:${SHEET_W}px;height:${SHEET_H}px;pointer-events:none`
  document.body.appendChild(host)
  const root = createRoot(host)
  try {
    flushSync(() => root.render(<Sheet texts={resolveAll(texts)} readOnly />))
    await Promise.all(['400 20px Poppins', '500 20px Poppins', '600 20px Poppins', '700 20px Poppins', '700 20px Oswald'].map((f) => document.fonts.load(f)))
    await document.fonts.ready
    await new Promise((r) => setTimeout(r, 120))
    const url = await toPng(host.firstElementChild as HTMLElement, { width: SHEET_W, height: SHEET_H, pixelRatio: 1, cacheBust: true })
    const blob = await (await fetch(url)).blob()
    saveAs(blob, `${label.replace(/[^\w-]+/g, '_')}-${stamp()}.png`)
  } finally {
    root.unmount()
    host.remove()
  }
}

const runs = (text: string, o: { bold?: boolean; size?: number; color?: string } = {}) =>
  text.split('\n').map((line, i) => new TextRun({ text: line, break: i ? 1 : 0, bold: o.bold, size: o.size ?? 22, color: o.color, font: 'Calibri' }))

const thin = { style: BorderStyle.SINGLE, size: 4, color: 'E5C4C7' }
const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }

export async function exportDocx(texts: Texts, label = 'kartu-sastra') {
  const t = resolveAll(texts)
  const children: (Paragraph | Table)[] = [
    new Paragraph({ alignment: AlignmentType.CENTER, children: runs(`${t['h.t1']}\n${t['h.t2']}`, { bold: true, size: 36, color: 'D12F3D' }) }),
    new Paragraph({ spacing: { before: 160, after: 120 }, children: [...runs(`${t['h.nimL']} `, { bold: true }), ...runs(t['h.nim']), ...runs('    |    '), ...runs(t['h.dosen'], { bold: true })] }),
  ]
  for (const c of CARDS) {
    const title = [t[c.title.id], c.titleEm ? t[c.titleEm.id] : ''].filter(Boolean).join(' ')
    children.push(new Paragraph({ spacing: { before: 280, after: 80 }, keepNext: true, children: runs(`${c.n}. ${title}`, { bold: true, size: 26, color: 'D9505A' }) }))
    const cell = (text: string, w: number, bold = false, span?: number) =>
      new TableCell({
        width: { size: w, type: WidthType.PERCENTAGE }, columnSpan: span,
        borders: { top: none, left: none, right: none, bottom: thin },
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
        children: [new Paragraph({ children: runs(text, { bold }) })],
      })
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: c.doc.map((r) => new TableRow({ children: r.l ? [cell(t[r.l], 32, true), cell(t[r.v], 68)] : [cell(t[r.v], 100, false, 2)] })),
      }),
    )
  }
  const doc = new Document({
    creator: 'Kartu Sastra',
    sections: [{ properties: { page: { margin: { top: 900, bottom: 900, left: 1000, right: 1000 } } }, children }],
  })
  saveAs(await Packer.toBlob(doc), `${label.replace(/[^\w-]+/g, '_')}-${stamp()}.docx`)
}
