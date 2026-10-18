// All coordinates are in PAGE pixels on the fixed 1131 x 1600 sheet, measured from the original design.
export const SHEET_W = 1131
export const SHEET_H = 1600
export const RED = '#d9505a'
export const INK = '#1a1a1a'

export type Item = {
  id: string; x: number; cy: number; text: string; size: number
  weight?: number; w?: number; lh?: number; family?: 'oswald'; color?: string
  align?: 'center'; italic?: boolean; sp?: string; static?: boolean
}
export type Deco = { x: number; y: number; w: number; h: number; kind: 'box' | 'vline' }
export type DocRow = { l?: string; v: string }
export type CardDef = {
  key: string; n: number; x: number; y: number; w: number; h: number
  badge: { cx: number; cy: number }
  title: Item; titleEm?: Item; items: Item[]; decos: Deco[]; doc: DocRow[]
}

type Base = { lx: number; lsz: number; cx: number; vx: number; vsz: number; bx: number; vlh?: number; llh?: number }
type R = {
  l: string; ly: number; v: string; vy: number; cy?: number; llh?: number
  vlh?: number; vsz?: number; vx?: number; vw?: number
}

function rows(k: string, b: Base, list: R[]) {
  const items: Item[] = []
  const doc: DocRow[] = []
  list.forEach((r, i) => {
    const vsz = r.vsz ?? b.vsz
    items.push({ id: `${k}.b${i}`, x: b.bx, cy: r.ly, text: '•', size: 16, static: true })
    items.push({ id: `${k}.l${i}`, x: b.lx, cy: r.ly, text: r.l, size: b.lsz, weight: 600, sp: '-0.045em', lh: r.llh ?? b.llh ?? Math.round(b.lsz * 1.4) })
    items.push({ id: `${k}.c${i}`, x: b.cx, cy: r.cy ?? r.ly, text: ':', size: vsz, weight: 600, static: true })
    items.push({ id: `${k}.v${i}`, x: r.vx ?? b.vx, cy: r.vy, text: r.v, size: vsz, lh: r.vlh ?? b.vlh ?? Math.round(vsz * 1.4), w: r.vw })
    doc.push({ l: `${k}.l${i}`, v: `${k}.v${i}` })
  })
  return { items, doc }
}

const title = (k: string, text: string, x: number, cy: number): Item => ({ id: `${k}.title`, x, cy, text, size: 25, weight: 600 })

const L = 72, R_ = 567, W = 491

// ---- 1 Identitas Karya
const c1 = rows('c1', { lx: 130, lsz: 19, cx: 255, vx: 268, vsz: 21, bx: 97 }, [
  { l: 'Judul', ly: 300, v: 'hikayat banjar', vy: 302 },
  { l: 'Pengarang', ly: 328, v: 'anonim', vy: 329 },
  { l: 'Tahun Terbit', ly: 355, v: 'abad ke 14 - abad ke 17', vy: 354 },
  { l: 'Penerbit', ly: 382, v: 'J.J. Tas (Hans Ras)', vy: 382 },
  { l: 'Genre', ly: 409, v: 'hikayat historiografi', vy: 411 },
  { l: 'Bentuk Karya', ly: 436, v: 'Hikayat', vy: 439 },
])

// ---- 2 Periode dan Konteks Awal
const c2 = rows('c2', { lx: 620, lsz: 19, cx: 800, vx: 811, vsz: 17, bx: 591, llh: 27 }, [
  { l: 'Pariode Sastra\n(berdasarkan model)', ly: 292, v: 'sastra Melayu klasik', vy: 292 },
  { l: 'Rentang Waktu', ly: 347, v: 'Abad ke-14 hingga abad ke-17', vy: 348, vsz: 15.5 },
  { l: 'Latar Sejarah', ly: 374, v: 'Akulturasi budaya lokal\nKalimantan', vy: 378, vlh: 20, vsz: 14.5, cy: 378 },
  { l: 'Konteks Awal\nKepenulisan', ly: 401, v: 'penulisan silsilah keturunan raja-raja\nBanjar untuk menjaga adat istiadat\ndan struktur kekuasaan kerajaan.', vy: 425, vlh: 18.5, vsz: 13.4, cy: 425 },
])

