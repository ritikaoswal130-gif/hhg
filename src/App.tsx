import {
  useState, useRef, useCallback,
  type DragEvent, type PointerEvent as ReactPointerEvent, type ChangeEvent,
} from 'react'

/* ─── Tokens ──────────────────────────────────────────── */
const C = {
  sky:       '#081420',
  ocean:     '#0D2438',
  sand:      '#C4A878',
  gold:      '#D59D38',
  red:       '#FF0606',
  teal:      '#2F6670',
  tealLight: '#4A8E9A',
  pink:      '#DA0B5A',
  green:     '#1B7900',
  panel:     'rgba(7,16,30,0.82)',
  panelSolid:'#0A1628',
  glass:     'rgba(255,255,255,0.05)',
  border:    'rgba(255,255,255,0.11)',
  text:      '#E8DCC8',
  muted:     'rgba(232,220,200,0.48)',
  cream:     '#F5EDD8',
  navy:      '#061226',
}

type Page       = 'home' | 'pfp' | 'id'
type Format     = 'pfp' | 'id'
type StickerType = 'wave' | 'star' | 'palm' | 'sun' | 'anchor' | 'leaf'
type PanelElemType = 'petal' | 'blob' | 'ring' | 'leaf' | 'triangle' | 'squiggle'
interface Sticker  { id:string; type:StickerType; x:number; y:number; rotation:number; color:string }
interface PanelElem{ id:string; type:PanelElemType; x:number; y:number; rotation:number; color:string; scale:number }

const BUILDER_TITLES = [
  'Full-Stack Beach Bum','Shipper of the Tropics','Decentralized Surfer',
  'On-Chain Sunseeker','Smart Contract Coconut','dApp Drifter',
  'Proof-of-Vibe Engineer','Web3 Wave Rider','Coastal Chain Builder',
  'Layer-2 Lifeguard','Zero-Knowledge Zen Master','Consensus Coconut',
]
const ROLES = ['Frontend','Backend','Full-Stack','Web3 / Solidity','AI / ML','Product','Design','DevRel','Founder','Other']
const STICKER_COLORS = [C.gold, '#E8DCC8', C.pink, C.teal, '#88B09C','rgba(255,255,255,0.9)']
const PANEL_ELEM_COLORS = [C.gold, C.teal, C.pink, '#88B09C', C.cream, '#3A6BBF']

/* ═══════════════════════════════════════════════════════════
   BEACH SCENE ILLUSTRATION
═══════════════════════════════════════════════════════════ */
const STARS = Array.from({ length: 58 }, (_, i) => ({
  x: ((i * 137.508) % 100),
  y: ((i * 93.1 + 11) % 58),
  r: i % 5 === 0 ? 1.8 : i % 3 === 0 ? 1.2 : 0.75,
  o: 0.18 + (i % 8) * 0.09,
}))