// ---- 3 Ringkasan Isi
const c3items: Item[] = [{
  id: 'c3.summary', x: 100, cy: 573, w: 440, size: 22.5, lh: 30.5, align: 'center',
  text: 'Mengisahkan tentang silsilah dan\nasal-usul para raja di Banjar, dari\nberdirinya Kerajaan Nagara Dipa,masa\npemerintahan Nagara Daha, hingga\nkonflik politik',
}]

// ---- 4 Tokoh dan Penokohan
const tokohNames = ['pangeran samudera', 'Lambung Mangkurat', 'Pangeran Tumenggung', 'Putri Junjung Buih', 'Patih Masih']
const tokohDesc = [
  'Bijaksana, gigih, berani, pantang menyerah,\ndan terbuka terhadap ajaran baru (Islam).',
  'Perkasa, sangat menjunjung tinggi adat,\npatuh pada tradisi, gagah berani, dan setia.',
  'Ambisius, keras kepala, tidak mau mengalah,\nnamun akhirnya berjiwa besar mau berdamai.',
  'Anggun, memiliki kesaktian/gaib,\ndihormati, dan bijaksana.',
  'Cerdas, loyal, berpandangan jauh kedepan\n(visioner), dan ahli strategi perang.',
]
const nameY = [577, 609, 641, 679, 711]
const numY = [579, 612, 646, 682, 716]
const descY = [571, 609, 645, 678, 713]
const c4items: Item[] = []
const c4doc: DocRow[] = []
tokohNames.forEach((n, i) => {
  c4items.push({ id: `c4.ln${i}`, x: 585, cy: nameY[i], text: `${i + 1}.`, size: 17, weight: 600, italic: true, static: true })
  c4items.push({ id: `c4.n${i}`, x: 601, cy: nameY[i] + 1, text: n, size: 14.5, w: 200 })
  c4items.push({ id: `c4.rn${i}`, x: 783, cy: numY[i], text: `${i + 1}.`, size: 17, weight: 700, static: true })
  c4items.push({ id: `c4.d${i}`, x: 806, cy: descY[i], text: tokohDesc[i], size: 10.8, lh: 14.5, w: 262 })
  c4doc.push({ l: `c4.n${i}`, v: `c4.d${i}` })
})

// ---- 5 Unsur Intrinsik
const c5 = rows('c5', { lx: 130, lsz: 19, cx: 275, vx: 290, vsz: 14, bx: 97, vlh: 18 }, [
  { l: 'Tema', ly: 841, v: 'Perebutan kekuasaan,', vy: 843, vsz: 14 },
  { l: 'Alur', ly: 868, v: 'Maju', vy: 870 },
  { l: 'Latar', ly: 895, v: 'Wilayah Banjar, abad 14-17, kental\nadat dan norma', vy: 889, vsz: 13 },
  { l: 'Sudut Pandang', ly: 922, v: 'Orang ketiga', vy: 924 },
  { l: 'Konflik', ly: 949, v: 'perebutan tahta', vy: 950 },
  { l: 'Amanat', ly: 976, v: 'Menjadi seorang pemimpin itu harus\nmenjalankan secara adil, dan bijaksana.', vy: 975, vsz: 13 },
])

// ---- 6 Gaya Bahasa dan Ciri Estetik
const c6r = rows('c6', { lx: 620, lsz: 19, cx: 770, vx: 781, vsz: 19, bx: 591, llh: 27 }, [
  { l: 'Ciri Gaya Bahasa', ly: 831, v: 'Bahasa Melayu Klasik', vy: 831, vsz: 18.5 },
  { l: 'Ciri Estetika\nKeindahan', ly: 858, v: 'menggabungkan mitos\ndengan fakta  sejarah lokal', vy: 857, vlh: 27, vsz: 19, vx: 782, cy: 857 },
])
const c6items: Item[] = [
  ...c6r.items,
  { id: 'c6.b2', x: 591, cy: 912, text: '•', size: 16, static: true },
  { id: 'c6.l2', x: 620, cy: 912, text: 'Kutipan Penting :', size: 19, weight: 600, sp: '-0.045em' },
  { id: 'c6.quote', x: 648, cy: 942, w: 372, size: 19, lh: 26, text: '"Maka Pangeran Samudera pun\ndirajakan oleh sekalian orang\nKuin dan Muara Bahan..."' },
]

// ---- 7 Tema Isu Penting
const c7 = rows('c7', { lx: 130, lsz: 19, cx: 292, vx: 305, vsz: 12.5, bx: 97, vlh: 18 }, [
  { l: 'Tema Utama', ly: 1107, v: 'Legitimasi takhta dan proses\nIslamisasi di Kesultanan Banjar.', vy: 1090 },
  { l: 'Tema', ly: 1134, v: 'Kepatuhan pada adat dan rasa\nsetia bawahan pada rajanya.', vy: 1125 },
  { l: 'Tambahan\nIsu-isu Penting', ly: 1161, v: 'Akulturasi Budaya dapat dilihat dari\npergeseran dan perpaduan budaya\nHindu-Jawa dengan ajaran Islam.', vy: 1162, llh: 27 },
])

// ---- 8 Relevansi dan Makna
const c8 = rows('c8', { lx: 622, lsz: 19, cx: 773, vx: 786, vsz: 15, bx: 593, llh: 27, vlh: 19.5 }, [
  { l: 'Makna Karya\npada Masanya', ly: 1114, v: 'Sebagai dokumen sejarah', vy: 1116 },
  { l: 'Relevansi pada\nMasa Kini', ly: 1168, v: 'identitas sejarah warga Kalimantan\nSelatan', vy: 1170, vlh: 19 },
  { l: 'Catatan\nTambahan', ly: 1222, v: 'Karya ini menjadi salah satu petunjuk\ndalam mempelajari awal\npenyebaran Islam di Kalimantan', vy: 1224, vsz: 14.4 },
])

// ---- 9 Sumber Data
const c9 = rows('c9', { lx: 127, lsz: 19, cx: 290, vx: 299, vsz: 14, bx: 97, vlh: 18 }, [
  { l: 'Sumber Kutipan', ly: 1416, v: 'Buku hikayat banjar', vy: 1417 },
  { l: 'Halaman', ly: 1443, v: '412', vy: 1446, vx: 305 },
  { l: 'Edisi', ly: 1470, v: 'Edisi terjemahan', vy: 1473 },
  { l: 'Catatan', ly: 1497, v: 'Naskah asli menggunakan\naksara Arab-Melayu (Jawi).', vy: 1499 },
])

// ---- 10 Kata Kunci
const c10items: Item[] = [{
  id: 'c10.keywords', x: 629, cy: 1392, w: 380, size: 21, lh: 28,
  text: 'Hikayat Banjar, Sultan Suriansyah,\nNagara Dipa, Pangeran Samudera,\nHistoriografi Klasik.',
}]