function BeachScene({ compact = false }: { compact?: boolean }) {
  const W = 1400, H = compact ? 220 : 900
  const horizonY = compact ? H * 0.62 : H * 0.535
  const sandY    = compact ? H * 0.82 : H * 0.67

  /* Palms – left */
  const lpBase = [compact ? 80 : 140, H]
  const lpCrown= [compact ? 58 : 95, compact ? H * 0.25 : horizonY - 10]
  /* Palms – right */
  const rpBase = [W - (compact ? 80 : 140), H]
  const rpCrown= [W - (compact ? 58 : 95), compact ? H * 0.25 : horizonY - 10]

  const palmColor = '#04101E'

  function trunkPath(bx:number, by:number, cx:number, cy:number, w:number) {
    const mx = (bx + cx) / 2 + (cx > bx ? -8 : 8)
    const my = (by + cy) / 2
    return `M ${bx - w/2} ${by} Q ${mx - w/2} ${my} ${cx - w/2} ${cy} L ${cx + w/2} ${cy} Q ${mx + w/2} ${my} ${bx + w/2} ${by} Z`
  }

  function frond(cx:number, cy:number, a:number, len:number, w:number) {
    const rad = (a * Math.PI) / 180
    const tx = cx + Math.cos(rad) * len
    const ty = cy + Math.sin(rad) * len
    const perp = [-Math.sin(rad), Math.cos(rad)]
    const mid1x = cx + Math.cos(rad) * len * 0.35 + perp[0] * w
    const mid1y = cy + Math.sin(rad) * len * 0.35 + perp[1] * w
    const mid2x = cx + Math.cos(rad) * len * 0.35 - perp[0] * w
    const mid2y = cy + Math.sin(rad) * len * 0.35 - perp[1] * w
    return `M ${cx} ${cy} C ${mid1x} ${mid1y} ${tx} ${ty} ${tx} ${ty} C ${tx} ${ty} ${mid2x} ${mid2y} ${cx} ${cy} Z`
  }

  const leftFronds  = compact
    ? [[-145,80],[-115,65],[-90,58],[-60,68],[-40,80],[-20,92]] as [number,number][]
    : [[-145,90],[-120,75],[-95,65],[-70,72],[-45,80],[-15,88],[15,95]] as [number,number][]
  const rightFronds = leftFronds.map(([a, l]) => [180 + (180 - (a + 180)), l] as [number,number])

  const frondLen = compact ? 55 : 115
  const frondW   = compact ? 3.5 : 7

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio={compact ? 'xMidYMid slice' : 'xMidYMid slice'}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id={compact ? 'sky-c' : 'sky-f'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#060E1C"/>
          <stop offset="55%"  stopColor="#0D2035"/>
          <stop offset="85%"  stopColor="#153050"/>
          <stop offset="100%" stopColor="#1C3D5E"/>
        </linearGradient>
        <radialGradient id={compact ? 'hglow-c' : 'hglow-f'} cx="50%" cy="100%" r="55%">
          <stop offset="0%"   stopColor="#C88840" stopOpacity="0.28"/>
          <stop offset="100%" stopColor="#C88840" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id={compact ? 'ocean-c' : 'ocean-f'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#182E48"/>
          <stop offset="100%" stopColor="#0A1E30"/>
        </linearGradient>
        <linearGradient id={compact ? 'sand-c' : 'sand-f'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#7A6A52"/>
          <stop offset="30%"  stopColor="#A08C6A"/>
          <stop offset="100%" stopColor="#C4A878"/>
        </linearGradient>
        <linearGradient id={compact ? 'moonref-c' : 'moonref-f'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#D8C888" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#D8C888" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width={W} height={H} fill={`url(#${compact?'sky-c':'sky-f'})`}/>
      <rect width={W} height={H} fill={`url(#${compact?'hglow-c':'hglow-f'})`}/>

      {/* Stars */}
      {!compact && STARS.map((s, i) => (
        s.y < 52 && <circle key={i} cx={s.x / 100 * W} cy={s.y / 100 * H * 0.78} r={s.r} fill="white" opacity={s.o}/>
      ))}
      {compact && STARS.filter((_,i)=>i%2===0).map((s,i) => (
        s.y < 58 && <circle key={i} cx={s.x/100*W} cy={s.y/100*H*0.78} r={s.r*0.8} fill="white" opacity={s.o*0.8}/>
      ))}

      {/* Moon */}
      {!compact && <>
        <circle cx={1068} cy={108} r={26} fill="#E4D488" opacity="0.82"/>
        <circle cx={1082} cy={101} r={20} fill="#0D2035"/>
      </>}
      {compact && <>
        <circle cx={1180} cy={30} r={14} fill="#E4D488" opacity="0.75"/>
        <circle cx={1189} cy={27} r={11} fill="#0D2035"/>
      </>}

      {/* Horizon warm band */}
      <ellipse cx={W/2} cy={horizonY} rx={W * 0.42} ry={H * 0.038} fill="#C07030" opacity="0.13"/>

      {/* Ocean */}
      <rect x={0} y={horizonY} width={W} height={sandY - horizonY} fill={`url(#${compact?'ocean-c':'ocean-f'})`}/>

      {/* Far wave lines */}
      {[0.12, 0.28, 0.46, 0.62, 0.78].map((t, i) => {
        const y = horizonY + (sandY - horizonY) * t
        const amp = (sandY - horizonY) * 0.025
        return (
          <path key={i}
            d={`M0 ${y} Q${W*0.18} ${y - amp} ${W*0.36} ${y} Q${W*0.54} ${y+amp} ${W*0.72} ${y} Q${W*0.86} ${y-amp} ${W} ${y}`}
            fill="none" stroke={`rgba(180,200,220,${0.06 - i * 0.008})`} strokeWidth={1.2 - i * 0.1}/>
        )
      })}

      {/* Moon reflection in ocean */}
      <path d={`M ${W*0.735} ${horizonY + 4} L ${W*0.755} ${sandY - 4} L ${W*0.775} ${horizonY + 4}`}
        fill={`url(#${compact?'moonref-c':'moonref-f'})`}/>

      {/* Foam/shore line */}
      <path d={`M0 ${sandY} Q${W*0.22} ${sandY-14} ${W*0.44} ${sandY+8} Q${W*0.66} ${sandY+22} ${W} ${sandY-10}`}
        fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2.5"/>

      {/* Sand */}
      <path d={`M0 ${sandY} Q${W*0.22} ${sandY-14} ${W*0.44} ${sandY+8} Q${W*0.66} ${sandY+22} ${W} ${sandY-10} L${W} ${H} L0 ${H}Z`}
        fill={`url(#${compact?'sand-c':'sand-f'})`}/>

      {/* Wet sand strip */}
      <path d={`M0 ${sandY} Q${W*0.22} ${sandY-14} ${W*0.44} ${sandY+8} Q${W*0.66} ${sandY+22} ${W} ${sandY-10} Q${W} ${sandY+28} ${W*0.66} ${sandY+44} Q${W*0.44} ${sandY+30} ${W*0.22} ${sandY+12} Q0 ${sandY+32} 0 ${sandY}Z`}
        fill="#7A6550" opacity="0.55"/>

      {/* Left palm */}
      <path d={trunkPath(lpBase[0], lpBase[1], lpCrown[0], lpCrown[1], compact?7:14)} fill={palmColor}/>
      {leftFronds.map(([a, l], i) => (
        <path key={i} d={frond(lpCrown[0], lpCrown[1], a, frondLen * (l/100), frondW)} fill={palmColor}/>
      ))}

      {/* Right palm */}
      <path d={trunkPath(rpBase[0], rpBase[1], rpCrown[0], rpCrown[1], compact?7:14)} fill={palmColor}/>
      {rightFronds.map(([a, l], i) => (
        <path key={i} d={frond(rpCrown[0], rpCrown[1], a, frondLen * (l/100), frondW)} fill={palmColor}/>
      ))}

      {/* Foreground vignette */}
      <linearGradient id={compact?'fg-c':'fg-f'} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stopColor="#04090F" stopOpacity="0.65"/>
        <stop offset="12%"  stopColor="#04090F" stopOpacity="0"/>
        <stop offset="88%"  stopColor="#04090F" stopOpacity="0"/>
        <stop offset="100%" stopColor="#04090F" stopOpacity="0.65"/>
      </linearGradient>
      <rect width={W} height={H} fill={`url(#${compact?'fg-c':'fg-f'})`}/>
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════
   6 × BOTANICAL CARD BACKGROUNDS (for photo area)
═══════════════════════════════════════════════════════════ */

function BgSageFlower({ w=298, h=252 }: {w?:number;h?:number}) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block'}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#88B09C"/>
      <path d="M80 40 C120 10 175 25 185 70 C195 115 165 155 130 160 C95 165 45 140 35 105 C25 70 40 70 80 40Z" fill="#E8829A" opacity="0.9"/>
      <path d="M100 55 C130 30 160 45 165 75 C170 105 145 125 120 125 C95 125 70 108 68 85 C66 62 70 80 100 55Z" fill="#F2B4C0" opacity="0.7"/>
      <circle cx="120" cy="95" r="14" fill="#F7DCE3"/><circle cx="120" cy="95" r="6" fill="#D05570"/>
      <path d="M185 170 C200 145 230 150 228 175 C226 200 195 210 185 190 C178 175 170 195 185 170Z" fill="#5A8A6A" opacity="0.85"/>
      <path d="M40 180 C30 155 55 140 65 160 C75 180 60 205 45 200 C35 195 50 205 40 180Z" fill="#5A8A6A" opacity="0.75"/>
      <circle cx="220" cy="55" r="8" fill="#F2B4C0" opacity="0.6"/><circle cx="260" cy="180" r="6" fill="#D05570" opacity="0.5"/>
    </svg>
  )
}
function BgCobalOrange({ w=298, h=252 }: {w?:number;h?:number}) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block'}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#3B6ABF"/>
      <path d="M60 20 C100 5 165 15 190 55 C215 95 195 155 165 180 C135 205 80 200 55 175 C30 150 15 110 20 75 C25 40 20 35 60 20Z" fill="#FAFAF5" opacity="0.93"/>
      <path d="M80 50 C105 35 150 42 165 70 C180 98 165 140 140 155 C115 170 75 162 60 140 C45 118 50 68 80 50Z" fill="#3B6ABF"/>
      <circle cx="115" cy="105" r="22" fill="#E8922A"/><circle cx="115" cy="105" r="11" fill="#F5B740"/>
      <ellipse cx="115" cy="75" rx="7" ry="16" fill="#E8922A" opacity="0.8"/>
      <ellipse cx="115" cy="135" rx="7" ry="16" fill="#E8922A" opacity="0.8"/>
      <ellipse cx="85" cy="105" rx="16" ry="7" fill="#E8922A" opacity="0.8"/>
      <ellipse cx="145" cy="105" rx="16" ry="7" fill="#E8922A" opacity="0.8"/>
      <circle cx="30" cy="220" r="14" fill="rgba(255,255,255,0.25)"/><circle cx="260" cy="210" r="7" fill="rgba(232,146,42,0.6)"/>
    </svg>
  )
}
function BgOliveDaisy({ w=298, h=252 }: {w?:number;h?:number}) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block'}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#4A5C3A"/>
      <rect x="142" y="140" width="14" height="100" rx="7" fill="#5E7848"/>
      <path d="M156 185 C185 170 200 195 175 210 C160 218 145 205 156 185Z" fill="#6B8A52"/>
      <path d="M142 200 C110 185 98 210 120 220 C138 228 148 215 142 200Z" fill="#6B8A52"/>
      {Array.from({length:12},(_,i)=>{const a=(i*30*Math.PI)/180;const px=149+Math.cos(a)*46;const py=110+Math.sin(a)*46;return <ellipse key={i} cx={px} cy={py} rx="12" ry="22" transform={`rotate(${i*30},${px},${py})`} fill="#FAFAF2" opacity="0.95"/>})}
      <circle cx="149" cy="110" r="24" fill="#E8C43A"/><circle cx="149" cy="110" r="14" fill="#C8A022"/>
      <circle cx="50" cy="40" r="6" fill="#FAFAF2" opacity="0.4"/><circle cx="270" cy="210" r="8" fill="#6B8A52" opacity="0.7"/>
    </svg>
  )
}
function BgYellowSunflower({ w=298, h=252 }: {w?:number;h?:number}) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block'}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#E8C840"/>
      {Array.from({length:14},(_,i)=>{const a=(i*(360/14)*Math.PI)/180;const px=149+Math.cos(a)*70;const py=120+Math.sin(a)*70;return <path key={i} d={`M 149 120 C ${149+Math.cos(a-0.3)*45} ${120+Math.sin(a-0.3)*45} ${px-Math.cos(a)*5} ${py-Math.sin(a)*5} ${px} ${py} C ${px} ${py} ${149+Math.cos(a+0.3)*45} ${120+Math.sin(a+0.3)*45} 149 120Z`} fill="#3A6BBF" opacity="0.88"/>})}
      <circle cx="149" cy="120" r="35" fill="#2A4E8C"/><circle cx="149" cy="120" r="22" fill="#1E3A6A"/>
      {[[-8,-8],[0,-10],[8,-8],[10,0],[8,8],[0,10],[-8,8],[-10,0]].map(([dx,dy],i)=><circle key={i} cx={149+dx} cy={120+dy} r="3" fill="#3A6BBF" opacity="0.7"/>)}
      <path d="M 20 230 C 10 200 40 175 55 195 C 70 215 50 240 20 230Z" fill="#C8A82A" opacity="0.7"/>
      <path d="M 260 40 C 285 25 295 55 278 65 C 261 75 242 55 260 40Z" fill="#C8A82A" opacity="0.65"/>
    </svg>
  )
}
function BgSalmonWave({ w=298, h=252 }: {w?:number;h?:number}) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block'}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#E89B80"/>
      <path d="M30 60 C55 20 115 10 155 35 C195 60 225 100 215 150 C205 200 155 235 110 230 C65 225 20 195 10 155 C0 115 5 100 30 60Z" fill="#C0385A" opacity="0.85"/>
      <path d="M70 80 C90 55 130 50 155 70 C180 90 190 130 175 160 C160 190 120 200 95 185 C70 170 50 145 55 115 C60 85 50 105 70 80Z" fill="#E05070" opacity="0.7"/>
      <path d="M200 50 C215 35 235 45 230 62 C225 79 205 82 195 68 C188 57 188 62 200 50Z" fill="#FDF0EC" opacity="0.75"/>
      <path d="M240 180 C255 162 272 172 268 188 C264 204 246 208 238 196 C232 186 228 195 240 180Z" fill="#FDF0EC" opacity="0.65"/>
      <circle cx="255" cy="70" r="9" fill="#FDF0EC" opacity="0.6"/><circle cx="270" cy="145" r="5" fill="#FDF0EC" opacity="0.5"/>
    </svg>
  )
}
function BgMintLeaf({ w=298, h=252 }: {w?:number;h?:number}) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block'}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#A8C8B4"/>
      <path d="M60 30 C105 5 175 20 200 65 C225 110 205 175 170 200 C135 225 75 215 50 180 C25 145 15 55 60 30Z" fill="#E8C440" opacity="0.9"/>
      <path d="M85 50 C120 90 140 150 155 195" fill="none" stroke="#B09A22" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
      <path d="M105 80 C125 72 145 85 140 100" fill="none" stroke="#B09A22" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <path d="M115 110 C135 100 152 110 148 125" fill="none" stroke="#B09A22" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <path d="M215 155 C230 135 252 145 248 165 C244 185 220 190 210 175 C202 163 202 172 215 155Z" fill="#6A9E7A" opacity="0.8"/>
      <circle cx="245" cy="50" r="11" fill="#E8C440" opacity="0.55"/><circle cx="245" cy="50" r="5" fill="#B09A22" opacity="0.6"/>
      <circle cx="40" cy="200" r="8" fill="#E8C440" opacity="0.5"/>
    </svg>
  )
}

const CARD_BGS = [
  { id:'sage-flower',   label:'Garden',   Comp:BgSageFlower },
  { id:'cobalt-orange', label:'Ocean',    Comp:BgCobalOrange },
  { id:'olive-daisy',   label:'Forest',   Comp:BgOliveDaisy },
  { id:'yellow-sun',    label:'Sunshine', Comp:BgYellowSunflower },
  { id:'salmon-wave',   label:'Sunset',   Comp:BgSalmonWave },
  { id:'mint-leaf',     label:'Tropics',  Comp:BgMintLeaf },
]

/* ═══════════════════════════════════════════════════════════
   PANEL ABSTRACT ELEMENTS
═══════════════════════════════════════════════════════════ */
function PanelElemShape({ type, color, size=32 }: { type:PanelElemType; color:string; size?:number }) {
  const s = size
  if (type==='petal') return <svg width={s} height={s} viewBox="0 0 32 32"><ellipse cx="16" cy="16" rx="7" ry="14" fill={color} opacity="0.9"/><ellipse cx="16" cy="16" rx="14" ry="7" fill={color} opacity="0.6"/></svg>
  if (type==='blob')  return <svg width={s} height={s} viewBox="0 0 32 32"><path d="M16 4 C22 4 28 9 27 16 C26 23 20 28 14 27 C8 26 4 20 5 14 C6 8 10 4 16 4Z" fill={color} opacity="0.9"/></svg>
  if (type==='ring')  return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="none" stroke={color} strokeWidth="4" opacity="0.9"/><circle cx="16" cy="16" r="3" fill={color}/></svg>
  if (type==='leaf')  return <svg width={s} height={s} viewBox="0 0 32 32"><path d="M16 3 C24 3 30 12 28 20 C26 28 18 30 12 26 C6 22 4 12 8 7 C11 3 8 3 16 3Z" fill={color} opacity="0.9"/><path d="M16 5 L14 25" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/></svg>
  if (type==='triangle') return <svg width={s} height={s} viewBox="0 0 32 32"><path d="M16 4 L28 26 L4 26Z" fill={color} opacity="0.9"/></svg>
  return <svg width={s} height={s} viewBox="0 0 32 32"><path d="M4 16 C8 8 12 24 16 16 C20 8 24 24 28 16" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"/></svg>
}

/* ─── Generic draggable ───────────────────────────────── */
function Draggable<T extends { id:string; x:number; y:number; rotation:number; color:string }>({
  item, containerRef, onMove, onRemove, isActive, onActivate, children,
}: {
  item:T; containerRef:React.RefObject<HTMLDivElement|null>
  onMove:(id:string,x:number,y:number)=>void; onRemove:(id:string)=>void
  isActive:boolean; onActivate:(id:string|null)=>void; children:React.ReactNode
}) {
  const dragging = useRef(false)
  const origin   = useRef({ mx:0, my:0, sx:0, sy:0 })
  const onPD = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation(); onActivate(item.id); dragging.current = true
    origin.current = { mx:e.clientX, my:e.clientY, sx:item.x, sy:item.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPM = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !containerRef.current) return
    const r = containerRef.current.getBoundingClientRect()
    const dx = ((e.clientX - origin.current.mx) / r.width) * 100
    const dy = ((e.clientY - origin.current.my) / r.height) * 100
    onMove(item.id, Math.max(2, Math.min(98, origin.current.sx + dx)), Math.max(2, Math.min(98, origin.current.sy + dy)))
  }
  const onPU = () => { dragging.current = false }
  return (
    <div onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU}
      style={{ position:'absolute', left:`${item.x}%`, top:`${item.y}%`, transform:`translate(-50%,-50%) rotate(${item.rotation}deg)`, cursor:'grab', userSelect:'none', touchAction:'none', zIndex:isActive?30:10 }}>
      {isActive && (
        <button onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onRemove(item.id)}}
          style={{ position:'absolute', top:'-20px', right:'-20px', width:'22px', height:'22px', borderRadius:'50%', background:C.red, border:'2px solid #fff', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:40, fontSize:'12px', fontWeight:700, lineHeight:1 }}>×</button>
      )}
      <div style={{ padding:'3px', borderRadius:'6px', outline:isActive?`2px dashed ${item.color}`:'none', outlineOffset:'2px' }}>
        {children}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════════════════ */
function IcWave({ s=22,c='currentColor' }: {s?:number;c?:string}) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M2 10 C5 7 7 13 10 10S15 7 18 10S21 13 22 10"/><path d="M2 16 C5 13 7 19 10 16S15 13 18 16S21 19 22 16"/></svg> }
function IcStar({ s=22,c='currentColor' }: {s?:number;c?:string}) { return <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg> }
function IcPalm({ s=22,c='currentColor' }: {s?:number;c?:string}) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-9"/><path d="M12 13Q8 9 3 11Q6 14 12 13"/><path d="M12 13Q16 9 21 11Q18 14 12 13"/><path d="M12 16Q9 12 5 13Q8 16 12 16"/><path d="M12 16Q15 12 19 13Q16 16 12 16"/></svg> }
function IcSun({ s=22,c='currentColor' }: {s?:number;c?:string}) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/>{[0,45,90,135,180,225,270,315].map(d=>{const r=(d*Math.PI)/180;return <line key={d} x1={12+6*Math.cos(r)} y1={12+6*Math.sin(r)} x2={12+9*Math.cos(r)} y2={12+9*Math.sin(r)}/>})}</svg> }
function IcAnchor({ s=22,c='currentColor' }: {s?:number;c?:string}) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="22"/><path d="M5 15a7 7 0 0014 0"/></svg> }
function IcLeaf({ s=22,c='currentColor' }: {s?:number;c?:string}) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6 2 3 8 4 15C5 21 10 22 14 20C18 18 21 13 19 7C17 2 18 2 12 2Z"/><path d="M12 22C12 22 12 12 8 7"/></svg> }
function IcX({ s=14 }: {s?:number}) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> }
function IcDownload() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v14M6 11l6 6 6-6M3 21h18"/></svg> }
function IcCamera({ color=C.muted }: {color?:string}) { return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg> }
function IcDice() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="4"/><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1.5" fill="currentColor" stroke="none"/><circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg> }
function IcShuffle() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg> }
function IcArrowLeft() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg> }
function IcTrash({ s=12 }: {s?:number}) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg> }