export const CARDS: CardDef[] = [
  { key: 'c1', n: 1, x: L, y: 212, w: W, h: 265, badge: { cx: 101, cy: 242 }, title: title('c1', 'IDENTITAS KARYA', 130, 241), items: c1.items, decos: [], doc: c1.doc },
  { key: 'c2', n: 2, x: R_, y: 212, w: W, h: 265, badge: { cx: 591, cy: 239 }, title: title('c2', 'PARIODE DAN KONTEKS AWAL', 620, 238), items: c2.items, decos: [], doc: c2.doc },
  { key: 'c3', n: 3, x: L, y: 487, w: W, h: 263, badge: { cx: 101, cy: 513 }, title: title('c3', 'RINGKASAN ISI', 130, 512), items: c3items, decos: [{ x: 92, y: 544, w: 456, h: 191, kind: 'box' }], doc: [{ v: 'c3.summary' }] },
  { key: 'c4', n: 4, x: R_, y: 487, w: W, h: 263, badge: { cx: 591, cy: 513 }, title: title('c4', 'TOKOH DAN PENOKOHAN', 620, 512), items: c4items, decos: [{ x: 764, y: 548, w: 2, h: 190, kind: 'vline' }], doc: c4doc },
  { key: 'c5', n: 5, x: L, y: 760, w: W, h: 262, badge: { cx: 101, cy: 785 }, title: title('c5', 'UNSUR INTRINSIK', 130, 784), items: c5.items, decos: [], doc: c5.doc },
  { key: 'c6', n: 6, x: R_, y: 760, w: W, h: 262, badge: { cx: 591, cy: 786 }, title: title('c6', 'GAYA BAHASA DAN CIRI ESTETIK', 620, 786), items: c6items, decos: [{ x: 621, y: 929, w: 406, h: 81, kind: 'box' }], doc: [...c6r.doc, { l: 'c6.l2', v: 'c6.quote' }] },
  { key: 'c7', n: 7, x: L, y: 1033, w: W, h: 262, badge: { cx: 99, cy: 1058 }, title: title('c7', 'TEMA ISU PENTING', 130, 1058), items: c7.items, decos: [], doc: c7.doc },
  { key: 'c8', n: 8, x: R_, y: 1033, w: W, h: 262, badge: { cx: 591, cy: 1058 }, title: title('c8', 'RELEVANSI DAN MAKNA', 620, 1058), items: c8.items, decos: [], doc: c8.doc },
  { key: 'c9', n: 9, x: L, y: 1306, w: W, h: 265, badge: { cx: 99, cy: 1331 }, title: title('c9', 'SUMBER DATA', 130, 1331), items: c9.items, decos: [], doc: c9.doc },
  { key: 'c10', n: 10, x: R_, y: 1306, w: W, h: 265, badge: { cx: 589, cy: 1331 }, title: title('c10', 'KATA KUNCI', 620, 1330), titleEm: { id: 'c10.titleEm', x: 0, cy: 0, text: '(3-5 KATA)', size: 25, weight: 600, italic: true }, items: c10items, decos: [{ x: 612, y: 1364, w: 405, h: 180, kind: 'box' }], doc: [{ v: 'c10.keywords' }] },
]

export const HEADER = {
  h: 190,
  items: [
    { id: 'h.t1', x: 0, cy: 70, w: SHEET_W, text: 'Kartu Data Karya Sastra Indonesia', size: 40, weight: 700, family: 'oswald', color: '#d12f3d', align: 'center', sp: '0.005em', lh: 44 },
    { id: 'h.t2', x: 0, cy: 109, w: SHEET_W, text: 'S1 Sastra Indonesia Kelas 2026B', size: 40, weight: 700, family: 'oswald', color: '#d12f3d', align: 'center', sp: '0.005em', lh: 44 },
    { id: 'h.nimL', x: 30, cy: 171, text: 'Nama/NIM:', size: 18, weight: 700, color: '#fff', lh: 28 },
    { id: 'h.nim', x: 150, cy: 171, text: 'Nurul Ilmas sholikah (095)', size: 24, weight: 400, color: '#fff', lh: 30 },
    { id: 'h.sep', x: 558, cy: 171, text: '|', size: 22, weight: 400, color: '#fff', static: true, lh: 30 },
    { id: 'h.dosen', x: 641, cy: 170, text: 'Dosen Pengampu: Dr. Ririe Rengganis M.Hum.', size: 18, weight: 700, color: '#fff', lh: 28 },
  ] as Item[],
}

export const ALL_ITEMS: Item[] = [
  ...HEADER.items,
  ...CARDS.flatMap((c) => [c.title, ...(c.titleEm ? [c.titleEm] : []), ...c.items]),
].filter((i) => !i.static)

export const DEFAULTS: Record<string, string> = Object.fromEntries(ALL_ITEMS.map((i) => [i.id, i.text]))
export const resolveAll = (o: Record<string, string>) => ({ ...DEFAULTS, ...o })