function StickerContent({ type, size=26, color }: {type:StickerType;size?:number;color:string}) {
  if (type==='wave')   return <IcWave s={size} c={color}/>
  if (type==='star')   return <IcStar s={size} c={color}/>
  if (type==='palm')   return <IcPalm s={size} c={color}/>
  if (type==='sun')    return <IcSun s={size} c={color}/>
  if (type==='anchor') return <IcAnchor s={size} c={color}/>
  return <IcLeaf s={size} c={color}/>
}

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════ */
function HomePage({ onNavigate }: { onNavigate:(p:Page)=>void }) {
  return (
    <div style={{ position:'relative', width:'100vw', height:'100dvh', overflow:'hidden', background:C.sky }}>
      {/* Full-screen illustration */}
      <div style={{ position:'absolute', inset:0 }}>
        <BeachScene compact={false}/>
      </div>

      {/* Top bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, padding:'22px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'30px', height:'30px', background:C.red, borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Space Mono, monospace', fontWeight:700, fontSize:'10px', color:'#fff' }}>HH</div>
          <span style={{ fontFamily:'Space Mono, monospace', fontSize:'9px', color:'rgba(232,220,200,0.55)', letterSpacing:'0.22em' }}>HACKER HOUSE GOA</span>
        </div>
        <span style={{ fontFamily:'Space Mono, monospace', fontSize:'9px', color:'rgba(232,220,200,0.4)', letterSpacing:'0.2em' }}>2026</span>
      </div>

      {/* Hero text — centered over ocean / horizon */}
      <div style={{ position:'absolute', top:'50%', left:0, right:0, transform:'translateY(-62%)', textAlign:'center', zIndex:10, padding:'0 24px' }}>
        <p style={{ margin:'0 0 6px', fontFamily:'Space Mono, monospace', fontSize:'11px', color:'rgba(232,220,200,0.45)', letterSpacing:'0.28em', textTransform:'uppercase' }}>
          Builder Frame & ID Generator
        </p>
        <h1 style={{ margin:'0 0 10px', fontFamily:'Righteous, sans-serif', fontSize:'clamp(52px,8vw,112px)', fontWeight:400, lineHeight:0.95, color:C.cream, textShadow:'0 4px 40px rgba(0,0,0,0.5)', letterSpacing:'-0.01em' }}>
          Frame yourself.
        </h1>
        <p style={{ margin:'0', fontFamily:'Inter, sans-serif', fontSize:'clamp(14px,1.8vw,18px)', color:'rgba(232,220,200,0.55)', letterSpacing:'0.02em' }}>
          Goa · India · 2026
        </p>
      </div>

      {/* Choice cards — sitting on the sand */}
      <div style={{ position:'absolute', bottom:'clamp(48px,8vh,90px)', left:'50%', transform:'translateX(-50%)', display:'flex', gap:'16px', zIndex:10, width:'100%', maxWidth:'700px', padding:'0 24px', justifyContent:'center', alignItems:'stretch' }}>
        {/* PFP Card */}
        <button onClick={() => onNavigate('pfp')} className="choice-card"
          style={{ flex:1, maxWidth:'310px', background:'rgba(6,12,26,0.68)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:'18px', padding:'22px 24px', cursor:'pointer', textAlign:'left', display:'flex', flexDirection:'column', gap:'10px', position:'relative', overflow:'hidden' }}>
          {/* Accent line */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,${C.gold},${C.teal})` }}/>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontFamily:'Space Mono, monospace', fontSize:'9px', color:'rgba(232,220,200,0.45)', letterSpacing:'0.2em' }}>FORMAT 01</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(232,220,200,0.45)" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
          <div>
            <h2 style={{ margin:'0 0 4px', fontFamily:'Righteous, sans-serif', fontSize:'26px', color:C.cream, fontWeight:400, letterSpacing:'0.01em' }}>Circle PFP</h2>
            <p style={{ margin:0, fontFamily:'Inter, sans-serif', fontSize:'12.5px', color:'rgba(232,220,200,0.5)', lineHeight:1.55 }}>Gradient ring, arc text, botanical background. Drop-in for X / Twitter.</p>
          </div>
          <div style={{ marginTop:'auto', display:'flex', gap:'5px', flexWrap:'wrap' }}>
            {['Arc text','Gradient ring','Stickers'].map(t=>(
              <span key={t} style={{ fontFamily:'Space Mono, monospace', fontSize:'8px', color:C.gold, border:`1px solid rgba(213,157,56,0.3)`, padding:'2px 7px', borderRadius:'4px', letterSpacing:'0.05em' }}>{t}</span>
            ))}
          </div>
        </button>

        {/* ID Card */}
        <button onClick={() => onNavigate('id')} className="choice-card"
          style={{ flex:1, maxWidth:'310px', background:'rgba(6,12,26,0.68)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:'18px', padding:'22px 24px', cursor:'pointer', textAlign:'left', display:'flex', flexDirection:'column', gap:'10px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,${C.pink},${C.gold})` }}/>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontFamily:'Space Mono, monospace', fontSize:'9px', color:'rgba(232,220,200,0.45)', letterSpacing:'0.2em' }}>FORMAT 02</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(232,220,200,0.45)" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
          <div>
            <h2 style={{ margin:'0 0 4px', fontFamily:'Righteous, sans-serif', fontSize:'26px', color:C.cream, fontWeight:400, letterSpacing:'0.01em' }}>Builder ID</h2>
            <p style={{ margin:0, fontFamily:'Inter, sans-serif', fontSize:'12.5px', color:'rgba(232,220,200,0.5)', lineHeight:1.55 }}>Botanical background, builder title, customisable design zone.</p>
          </div>
          <div style={{ marginTop:'auto', display:'flex', gap:'5px', flexWrap:'wrap' }}>
            {['Botanical bg','Design zone','Builder title'].map(t=>(
              <span key={t} style={{ fontFamily:'Space Mono, monospace', fontSize:'8px', color:C.pink, border:`1px solid rgba(218,11,90,0.3)`, padding:'2px 7px', borderRadius:'4px', letterSpacing:'0.05em' }}>{t}</span>
            ))}
          </div>
        </button>
      </div>

      {/* Bottom hint */}
      <div style={{ position:'absolute', bottom:'18px', left:'50%', transform:'translateX(-50%)', fontFamily:'Space Mono, monospace', fontSize:'8.5px', color:'rgba(232,220,200,0.25)', letterSpacing:'0.2em', zIndex:10, whiteSpace:'nowrap' }}>
        PICK A FORMAT TO BEGIN
      </div>

      <style>{`
        .choice-card { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s ease; }
        .choice-card:hover { transform: translateY(-5px) scale(1.015); border-color: rgba(255,255,255,0.28) !important; }
        .choice-card:active { transform: scale(0.98); }
      `}</style>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   BEACH COMPACT HEADER  (used on generator pages)
═══════════════════════════════════════════════════════════ */
function BeachHeader({ title, onBack, extra }: { title:string; onBack:()=>void; extra?:React.ReactNode }) {
  return (
    <div style={{ position:'relative', height:'88px', overflow:'hidden', flexShrink:0 }}>
      <div style={{ position:'absolute', inset:0 }}><BeachScene compact={true}/></div>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 22px', zIndex:5 }}>
        <button onClick={onBack} className="btn-spring"
          style={{ display:'flex', alignItems:'center', gap:'7px', background:'rgba(6,12,26,0.55)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'7px 12px', color:C.cream, fontFamily:'Space Mono, monospace', fontSize:'10px', cursor:'pointer', letterSpacing:'0.12em' }}>
          <IcArrowLeft/> Back
        </button>
        <div style={{ textAlign:'center' }}>
          <p style={{ margin:0, fontFamily:'Space Mono, monospace', fontSize:'8.5px', color:'rgba(232,220,200,0.45)', letterSpacing:'0.22em' }}>HH GOA 2026</p>
          <p style={{ margin:0, fontFamily:'Righteous, sans-serif', fontSize:'19px', color:C.cream, fontWeight:400, letterSpacing:'0.02em' }}>{title}</p>
        </div>
        {extra ?? <div style={{ width:'80px' }}/>}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   UPLOAD ZONE
═══════════════════════════════════════════════════════════ */
function UploadZone({ image, isDragging, onDrop, onDragOver, onDragLeave, onFileInput, onReplace, fileInputRef }: {
  image:string|null; isDragging:boolean
  onDrop:(e:DragEvent<HTMLDivElement>)=>void; onDragOver:(e:DragEvent<HTMLDivElement>)=>void
  onDragLeave:()=>void; onFileInput:(e:ChangeEvent<HTMLInputElement>)=>void
  onReplace:()=>void; fileInputRef:React.RefObject<HTMLInputElement|null>
}) {
  if (image) return (
    <div className="pop-in" style={{ background:C.glass, border:`1px solid ${C.border}`, borderRadius:'11px', padding:'10px 13px', display:'flex', alignItems:'center', gap:'11px' }}>
      <img src={image} alt="Uploaded" style={{ width:'48px', height:'48px', borderRadius:'50%', objectFit:'cover', border:`2px solid ${C.gold}`, flexShrink:0 }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:0, fontWeight:700, fontSize:'13px', color:C.text }}>Photo ready</p>
        <p style={{ margin:'2px 0 0', fontSize:'11px', color:C.muted }}>Looking coastal!</p>
      </div>
      <button onClick={onReplace} className="btn-spring" style={{ background:'rgba(213,157,56,0.15)', border:`1px solid rgba(213,157,56,0.4)`, color:C.gold, padding:'6px 11px', borderRadius:'7px', fontSize:'11.5px', fontWeight:700, cursor:'pointer', flexShrink:0 }}>Replace</button>
      <input ref={fileInputRef} type="file" accept="image/*,.heic" style={{ display:'none' }} onChange={onFileInput}/>
    </div>
  )
  return (
    <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={()=>fileInputRef.current?.click()} style={{ border:`2px dashed ${isDragging?C.tealLight:'rgba(255,255,255,0.18)'}`, borderRadius:'11px', padding:'26px 20px', textAlign:'center', cursor:'pointer', background:isDragging?'rgba(47,102,112,0.1)':'rgba(255,255,255,0.03)', transition:'all 0.18s ease', userSelect:'none' }}>
      <div style={{ marginBottom:'7px', display:'flex', justifyContent:'center' }}><IcCamera color={isDragging?C.tealLight:'rgba(232,220,200,0.3)'}/></div>
      <p style={{ margin:'0 0 3px', fontWeight:700, fontSize:'13px', color:C.text }}>Drag & drop or click to upload</p>
      <p style={{ margin:0, fontSize:'11px', color:C.muted }}>JPG, PNG, HEIC — portrait works best</p>
      <input ref={fileInputRef} type="file" accept="image/*,.heic" style={{ display:'none' }} onChange={onFileInput}/>
    </div>
  )
}

/* ─── Sticker toolbar ───────────────────────────────── */
const STICKER_DEFS: { type:StickerType; label:string }[] = [
  {type:'wave',label:'Wave'},{type:'star',label:'Star'},{type:'palm',label:'Palm'},
  {type:'sun',label:'Sun'},{type:'anchor',label:'Anchor'},{type:'leaf',label:'Leaf'},
]
const PANEL_TYPES: PanelElemType[] = ['petal','blob','ring','leaf','triangle','squiggle']

function StickerToolbar({ label, onClearAll, hasItems, children }: { label:string; onClearAll:()=>void; hasItems:boolean; children:React.ReactNode }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:'11px', padding:'10px 12px', border:`1px solid ${C.border}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'7px' }}>
        <span style={{ fontFamily:'Space Mono, monospace', fontSize:'8px', color:C.text, letterSpacing:'0.15em' }}>{label}</span>
        {hasItems && <button onClick={onClearAll} className="btn-spring" style={{ background:'transparent', border:`1px solid rgba(255,6,6,0.35)`, color:C.red, padding:'2px 8px', borderRadius:'5px', fontSize:'9px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:'3px' }}><IcTrash s={9}/> Clear</button>}
      </div>
      {children}
    </div>
  )
}

/* ─── Form inputs shared style ─────────────────────── */
const inpSt: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.06)', border:`1px solid ${C.border}`, borderRadius:'9px', padding:'10px 12px', color:C.text, fontSize:'13.5px', fontFamily:'Inter, sans-serif', transition:'border-color 0.2s,box-shadow 0.2s' }
const chevSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23E8DCC8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`
function Lbl({ children }: { children:React.ReactNode }) {
  return <label style={{ display:'block', fontFamily:'Space Mono, monospace', fontSize:'9px', color:'rgba(232,220,200,0.55)', letterSpacing:'0.18em', marginBottom:'6px' }}>{children}</label>
}

/* ─── Action buttons ────────────────────────────────── */
function ActionBar({ onDownload, downloading }: { onDownload:()=>void; downloading:boolean }) {
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Just generated my Builder ID for Hacker House Goa 2026!\n#FrameInGoa #BuildInGoa #HHGoa2026')}`
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
      <button onClick={onDownload} disabled={downloading} className="btn-spring"
        style={{ width:'100%', padding:'13px', background:downloading?'rgba(255,255,255,0.12)':C.gold, border:'none', borderRadius:'11px', color:downloading?C.muted:C.navy, fontSize:'14px', fontWeight:700, cursor:downloading?'default':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontFamily:'Inter, sans-serif', boxShadow:downloading?'none':'0 4px 20px rgba(213,157,56,0.35)' }}>
        <IcDownload/> {downloading?'Downloading…':'Download Image'}
      </button>
      <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="btn-spring"
        style={{ width:'100%', padding:'13px', background:'rgba(255,255,255,0.06)', border:`1px solid ${C.border}`, borderRadius:'11px', color:C.text, fontSize:'14px', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', textDecoration:'none', fontFamily:'Inter, sans-serif' }}>
        <IcX/> Share on X
      </a>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   CIRCLE PFP PREVIEW
═══════════════════════════════════════════════════════════ */
function PfpPreview({ image, name, role, bgIdx, stickers, photoRef, onMoveSticker, onRemoveSticker, activeSticker, onActivateSticker, animKey }: {
  image:string|null; name:string; role:string; bgIdx:number
  stickers:Sticker[]; photoRef:React.RefObject<HTMLDivElement|null>
  onMoveSticker:(id:string,x:number,y:number)=>void; onRemoveSticker:(id:string)=>void
  activeSticker:string|null; onActivateSticker:(id:string|null)=>void; animKey:number
}) {
  const BgComp = CARD_BGS[bgIdx % CARD_BGS.length].Comp
  const R=118, CX=145, CY=145

  return (
    <div className="card-flip-enter" style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <div ref={photoRef} onClick={()=>onActivateSticker(null)} style={{ position:'relative', width:'290px', height:'290px', flexShrink:0 }}>
        <svg viewBox="0 0 290 290" style={{ position:'absolute', inset:0, width:'100%', height:'100%', overflow:'visible' }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="pfp-bg-clip"><circle cx={CX} cy={CY} r={R-10}/></clipPath>
            <clipPath id="pfp-photo-clip"><circle cx={CX} cy={CY} r={R-26}/></clipPath>
            <linearGradient id="pfp-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={C.gold}/><stop offset="50%" stopColor={C.teal}/><stop offset="100%" stopColor={C.pink}/>
            </linearGradient>
            <path id="arc-t" d={`M ${CX-(R+18)} ${CY} A ${R+18} ${R+18} 0 0 1 ${CX+(R+18)} ${CY}`}/>
            <path id="arc-b" d={`M ${CX-(R+18)} ${CY} A ${R+18} ${R+18} 0 0 0 ${CX+(R+18)} ${CY}`}/>
          </defs>
          <circle cx={CX} cy={CY} r={R+28} fill="none" stroke="rgba(232,220,200,0.15)" strokeWidth="1" strokeDasharray="3 8"/>
          <foreignObject x={CX-(R-10)} y={CY-(R-10)} width={(R-10)*2} height={(R-10)*2} clipPath="url(#pfp-bg-clip)">
            <BgComp w={(R-10)*2} h={(R-10)*2}/>
          </foreignObject>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="url(#pfp-ring)" strokeWidth="17"/>
          <circle cx={CX} cy={CY} r={R-10} fill="none" stroke={C.gold} strokeWidth="0.8" opacity="0.4"/>
          {image && (
            <>
              <image href={image} x={CX-(R-26)} y={CY-(R-26)} width={(R-26)*2} height={(R-26)*2} clipPath="url(#pfp-photo-clip)" preserveAspectRatio="xMidYMid slice"/>
              <circle cx={CX} cy={CY} r={R-26} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
            </>
          )}
          <text fontSize="10.5" fontFamily="Space Mono, monospace" fontWeight="700" letterSpacing="2.5" fill={C.cream}>
            <textPath href="#arc-t" startOffset="50%" textAnchor="middle">HH GOA 2026  ·  BUILDER RESIDENCY</textPath>
          </text>
          <text fontSize="9" fontFamily="Space Mono, monospace" letterSpacing="2" fill={C.cream} opacity="0.55">
            <textPath href="#arc-b" startOffset="50%" textAnchor="middle">HACKER HOUSE  ·  GOA, INDIA</textPath>
          </text>
          {[0,90,180,270].map((deg,i)=>{ const r=(deg*Math.PI)/180; return <circle key={i} cx={CX+(R+28)*Math.cos(r)} cy={CY+(R+28)*Math.sin(r)} r="5" fill={i%2===0?C.gold:C.teal}/> })}
        </svg>
        {stickers.map(s=>(
          <Draggable key={s.id} item={s} containerRef={photoRef} onMove={onMoveSticker} onRemove={onRemoveSticker} isActive={activeSticker===s.id} onActivate={onActivateSticker}>
            <StickerContent type={s.type} size={26} color={s.color}/>
          </Draggable>
        ))}
      </div>
      {(name||role) && (
        <div key={`pfp-nm-${animKey}`} className="typewriter-pop" style={{ background:'rgba(6,12,26,0.85)', backdropFilter:'blur(12px)', borderRadius:'13px', padding:'10px 22px', textAlign:'center', width:'100%', maxWidth:'270px', border:`1px solid ${C.border}`, marginTop:'-2px' }}>
          {name && <div style={{ fontFamily:'Righteous, sans-serif', fontSize:'19px', color:C.cream, letterSpacing:'0.03em', lineHeight:1.2 }}>{name.toUpperCase()}</div>}
          {role && <span style={{ display:'inline-block', marginTop:'3px', background:'rgba(47,102,112,0.2)', border:`1px solid rgba(47,102,112,0.4)`, color:C.tealLight, padding:'2px 9px', borderRadius:'999px', fontSize:'9px', fontWeight:700, fontFamily:'Space Mono, monospace', letterSpacing:'0.07em' }}>{role}</span>}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   BUILDER ID CARD PREVIEW
═══════════════════════════════════════════════════════════ */
function IdCardPreview({ image, name, role, builderTitle, bgIdx, stickers, panelElems, photoRef, panelRef, onMoveSticker, onRemoveSticker, activeSticker, onActivateSticker, onMovePanelElem, onRemovePanelElem, activePanelElem, onActivatePanelElem, animKey }: {
  image:string|null; name:string; role:string; builderTitle:string; bgIdx:number
  stickers:Sticker[]; panelElems:PanelElem[]
  photoRef:React.RefObject<HTMLDivElement|null>; panelRef:React.RefObject<HTMLDivElement|null>
  onMoveSticker:(id:string,x:number,y:number)=>void; onRemoveSticker:(id:string)=>void
  activeSticker:string|null; onActivateSticker:(id:string|null)=>void
  onMovePanelElem:(id:string,x:number,y:number)=>void; onRemovePanelElem:(id:string)=>void
  activePanelElem:string|null; onActivatePanelElem:(id:string|null)=>void; animKey:number
}) {
  const BgComp = CARD_BGS[bgIdx % CARD_BGS.length].Comp
  return (
    <div className="card-flip-enter" style={{ width:'100%', maxWidth:'295px', margin:'0 auto', borderRadius:'20px', overflow:'hidden', boxShadow:'0 18px 55px rgba(0,0,0,0.45)', position:'relative', background:'#F5EDD8', border:'1px solid rgba(255,255,255,0.12)' }}>
      <div style={{ height:'4px', background:`linear-gradient(90deg,${C.gold},${C.teal},${C.pink})` }}/>
      {/* Photo area */}
      <div ref={photoRef} onClick={()=>{onActivateSticker(null);onActivatePanelElem(null)}} style={{ position:'relative', height:'248px', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0 }}><BgComp w={295} h={248}/></div>
        {image ? (
          <div style={{ position:'absolute', top:'18px', left:'50%', transform:'translateX(-50%)', width:'162px', height:'188px', borderRadius:'81px 81px 26px 26px', overflow:'hidden', border:'3px solid rgba(255,255,255,0.88)', boxShadow:'0 8px 32px rgba(0,0,0,0.3)', zIndex:3 }}>
            <img src={image} alt="Your photo" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center', display:'block' }}/>
          </div>
        ) : (
          <div style={{ position:'absolute', top:'18px', left:'50%', transform:'translateX(-50%)', width:'162px', height:'188px', borderRadius:'81px 81px 26px 26px', background:'rgba(255,255,255,0.3)', backdropFilter:'blur(4px)', border:'2px dashed rgba(255,255,255,0.55)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'6px', zIndex:3 }}>
            <IcCamera color="rgba(255,255,255,0.55)"/>
            <span style={{ fontFamily:'Space Mono, monospace', fontSize:'8.5px', color:'rgba(255,255,255,0.65)' }}>Upload photo</span>
          </div>
        )}
        <div style={{ position:'absolute', top:'8px', left:'8px', right:'8px', display:'flex', justifyContent:'space-between', zIndex:5 }}>
          <div><div style={{ fontFamily:'Space Mono, monospace', fontSize:'7px', fontWeight:700, color:'#061226', letterSpacing:'0.2em', background:'rgba(255,255,255,0.72)', padding:'2px 7px', borderRadius:'4px', backdropFilter:'blur(6px)', display:'inline-block' }}>HACKER HOUSE</div>
            <div style={{ fontFamily:'Righteous, sans-serif', fontSize:'18px', color:'#061226', lineHeight:1.15, marginTop:'2px', textShadow:'0 1px 6px rgba(255,255,255,0.5)' }}>HH GOA</div>
          </div>
          <div style={{ fontFamily:'Space Mono, monospace', fontSize:'11px', fontWeight:700, color:'#061226', background:'rgba(255,255,255,0.72)', padding:'4px 8px', borderRadius:'5px', backdropFilter:'blur(6px)', alignSelf:'flex-start' }}>2026</div>
        </div>
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'65px', background:'linear-gradient(to bottom,transparent,#F5EDD8)', zIndex:4 }}/>
        {stickers.map(s=>(
          <Draggable key={s.id} item={s} containerRef={photoRef} onMove={onMoveSticker} onRemove={onRemoveSticker} isActive={activeSticker===s.id} onActivate={onActivateSticker}>
            <StickerContent type={s.type} size={26} color={s.color}/>
          </Draggable>
        ))}
      </div>
      {/* Info panel */}
      <div style={{ background:'#F5EDD8', padding:'11px 15px 14px' }}>
        <div key={`n-${animKey}`} className="typewriter-pop">
          <h2 style={{ margin:'0 0 4px', fontFamily:'Righteous, sans-serif', fontSize:name?'20px':'14px', color:name?'#061226':'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.02em', lineHeight:1.15, wordBreak:'break-word' }}>{name||'YOUR NAME'}</h2>
        </div>
        <div key={`r-${animKey}`} className="typewriter-pop" style={{ display:'flex', flexWrap:'wrap', gap:'5px', alignItems:'center', marginBottom:'8px' }}>
          {role && <span style={{ background:'rgba(218,11,90,0.08)', border:'1px solid rgba(218,11,90,0.25)', color:C.pink, padding:'2px 8px', borderRadius:'999px', fontSize:'9px', fontWeight:700, fontFamily:'Space Mono, monospace', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{role}</span>}
          {builderTitle && <span style={{ fontFamily:'Space Mono, monospace', fontSize:'9px', fontStyle:'italic', color:C.teal, lineHeight:1.4 }}>{builderTitle}</span>}
        </div>
        <div style={{ height:'1px', background:`linear-gradient(90deg,${C.gold},${C.teal},transparent)`, marginBottom:'8px', opacity:0.5 }}/>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
          <div>
            <div style={{ fontFamily:'Space Mono, monospace', fontSize:'8px', fontWeight:700, color:'#061226', letterSpacing:'0.14em' }}>HACKER HOUSE GOA</div>
            <div style={{ fontFamily:'Space Mono, monospace', fontSize:'7.5px', color:'#6B7280', marginTop:'1px' }}>Builder Residency · 2026</div>
          </div>
          <div style={{ width:'28px', height:'28px', background:C.red, borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Space Mono, monospace', fontWeight:700, fontSize:'10px', color:'#fff', flexShrink:0 }}>HH</div>
        </div>
        {/* Design zone */}
        <div style={{ background:'rgba(6,18,38,0.06)', borderRadius:'8px', padding:'5px 7px', border:'1px dashed rgba(6,18,38,0.12)' }}>
          <div style={{ fontFamily:'Space Mono, monospace', fontSize:'7px', color:'#9CA3AF', letterSpacing:'0.12em', marginBottom:'3px' }}>DESIGN ZONE — DRAG TO ARRANGE</div>
          <div ref={panelRef} onClick={e=>e.stopPropagation()} style={{ position:'relative', height:'52px', borderRadius:'5px', overflow:'visible' }}>
            {panelElems.length===0 && <p style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', margin:0, fontFamily:'Space Mono, monospace', fontSize:'8px', color:'#D1CBBB' }}>add shapes below</p>}
            {panelElems.map(el=>(
              <Draggable key={el.id} item={el} containerRef={panelRef} onMove={onMovePanelElem} onRemove={onRemovePanelElem} isActive={activePanelElem===el.id} onActivate={onActivatePanelElem}>
                <PanelElemShape type={el.type} color={el.color} size={26}/>
              </Draggable>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PFP PAGE
═══════════════════════════════════════════════════════════ */
function PfpPage({ onBack }: { onBack:()=>void }) {
  const [image, setImage]               = useState<string|null>(null)
  const [isDragging, setIsDragging]     = useState(false)
  const [name, setName]                 = useState('')
  const [role, setRole]                 = useState('')
  const [bgIdx, setBgIdx]               = useState(() => Math.floor(Math.random() * CARD_BGS.length))
  const [stickers, setStickers]         = useState<Sticker[]>([])
  const [activeSticker, setActiveSticker] = useState<string|null>(null)
  const [stickerColor, setStickerColor] = useState(C.gold)
  const [animKey, setAnimKey]           = useState(0)
  const [downloading, setDownloading]   = useState(false)
  const [showCard, setShowCard]         = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const photoRef     = useRef<HTMLDivElement>(null)

  const handleFile = useCallback((file:File) => {
    const reader = new FileReader()
    reader.onload = e => { setShowCard(false); setTimeout(()=>{ setImage(e.target?.result as string); setShowCard(true) }, 200) }
    reader.readAsDataURL(file)
  }, [])

  const shuffle = () => {
    const next = (bgIdx + 1 + Math.floor(Math.random() * (CARD_BGS.length-1))) % CARD_BGS.length
    setShowCard(false); setTimeout(()=>{ setBgIdx(next); setShowCard(true) }, 160)
  }

  const addSticker = (type:StickerType) => {
    const id = Math.random().toString(36).slice(2)
    setStickers(prev=>[...prev,{ id, type, x:15+Math.random()*70, y:15+Math.random()*70, rotation:Math.round(Math.random()*30-15), color:stickerColor }])
    setActiveSticker(id)
  }

  const handleDownload = async () => {
    setDownloading(true)
    setTimeout(()=>setDownloading(false), 900)
  }

  return (
    <div style={{ minHeight:'100dvh', background:C.sky, display:'flex', flexDirection:'column', color:C.text }} onClick={()=>setActiveSticker(null)}>
      <BeachHeader title="Circle PFP" onBack={onBack}/>
      <div style={{ flex:1, maxWidth:'1180px', width:'100%', margin:'0 auto', padding:'20px 18px 100px', display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:'18px', alignItems:'start' }}>
        {/* Left — Form */}
        <div style={{ background:C.panel, backdropFilter:'blur(20px)', borderRadius:'18px', padding:'22px', display:'flex', flexDirection:'column', gap:'15px', border:`1px solid ${C.border}` }}>
          <div>
            <h2 style={{ margin:'0 0 4px', fontFamily:'Righteous, sans-serif', fontSize:'22px', color:C.cream, fontWeight:400 }}>Your Details</h2>
            <p style={{ margin:0, fontSize:'12px', color:C.muted, lineHeight:1.6 }}>Fill in your info. The circle frame is generated live.</p>
          </div>
          <div style={{ height:'1px', background:`linear-gradient(90deg,${C.gold},transparent)`, opacity:0.35 }}/>
          <UploadZone image={image} isDragging={isDragging} onDrop={e=>{e.preventDefault();setIsDragging(false);const f=e.dataTransfer.files[0];if(f)handleFile(f)}} onDragOver={e=>{e.preventDefault();setIsDragging(true)}} onDragLeave={()=>setIsDragging(false)} onFileInput={e=>e.target.files?.[0]&&handleFile(e.target.files[0])} onReplace={()=>fileInputRef.current?.click()} fileInputRef={fileInputRef as React.RefObject<HTMLInputElement|null>}/>
          <div><Lbl>YOUR NAME</Lbl><input type="text" placeholder="e.g. Arjun Mehta" value={name} onChange={e=>{setName(e.target.value);setAnimKey(k=>k+1)}} style={inpSt}/></div>
          <div><Lbl>ROLE (optional)</Lbl>
            <select value={role} onChange={e=>{setRole(e.target.value);setAnimKey(k=>k+1)}} style={{ ...inpSt, backgroundImage:chevSvg, backgroundRepeat:'no-repeat', backgroundPosition:'right 11px center', appearance:'none' as const, color:role?C.text:C.muted }}>
              <option value="" disabled>Pick your role…</option>
              {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Sticker toolbar */}
          <StickerToolbar label="PHOTO STICKERS" onClearAll={()=>{setStickers([]);setActiveSticker(null)}} hasItems={stickers.length>0}>
            <div style={{ display:'flex', gap:'5px', marginBottom:'7px', flexWrap:'wrap' }}>
              {STICKER_DEFS.map(s=>(
                <button key={s.type} onClick={()=>addSticker(s.type)} className="btn-spring" title={s.label} style={{ width:'33px', height:'33px', borderRadius:'8px', background:C.glass, border:`1px solid ${C.border}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <StickerContent type={s.type} size={16} color={stickerColor}/>
                </button>
              ))}
            </div>
            <div style={{ display:'flex', gap:'5px', alignItems:'center' }}>
              <span style={{ fontFamily:'Space Mono, monospace', fontSize:'7.5px', color:C.muted, letterSpacing:'0.1em', marginRight:'2px' }}>COLOR</span>
              {STICKER_COLORS.map(c=>(
                <button key={c} onClick={()=>setStickerColor(c)} style={{ width:'16px', height:'16px', borderRadius:'50%', background:c, border:stickerColor===c?`2px solid ${C.cream}`:`1px solid ${C.border}`, cursor:'pointer', flexShrink:0 }}/>
              ))}
            </div>
          </StickerToolbar>
          <ActionBar onDownload={handleDownload} downloading={downloading}/>
        </div>

        {/* Right — Preview */}
        <div style={{ position:'sticky', top:'18px' }}>
          <div style={{ background:C.panel, backdropFilter:'blur(20px)', borderRadius:'18px', padding:'18px', border:`1px solid ${C.border}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
              <span style={{ fontFamily:'Space Mono, monospace', fontSize:'9px', color:C.text, letterSpacing:'0.18em' }}>LIVE PREVIEW</span>
              <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                <button onClick={shuffle} className="btn-spring" style={{ display:'flex', alignItems:'center', gap:'5px', background:'rgba(213,157,56,0.12)', border:`1px solid rgba(213,157,56,0.3)`, borderRadius:'7px', padding:'4px 9px', cursor:'pointer', fontFamily:'Space Mono, monospace', fontSize:'8.5px', color:C.gold, fontWeight:700, letterSpacing:'0.08em' }}>
                  <IcShuffle/> {CARD_BGS[bgIdx%CARD_BGS.length].label}
                </button>
                <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                  <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#1B7900', animation:'pulse 2s infinite' }}/>
                  <span style={{ fontSize:'9px', fontFamily:'Space Mono, monospace', color:C.muted }}>LIVE</span>
                </div>
              </div>
            </div>
            <div style={{ minHeight:'260px', display:'flex', alignItems:'center', justifyContent:'center' }} onClick={e=>e.stopPropagation()}>
              {showCard
                ? <PfpPreview image={image} name={name} role={role} bgIdx={bgIdx} stickers={stickers} photoRef={photoRef} onMoveSticker={(id,x,y)=>setStickers(prev=>prev.map(s=>s.id===id?{...s,x,y}:s))} onRemoveSticker={id=>{setStickers(prev=>prev.filter(s=>s.id!==id));setActiveSticker(null)}} activeSticker={activeSticker} onActivateSticker={setActiveSticker} animKey={animKey}/>
                : <div style={{ width:'272px', height:'272px', borderRadius:'50%', background:'linear-gradient(90deg,#0d2438 25%,#122c46 50%,#0d2438 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }}/>
              }
            </div>
            <p style={{ textAlign:'center', margin:'8px 0 0', fontFamily:'Space Mono, monospace', fontSize:'8.5px', color:C.muted, letterSpacing:'0.09em' }}>Circle PFP · 1:1 · For X / Twitter</p>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}} @media(max-width:780px){.pfp-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   BUILDER ID PAGE
═══════════════════════════════════════════════════════════ */
function IdPage({ onBack }: { onBack:()=>void }) {
  const [image, setImage]               = useState<string|null>(null)
  const [isDragging, setIsDragging]     = useState(false)
  const [name, setName]                 = useState('')
  const [role, setRole]                 = useState('')
  const [builderTitle, setBuilderTitle] = useState(BUILDER_TITLES[0])
  const [bgIdx, setBgIdx]               = useState(() => Math.floor(Math.random() * CARD_BGS.length))
  const [stickers, setStickers]         = useState<Sticker[]>([])
  const [activeSticker, setActiveSticker] = useState<string|null>(null)
  const [stickerColor, setStickerColor] = useState(C.gold)
  const [panelElems, setPanelElems]     = useState<PanelElem[]>(() => [
    { id:'p1', type:'petal',    x:18, y:48, rotation:20,  color:C.gold,  scale:1 },
    { id:'p2', type:'blob',     x:50, y:55, rotation:-5,  color:C.teal,  scale:0.9 },
    { id:'p3', type:'ring',     x:82, y:42, rotation:0,   color:C.pink,  scale:0.8 },
  ])
  const [activePanelElem, setActivePanelElem] = useState<string|null>(null)
  const [panelElemColor, setPanelElemColor] = useState(C.teal)
  const [animKey, setAnimKey]           = useState(0)
  const [downloading, setDownloading]   = useState(false)
  const [showCard, setShowCard]         = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const photoRef     = useRef<HTMLDivElement>(null)
  const panelRef     = useRef<HTMLDivElement>(null)

  const handleFile = useCallback((file:File) => {
    const reader = new FileReader()
    reader.onload = e => { setShowCard(false); setTimeout(()=>{ setImage(e.target?.result as string); setShowCard(true) }, 200) }
    reader.readAsDataURL(file)
  }, [])

  const shuffle = () => {
    const next = (bgIdx + 1 + Math.floor(Math.random() * (CARD_BGS.length-1))) % CARD_BGS.length
    setShowCard(false); setTimeout(()=>{ setBgIdx(next); setShowCard(true) }, 160)
  }

  const randomizeTitle = () => {
    const cur = BUILDER_TITLES.indexOf(builderTitle)
    let next = Math.floor(Math.random() * BUILDER_TITLES.length)
    while (next===cur) next = Math.floor(Math.random() * BUILDER_TITLES.length)
    setBuilderTitle(BUILDER_TITLES[next]); setAnimKey(k=>k+1)
  }

  const addSticker = (type:StickerType) => {
    const id = Math.random().toString(36).slice(2)
    setStickers(prev=>[...prev,{ id, type, x:15+Math.random()*70, y:15+Math.random()*70, rotation:Math.round(Math.random()*30-15), color:stickerColor }])
    setActiveSticker(id)
  }
  const addPanelElem = (type:PanelElemType) => {
    const id = Math.random().toString(36).slice(2)
    setPanelElems(prev=>[...prev,{ id, type, x:15+Math.random()*70, y:30+Math.random()*40, rotation:Math.round(Math.random()*30-15), color:panelElemColor, scale:1 }])
    setActivePanelElem(id)
  }

  const handleDownload = async () => { setDownloading(true); setTimeout(()=>setDownloading(false), 900) }

  return (
    <div style={{ minHeight:'100dvh', background:C.sky, display:'flex', flexDirection:'column', color:C.text }} onClick={()=>{setActiveSticker(null);setActivePanelElem(null)}}>
      <BeachHeader title="Builder ID" onBack={onBack}/>
      <div style={{ flex:1, maxWidth:'1180px', width:'100%', margin:'0 auto', padding:'20px 18px 100px', display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:'18px', alignItems:'start' }}>

        {/* Left — Form */}
        <div style={{ background:C.panel, backdropFilter:'blur(20px)', borderRadius:'18px', padding:'22px', display:'flex', flexDirection:'column', gap:'15px', border:`1px solid ${C.border}` }}>
          <div>
            <h2 style={{ margin:'0 0 4px', fontFamily:'Righteous, sans-serif', fontSize:'22px', color:C.cream, fontWeight:400 }}>Your Details</h2>
            <p style={{ margin:0, fontSize:'12px', color:C.muted, lineHeight:1.6 }}>Your card gets a random botanical background. Shuffle to find your vibe.</p>
          </div>
          <div style={{ height:'1px', background:`linear-gradient(90deg,${C.pink},transparent)`, opacity:0.35 }}/>
          <UploadZone image={image} isDragging={isDragging} onDrop={e=>{e.preventDefault();setIsDragging(false);const f=e.dataTransfer.files[0];if(f)handleFile(f)}} onDragOver={e=>{e.preventDefault();setIsDragging(true)}} onDragLeave={()=>setIsDragging(false)} onFileInput={e=>e.target.files?.[0]&&handleFile(e.target.files[0])} onReplace={()=>fileInputRef.current?.click()} fileInputRef={fileInputRef as React.RefObject<HTMLInputElement|null>}/>
          <div><Lbl>NAME</Lbl><input type="text" placeholder="e.g. Priya Sharma" value={name} onChange={e=>{setName(e.target.value);setAnimKey(k=>k+1)}} style={inpSt}/></div>
          <div><Lbl>STACK / ROLE</Lbl>
            <select value={role} onChange={e=>{setRole(e.target.value);setAnimKey(k=>k+1)}} style={{ ...inpSt, backgroundImage:chevSvg, backgroundRepeat:'no-repeat', backgroundPosition:'right 11px center', appearance:'none' as const, color:role?C.text:C.muted }}>
              <option value="" disabled>Pick your stack…</option>
              {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div><Lbl>BUILDER TITLE</Lbl>
            <div style={{ display:'flex', gap:'6px' }}>
              <input type="text" value={builderTitle} onChange={e=>{setBuilderTitle(e.target.value);setAnimKey(k=>k+1)}} style={{ ...inpSt, flex:1, color:C.tealLight, fontFamily:'Space Mono, monospace', fontStyle:'italic', fontSize:'12px' }}/>
              <button onClick={randomizeTitle} className="btn-spring" title="Randomize" style={{ width:'38px', height:'38px', flexShrink:0, background:'rgba(213,157,56,0.12)', border:`1px solid rgba(213,157,56,0.3)`, borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.gold }}><IcDice/></button>
            </div>
          </div>

          {/* Photo stickers */}
          <StickerToolbar label="PHOTO STICKERS" onClearAll={()=>{setStickers([]);setActiveSticker(null)}} hasItems={stickers.length>0}>
            <div style={{ display:'flex', gap:'5px', marginBottom:'7px', flexWrap:'wrap' }}>
              {STICKER_DEFS.map(s=>(
                <button key={s.type} onClick={()=>addSticker(s.type)} className="btn-spring" style={{ width:'33px', height:'33px', borderRadius:'8px', background:C.glass, border:`1px solid ${C.border}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <StickerContent type={s.type} size={16} color={stickerColor}/>
                </button>
              ))}
            </div>
            <div style={{ display:'flex', gap:'5px', alignItems:'center' }}>
              <span style={{ fontFamily:'Space Mono, monospace', fontSize:'7.5px', color:C.muted, letterSpacing:'0.1em', marginRight:'2px' }}>COLOR</span>
              {STICKER_COLORS.map(c=>(
                <button key={c} onClick={()=>setStickerColor(c)} style={{ width:'16px', height:'16px', borderRadius:'50%', background:c, border:stickerColor===c?`2px solid ${C.cream}`:`1px solid ${C.border}`, cursor:'pointer', flexShrink:0 }}/>
              ))}
            </div>
          </StickerToolbar>

          {/* Design zone toolbar */}
          <StickerToolbar label="DESIGN ZONE SHAPES" onClearAll={()=>{setPanelElems([]);setActivePanelElem(null)}} hasItems={panelElems.length>0}>
            <div style={{ display:'flex', gap:'5px', marginBottom:'7px', flexWrap:'wrap' }}>
              {PANEL_TYPES.map(t=>(
                <button key={t} onClick={()=>addPanelElem(t)} className="btn-spring" style={{ width:'33px', height:'33px', borderRadius:'8px', background:C.glass, border:`1px solid ${C.border}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <PanelElemShape type={t} color={panelElemColor} size={18}/>
                </button>
              ))}
            </div>
            <div style={{ display:'flex', gap:'5px', alignItems:'center' }}>
              <span style={{ fontFamily:'Space Mono, monospace', fontSize:'7.5px', color:C.muted, letterSpacing:'0.1em', marginRight:'2px' }}>COLOR</span>
              {PANEL_ELEM_COLORS.map(c=>(
                <button key={c} onClick={()=>setPanelElemColor(c)} style={{ width:'16px', height:'16px', borderRadius:'50%', background:c, border:panelElemColor===c?`2px solid ${C.cream}`:`1px solid ${C.border}`, cursor:'pointer', flexShrink:0 }}/>
              ))}
            </div>
          </StickerToolbar>

          <ActionBar onDownload={handleDownload} downloading={downloading}/>
        </div>

        {/* Right — Preview */}
        <div style={{ position:'sticky', top:'18px' }}>
          <div style={{ background:C.panel, backdropFilter:'blur(20px)', borderRadius:'18px', padding:'18px', border:`1px solid ${C.border}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
              <span style={{ fontFamily:'Space Mono, monospace', fontSize:'9px', color:C.text, letterSpacing:'0.18em' }}>LIVE PREVIEW</span>
              <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                <button onClick={shuffle} className="btn-spring" style={{ display:'flex', alignItems:'center', gap:'5px', background:'rgba(213,157,56,0.12)', border:`1px solid rgba(213,157,56,0.3)`, borderRadius:'7px', padding:'4px 9px', cursor:'pointer', fontFamily:'Space Mono, monospace', fontSize:'8.5px', color:C.gold, fontWeight:700, letterSpacing:'0.08em' }}>
                  <IcShuffle/> {CARD_BGS[bgIdx%CARD_BGS.length].label}
                </button>
                <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                  <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#1B7900', animation:'pulse 2s infinite' }}/>
                  <span style={{ fontSize:'9px', fontFamily:'Space Mono, monospace', color:C.muted }}>LIVE</span>
                </div>
              </div>
            </div>
            <div style={{ minHeight:'380px', display:'flex', alignItems:'center', justifyContent:'center' }} onClick={e=>e.stopPropagation()}>
              {showCard
                ? <IdCardPreview image={image} name={name} role={role} builderTitle={builderTitle} bgIdx={bgIdx} stickers={stickers} panelElems={panelElems} photoRef={photoRef} panelRef={panelRef} onMoveSticker={(id,x,y)=>setStickers(prev=>prev.map(s=>s.id===id?{...s,x,y}:s))} onRemoveSticker={id=>{setStickers(prev=>prev.filter(s=>s.id!==id));setActiveSticker(null)}} activeSticker={activeSticker} onActivateSticker={setActiveSticker} onMovePanelElem={(id,x,y)=>setPanelElems(prev=>prev.map(e=>e.id===id?{...e,x,y}:e))} onRemovePanelElem={id=>{setPanelElems(prev=>prev.filter(e=>e.id!==id));setActivePanelElem(null)}} activePanelElem={activePanelElem} onActivatePanelElem={setActivePanelElem} animKey={animKey}/>
                : <div style={{ width:'260px', height:'400px', borderRadius:'18px', background:'linear-gradient(90deg,#0d2438 25%,#122c46 50%,#0d2438 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }}/>
              }
            </div>
            <p style={{ textAlign:'center', margin:'8px 0 0', fontFamily:'Space Mono, monospace', fontSize:'8.5px', color:C.muted, letterSpacing:'0.09em' }}>Portrait Badge · Builder ID Card</p>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}} @media(max-width:780px){.id-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState<Page>('home')

  if (page==='pfp') return <PfpPage onBack={()=>setPage('home')}/>
  if (page==='id')  return <IdPage  onBack={()=>setPage('home')}/>
  return <HomePage onNavigate={setPage}/>
}
