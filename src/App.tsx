import {
  useState, useRef, useCallback, useEffect,
  type DragEvent, type PointerEvent as ReactPointerEvent, type ChangeEvent,
} from 'react'
import heic2any from 'heic2any'
import { toPng } from 'html-to-image'

/* ─── Event Custom Themes ──────────────────────────────── */
interface ThemePreset {
  id: string
  label: string
  bgGradient: string
  cardBg: string
  cardBorder: string
  textColor: string
  mutedColor: string
  accentColor: string /* Gold/Yellow */
  highlightColor: string /* Pink */
  lanyardBg: string
  lanyardText: string
  wavyPatternColor: string
}

const THEMES: ThemePreset[] = [
  {
    id: 'emerald-goa',
    label: 'Emerald Goa',
    bgGradient: 'linear-gradient(135deg, #022316 0%, #054830 100%)',
    cardBg: '#094f32', // Deep forest emerald green matching event banner!
    cardBorder: '#fed215', // Vibrant Gold
    textColor: '#f7f4ea', // Bone/Cream
    mutedColor: 'rgba(247, 244, 234, 0.65)',
    accentColor: '#fed215', // Gold
    highlightColor: '#ff007f', // Hot Pink Devanagari text
    lanyardBg: '#053b25', // Deep green woven strap
    lanyardText: '#fed215',
    wavyPatternColor: '#0b5d3c',
  },
  {
    id: 'cyber-neon',
    label: 'Cyber Goa Neon',
    bgGradient: 'linear-gradient(135deg, #090514 0%, #170d35 100%)',
    cardBg: '#0f0923',
    cardBorder: '#00f2fe', // Electric Cyan
    textColor: '#e6e5ff',
    mutedColor: 'rgba(230, 229, 255, 0.55)',
    accentColor: '#00f2fe', // Cyan
    highlightColor: '#ff007f', // Pink
    lanyardBg: '#0f0923', // Dark violet strap
    lanyardText: '#00f2fe',
    wavyPatternColor: '#24144e',
  },
  {
    id: 'sunset-beach',
    label: 'Sunset Beach',
    bgGradient: 'linear-gradient(135deg, #401000 0%, #a04000 100%)',
    cardBg: '#3d1603',
    cardBorder: '#ffd700',
    textColor: '#fff3e6',
    mutedColor: 'rgba(255, 243, 230, 0.6)',
    accentColor: '#ffd700',
    highlightColor: '#ff5500',
    lanyardBg: '#1c1b1f', // Charcoal strap
    lanyardText: '#ffd700',
    wavyPatternColor: '#5c2205',
  },
  {
    id: 'iridescent-glass',
    label: 'Holo Glassmorphic',
    bgGradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.15) 100%)',
    cardBg: '#051f15', // Dark green glassmorphism
    cardBorder: '#fed215', // Gold
    textColor: '#ffffff',
    mutedColor: 'rgba(255, 255, 255, 0.5)',
    accentColor: '#f1c40f',
    highlightColor: '#ecf0f1',
    lanyardBg: '#1e293b', // Woven slate grey strap
    lanyardText: '#ffffff',
    wavyPatternColor: 'rgba(255, 255, 255, 0.08)',
  }
]

type Format = 'id' | 'pfp'
type FrameShape = 'arch' | 'shield' | 'circle' | 'classic'
type StickerType = 'lotus' | 'goa-stamp' | 'sparkle' | 'terminal' | 'sunglasses' | 'palm-tree'

interface Sticker {
  id: string
  type: StickerType
  x: number
  y: number
  rotation: number
  scale: number
  color: string
}

const BUILDER_TITLES = [
  "Decentralized Chai Wallah",
  "Chief Vibe Officer",
  "Proof-of-Vibe Engineer",
  "Full-Stack Goa Shipper",
  "Smart Contract Coconut",
  "Chai & Code Specialist",
  "Zero-Knowledge Zen Master",
  "Layer-2 Beach Bum",
  "dApp Drifter",
  "Web3 Wave Rider",
  "Hacker House Shaman",
  "Solidity Surfer"
]

const STACK_ROLES = [
  "Frontend / UI Engineer",
  "Backend / Systems",
  "Full-Stack Builder",
  "Web3 / Smart Contracts",
  "AI / ML Engineer",
  "Product Designer",
  "Developer Relations",
  "Founder / Hacker"
]

const STICKER_COLORS = [
  '#ff007f', // Hot Pink
  '#fed215', // Gold Yellow
  '#00f2fe', // Cyan
  '#ffffff', // White
  '#000000', // Black
]

/* ─── Dynamic SVG Vector Artwork ────────────────────────── */
function SVGScrollwork({ color, opacity = 0.8 }: { color: string; opacity?: number }) {
  return (
    <g opacity={opacity} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Top Left */}
      <path d="M 12,30 C 12,20 20,12 30,12" />
      <path d="M 10,25 C 10,18 18,10 25,10" />
      <path d="M 8,8 C 16,8 20,16 20,22 C 20,25 17,27 15,25 C 13,23 15,18 10,18 C 8,18 6,22 8,24" />
      <path d="M 32,8 C 32,15 25,22 22,22 C 19,22 18,18 20,15 C 22,12 25,15 28,10" fill={color} />
      <circle cx="12" cy="12" r="1.5" fill={color} />

      {/* Top Right */}
      <path d="M 288,30 C 288,20 280,12 270,12" />
      <path d="M 290,25 C 290,18 282,10 275,10" />
      <path d="M 292,8 C 284,8 280,16 280,22 C 280,25 283,27 285,25 C 287,23 285,18 290,18 C 292,18 294,22 292,24" />
      <path d="M 268,8 C 268,15 275,22 278,22 C 281,22 282,18 280,15 C 278,12 275,15 272,10" fill={color} />
      <circle cx="288" cy="12" r="1.5" fill={color} />

      {/* Bottom Left */}
      <path d="M 12,450 C 12,460 20,468 30,468" />
      <path d="M 10,455 C 10,462 18,470 25,470" />
      <path d="M 8,472 C 16,472 20,464 20,458 C 20,455 17,453 15,455 C 13,457 15,462 10,462 C 8,462 6,458 8,456" />
      <path d="M 32,472 C 32,465 25,458 22,458 C 19,458 18,462 20,465 C 22,468 25,465 28,470" fill={color} />
      <circle cx="12" cy="468" r="1.5" fill={color} />

      {/* Bottom Right */}
      <path d="M 288,450 C 288,460 280,468 270,468" />
      <path d="M 290,455 C 290,462 282,470 275,470" />
      <path d="M 292,472 C 284,472 280,464 280,458 C 280,455 283,453 285,455 C 287,457 285,462 290,462 C 292,462 294,458 292,456" />
      <path d="M 268,472 C 268,465 275,458 278,458 C 281,458 282,462 280,465 C 278,468 275,465 272,470" fill={color} />
      <circle cx="288" cy="468" r="1.5" fill={color} />
    </g>
  )
}

function SVGMandala({ color, x, y, size, opacity = 0.15 }: { color: string; x: number; y: number; size: number; opacity?: number }) {
  const r = size / 2
  return (
    <g opacity={opacity} transform={`translate(${x}, ${y})`} fill="none" stroke={color} strokeWidth="1">
      <circle cx="0" cy="0" r={r} strokeDasharray="3, 3" />
      <circle cx="0" cy="0" r={r - 10} />
      <circle cx="0" cy="0" r={r - 22} strokeWidth="1.5" />
      <circle cx="0" cy="0" r={8} fill={color} />
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i * 360) / 16
        return (
          <g key={i} transform={`rotate(${angle})`}>
            <path d={`M 0,${r - 22} C -6,${r - 15} -6,${r - 5} 0,0 C 6,${r - 5} 6,${r - 15} 0,${r - 22}`} fill={color} opacity="0.4" />
            <line x1="0" y1="0" x2="0" y2={r} />
            <circle cx="0" cy={r - 5} r="2" fill={color} />
          </g>
        )
      })}
    </g>
  )
}

function SVGWaves({ color, width, height, strokeWidth = 8, spacing = 20, opacity = 0.25 }: { color: string; width: number; height: number; strokeWidth?: number; spacing?: number; opacity?: number }) {
  const waveCount = Math.ceil(height / spacing) + 4
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice" opacity={opacity}>
      <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
        {Array.from({ length: waveCount }, (_, i) => {
          const y = i * spacing - 40
          const pathD = `M -20,${y} Q ${width * 0.25},${y - 15} ${width * 0.5},${y} T ${width + 20},${y}`
          return <path key={i} d={pathD} />
        })}
      </g>
    </svg>
  )
}

function SparkleSVG({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2Z" />
    </svg>
  )
}

function PalmLeafSVG({ color, size = 180 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" opacity="0.08" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 90 Q 50 50 90 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M30 70 Q 15 50 10 30" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M40 60 Q 25 40 20 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M50 50 Q 35 30 30 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M60 40 Q 50 15 55 5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M70 30 Q 75 15 80 5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M80 20 Q 90 15 95 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function FloatingLotus({ color, size = 120 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" opacity="0.08" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4C16 4 19 12 21 15C23 18 26 21 28 20C27 24 23 26 19 25C17 24.5 16.5 22 16 22C15.5 22 15 24.5 13 25C9 26 5 24 4 20C6 21 9 18 11 15C13 12 16 4 16 4Z" fill={color} />
      <path d="M16 22V28" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="22" r="2.5" fill={color} />
    </svg>
  )
}

function SilhouettedPalmTree({ position, swayOffset }: { position: 'left' | 'right'; swayOffset: number }) {
  return (
    <svg 
      className="absolute bottom-0 w-[240px] h-[400px] pointer-events-none z-10 opacity-75 hidden md:block"
      style={{
        left: position === 'left' ? '-30px' : 'auto',
        right: position === 'right' ? '-30px' : 'auto',
        transformOrigin: 'bottom center',
        transform: `rotate(${swayOffset * 2.5}deg) translateY(${Math.abs(swayOffset) * -3}px)`,
        filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.4))',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'
      }}
      viewBox="0 0 100 150"
      fill="#01190f"
    >
      {/* Trunk */}
      {position === 'left' ? (
        <path d="M 12,150 Q 25,90 35,20 C 33,20 28,90 14,150 Z" />
      ) : (
        <path d="M 88,150 Q 75,90 65,20 C 67,20 72,90 86,150 Z" />
      )}
      
      {/* Palm Leaves */}
      {position === 'left' ? (
        <g transform="translate(35, 20)">
          <path d="M 0,0 Q -25,-15 -45,-5 Q -25,-5 0,0" />
          <path d="M 0,0 Q -30,-5 -50,15 Q -25,10 0,0" />
          <path d="M 0,0 Q -20,-25 -30,-40 Q -15,-20 0,0" />
          <path d="M 0,0 Q 5,-30 15,-45 Q 5,-20 0,0" />
          <path d="M 0,0 Q 30,-20 45,-25 Q 20,-10 0,0" />
          <path d="M 0,0 Q 25,0 35,15 Q 15,5 0,0" />
        </g>
      ) : (
        <g transform="translate(65, 20)">
          <path d="M 0,0 Q 25,-15 45,-5 Q 25,-5 0,0" />
          <path d="M 0,0 Q 30,-5 50,15 Q 25,10 0,0" />
          <path d="M 0,0 Q 20,-25 30,-40 Q 15,-20 0,0" />
          <path d="M 0,0 Q -5,-30 -15,-45 Q -5,-20 0,0" />
          <path d="M 0,0 Q -30,-20 -45,-25 Q -20,-10 0,0" />
          <path d="M 0,0 Q -25,0 -35,15 Q -15,5 0,0" />
        </g>
      )}
    </svg>
  )
}

function LanyardVisual({ theme, width = 300 }: { theme: ThemePreset; width?: number }) {
  return (
    <div className="absolute left-1/2 -top-32 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20">
      <div 
        className="w-10 h-36 relative flex justify-center overflow-hidden shadow-lg"
        style={{
          background: theme.lanyardBg,
          borderRadius: '4px 4px 0 0',
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.4), 0 10px 15px rgba(0,0,0,0.3)',
        }}
      >
        <div 
          className="text-[6px] font-bold text-center tracking-[0.2em] uppercase select-none flex flex-col gap-8 pt-2"
          style={{ 
            color: theme.lanyardText, 
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            fontFamily: 'monospace'
          }}
        >
          <span>HACKER HOUSE GOA</span>
          <span>BUILD & SHIP 2026</span>
        </div>
        <div className="absolute inset-0 bg-repeat opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '4px 4px', backgroundPosition: '0 0, 2px 2px' }} />
      </div>

      <div className="w-6 h-6 rounded-full border-[3px] border-slate-300 bg-slate-500 -mt-1 shadow-md relative z-10 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-slate-700" />
      </div>
      <div className="w-3 h-8 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-200 border border-slate-400 rounded-b shadow-md flex flex-col items-center justify-end pb-1 relative z-10">
        <div className="w-1.5 h-6 border-2 border-slate-300 rounded-full -mb-3 bg-transparent shadow" />
      </div>
    </div>
  )
}

/* ─── Interactive Draggable Sticker Renderer ───────────── */
function DraggableSticker({
  sticker,
  containerRef,
  onMove,
  onRemove,
  isActive,
  onActivate
}: {
  sticker: Sticker
  containerRef: React.RefObject<HTMLDivElement | null>
  onMove: (id: string, x: number, y: number) => void
  onRemove: (id: string) => void
  isActive: boolean
  onActivate: (id: string | null) => void
}) {
  const dragging = useRef(false)
  const origin = useRef({ mx: 0, my: 0, sx: 0, sy: 0 })

  const onPD = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onActivate(sticker.id)
    dragging.current = true
    origin.current = { mx: e.clientX, my: e.clientY, sx: sticker.x, sy: sticker.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPM = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !containerRef.current) return
    const r = containerRef.current.getBoundingClientRect()
    const dx = ((e.clientX - origin.current.mx) / r.width) * 100
    const dy = ((e.clientY - origin.current.my) / r.height) * 100
    onMove(
      sticker.id,
      Math.max(2, Math.min(98, origin.current.sx + dx)),
      Math.max(2, Math.min(98, origin.current.sy + dy))
    )
  }

  const onPU = () => {
    dragging.current = false
  }

  return (
    <div
      onPointerDown={onPD}
      onPointerMove={onPM}
      onPointerUp={onPU}
      style={{
        position: 'absolute',
        left: `${sticker.x}%`,
        top: `${sticker.y}%`,
        transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
        cursor: 'grab',
        userSelect: 'none',
        touchAction: 'none',
        zIndex: isActive ? 50 : 30,
      }}
    >
      {isActive && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onRemove(sticker.id)
          }}
          className="absolute -top-5 -right-5 w-5 h-5 rounded-full bg-red-600 border border-white text-white flex items-center justify-center cursor-pointer text-xs font-bold shadow hover:bg-red-700"
        >
          ×
        </button>
      )}
      <div 
        className="p-1 rounded outline-dashed outline-offset-2"
        style={{ outlineColor: isActive ? sticker.color : 'transparent', outlineWidth: '1.5px' }}
      >
        <StickerAsset type={sticker.type} color={sticker.color} />
      </div>
    </div>
  )
}

function StickerAsset({ type, color, size = 32 }: { type: StickerType; color: string; size?: number }) {
  if (type === 'lotus') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4C16 4 19 12 21 15C23 18 26 21 28 20C27 24 23 26 19 25C17 24.5 16.5 22 16 22C15.5 22 15 24.5 13 25C9 26 5 24 4 20C6 21 9 18 11 15C13 12 16 4 16 4Z" fill={color} />
        <path d="M16 8C16 8 18 13 20 15C21 16 23 18 24 17.5C23.5 20.5 20.5 21.5 18 21C17 20.5 16.5 19 16 19C15.5 19 15 20.5 14 21C11.5 21.5 8.5 20.5 8 17.5C9 18 11 16 12 15C14 13 16 8 16 8Z" fill="#ffffff" opacity="0.6" />
        <path d="M16 22V28" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="22" r="2.5" fill={color} />
      </svg>
    )
  }
  if (type === 'goa-stamp') {
    return (
      <div 
        className="font-bold px-2 py-0.5 rounded border-2 shadow-md transform rotate-[-6deg] select-none text-[16px]"
        style={{ 
          fontFamily: "'Rozha One', serif", 
          color: color, 
          borderColor: color,
          backgroundColor: 'rgba(2, 26, 17, 0.95)',
          textShadow: `0 0 6px ${color}`
        }}
      >
        गोवा
      </div>
    )
  }
  if (type === 'sparkle') {
    return <SparkleSVG color={color} size={size} />
  }
  if (type === 'terminal') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="6" fill="rgba(2,26,17,0.95)" stroke={color} strokeWidth="1.5" />
        <path d="M8 11 L14 16 L8 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="15" y1="21" x2="23" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
  if (type === 'sunglasses') {
    return (
      <svg width={size * 1.3} height={size} viewBox="0 0 42 24" fill={color} stroke="none">
        <path d="M5 6h32a2 2 0 012 2v3a1 1 0 01-1 1h-6a4 4 0 01-8 0h-4a4 4 0 01-8 0H5a1 1 0 01-1-1V8a2 2 0 012-2z" />
        <path d="M4 11c0 4.4 3.6 8 8 8s8-3.6 8-8m2 0c0 4.4 3.6 8 8 8s8-3.6 8-8" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-9" strokeWidth="2.5" />
      <path d="M12 13Q8 9 3 11Q6 14 12 13" fill="none" />
      <path d="M12 13Q16 9 21 11Q18 14 12 13" fill="none" />
      <path d="M12 16Q9 12 5 13Q8 16 12 16" fill="none" />
      <path d="M12 16Q15 12 19 13Q16 16 12 16" fill="none" />
    </svg>
  )
}

function SVGBarcode({ value, color }: { value: string; color: string }) {
  const lines = [1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 4, 3, 1, 2, 3, 2, 4, 1, 3]
  return (
    <div className="flex flex-col items-center w-full gap-0.5">
      <svg width="180" height="26" viewBox="0 0 180 26" className="overflow-visible">
        <g fill={color}>
          {lines.map((w, idx) => {
            const x = idx * 6
            return <rect key={idx} x={x} y="0" width={w} height="26" opacity={idx % 2 === 0 ? 0.95 : 0.0} />
          })}
        </g>
      </svg>
      <span className="text-[7.5px] font-mono tracking-[0.25em]" style={{ color }}>
        {value.toUpperCase()}
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ID CARD PREVIEW COMPOSITE (3D Tilting & Interactive)
   ═══════════════════════════════════════════════════════════ */
function BadgeCardComponent({
  image, name, role, builderTitle, theme, stickers, frameShape, bgPattern,
  photoZoom, photoX, photoY, sideTextLeft, sideTextRight, barcodeVal,
  badgeRef, activeSticker, onMoveSticker, onRemoveSticker, onActivateSticker, isWearableMode
}: {
  image: string | null
  name: string
  role: string
  builderTitle: string
  theme: ThemePreset
  stickers: Sticker[]
  frameShape: FrameShape
  bgPattern: string
  photoZoom: number
  photoX: number
  photoY: number
  sideTextLeft: string
  sideTextRight: string
  barcodeVal: string
  badgeRef: React.RefObject<HTMLDivElement | null>
  activeSticker: string | null
  onMoveSticker: (id: string, x: number, y: number) => void
  onRemoveSticker: (id: string) => void
  onActivateSticker: (id: string | null) => void
  isWearableMode: boolean
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isWearableMode) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const rotateY = -((x / rect.width) - 0.5) * 30
    const rotateX = ((y / rect.height) - 0.5) * 30
    
    const glareX = (x / rect.width) * 100
    const glareY = (y / rect.height) * 100

    setTilt({ x: rotateX, y: rotateY })
    setGlare({ x: glareX, y: glareY })
  }

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  // Adjusted paths to support larger photo frame dimensions (146px width x 190px height)
  const getClipPath = () => {
    if (frameShape === 'arch') {
      return 'path("M 0,60 C 0,0 146,0 146,60 L 146,190 L 0,190 Z")'
    }
    if (frameShape === 'shield') {
      return 'path("M 0,0 L 146,0 L 146,140 C 146,170 73,190 73,190 C 73,190 0,170 0,140 Z")'
    }
    if (frameShape === 'circle') {
      return 'circle(70px at 73px 95px)'
    }
    return 'rect(0% 100% 100% 0% round 12px)'
  }

  const clipPathCSS = getClipPath()

  return (
    <div 
      className="card-perspective relative select-none"
      style={{ paddingBottom: isWearableMode ? '0' : '30px', transform: isWearableMode ? 'scale(0.85)' : 'none', transition: 'all 0.3s ease' }}
    >
      <LanyardVisual theme={theme} />

      <div
        ref={badgeRef as React.RefObject<HTMLDivElement>}
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        className="card-tilt relative w-[300px] h-[480px] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] cursor-pointer overflow-hidden"
        style={{
          transform: isWearableMode 
            ? 'rotateX(5deg) translateY(-10px)' 
            : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          '--glare-x': `${glare.x}%`,
          '--glare-y': `${glare.y}%`,
          border: `1.5px solid ${theme.cardBorder}`,
          background: theme.cardBg,
          color: theme.textColor,
        } as React.CSSProperties}
      >
        <div className="card-glare" />
        <div className="absolute inset-0 rounded-[24px] pointer-events-none holo-effect opacity-[0.22] z-30" />
        <div 
          className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-2.5 rounded-full z-40 shadow-inner"
          style={{ backgroundColor: '#021a11', border: `1px solid ${theme.cardBorder}` }}
        />

        <div className="absolute inset-0 flex flex-col justify-between p-5 pt-7 select-none overflow-hidden rounded-[24px]">
          <div className="absolute inset-0 pointer-events-none z-0">
            <div 
              className="absolute inset-0 opacity-[0.2]" 
              style={{ background: theme.bgGradient }}
            />

            {bgPattern === 'zebra' && (
              <SVGWaves color={theme.wavyPatternColor} width={300} height={480} strokeWidth={8} spacing={22} />
            )}
            {bgPattern === 'paisley' && (
              <>
                <SVGMandala color={theme.accentColor} x={40} y={120} size={110} opacity={0.12} />
                <SVGMandala color={theme.highlightColor} x={260} y={320} size={150} opacity={0.10} />
              </>
            )}
            {bgPattern === 'grid' && (
              <svg width="100%" height="100%" opacity="0.08" stroke={theme.textColor} strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gridPattern)" />
              </svg>
            )}

            <SVGScrollwork color={theme.accentColor} opacity={0.4} />
          </div>

          {/* Header section */}
          <div className="relative z-10 flex flex-col items-center mt-1">
            <span className="text-[7.5px] font-mono tracking-[0.25em] text-center" style={{ color: theme.mutedColor }}>
              28 - 31 OCT 2026 · GOA, INDIA
            </span>
            <div className="flex items-baseline justify-center gap-1.5 mt-0.5">
              <span className="font-semibold text-lg tracking-[0.1em]" style={{ fontFamily: "'Cinzel', serif", color: theme.textColor }}>
                HACKER HOUSE
              </span>
              <span className="text-[8px] font-mono border px-1 rounded" style={{ borderColor: theme.highlightColor, color: theme.highlightColor }}>
                GOA
              </span>
            </div>
            <div 
              className="absolute -top-1 right-2 text-2xl font-bold select-none opacity-90 transform rotate-[12deg] pointer-events-none"
              style={{ fontFamily: "'Rozha One', serif", color: theme.highlightColor }}
            >
              गोवा
            </div>
          </div>

          {/* Center Area: Photo + Sidebar Texts (Enlarged Photo Frame w: 146px, h: 190px) */}
          <div className="relative z-10 flex justify-between items-center h-[195px] my-1">
            <div 
              className="w-4 text-[8px] font-mono tracking-[0.18em] uppercase whitespace-nowrap text-center opacity-60"
              style={{ 
                writingMode: 'vertical-rl', 
                transform: 'rotate(180deg)',
                color: theme.textColor
              }}
            >
              {sideTextLeft || 'HUSTLE & SHIP'}
            </div>

            {/* Photo Frame (Resized from 130x165 to 146x190) */}
            <div className="relative flex justify-center items-center w-[146px] h-[190px]">
              <div 
                className="absolute inset-0 bg-transparent shadow-[0_8px_20px_rgba(0,0,0,0.4)] z-10 pointer-events-none"
                style={{ 
                  clipPath: clipPathCSS, 
                  border: `2px solid ${theme.accentColor}`,
                  background: 'rgba(0, 0, 0, 0.2)' 
                }}
              />

              <div 
                className="absolute inset-[2px] z-0 overflow-hidden bg-slate-950"
                style={{ clipPath: clipPathCSS }}
              >
                <SVGWaves color={theme.wavyPatternColor} width={146} height={190} strokeWidth={4} spacing={12} opacity={0.6} />
                <SVGMandala color={theme.accentColor} x={73} y={95} size={90} opacity={0.3} />
              </div>

              {image ? (
                <div 
                  className="absolute inset-[2px] z-10 overflow-hidden"
                  style={{ clipPath: clipPathCSS }}
                >
                  <img 
                    src={image} 
                    alt="User uploaded avatar" 
                    className="absolute max-w-none origin-center"
                    style={{
                      width: `${photoZoom * 100}%`,
                      height: 'auto',
                      left: `calc(50% + ${photoX}px)`,
                      top: `calc(50% + ${photoY}px)`,
                      transform: 'translate(-50%, -50%)',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              ) : (
                <div 
                  className="absolute inset-[2px] z-10 flex flex-col items-center justify-center gap-1.5 p-3 text-center"
                  style={{ clipPath: clipPathCSS, color: theme.mutedColor }}
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <circle cx="12" cy="13" r="3" strokeWidth="1.5" />
                  </svg>
                  <span className="text-[7.5px] font-mono tracking-widest uppercase">Upload Photo</span>
                </div>
              )}
            </div>

            <div 
              className="w-4 text-[8px] font-mono tracking-[0.18em] uppercase whitespace-nowrap text-center opacity-60"
              style={{ 
                writingMode: 'vertical-rl',
                color: theme.textColor
              }}
            >
              {sideTextRight || 'BUILD IN GOA'}
            </div>
          </div>

          {/* Bottom info section */}
          <div className="relative z-10 flex flex-col items-center gap-1 text-center mb-1 w-full">
            <div className="flex items-center justify-center gap-1.5 w-full px-1">
              {(!name || name.length <= 15) && <SparkleSVG color={theme.accentColor} size={8} />}
              <h2 
                className="font-bold tracking-wider uppercase leading-tight select-all text-center"
                style={{ 
                  fontFamily: "'Bodoni Moda', serif", 
                  color: theme.textColor,
                  fontSize: name.length > 20 
                    ? '11px' 
                    : name.length > 15 
                      ? '13px' 
                      : name.length > 10 
                        ? '15px' 
                        : '19px',
                  letterSpacing: name.length > 15 ? '0.04em' : '0.08em',
                  maxWidth: (!name || name.length <= 15) ? '180px' : '230px',
                  wordBreak: 'break-word'
                }}
              >
                {name || 'ANON BUILDER'}
              </h2>
              {(!name || name.length <= 15) && <SparkleSVG color={theme.accentColor} size={8} />}
            </div>

            <span 
              className="inline-block px-3 py-0.5 rounded-full text-[8.5px] font-bold tracking-[0.12em] uppercase font-mono mt-0.5"
              style={{ 
                backgroundColor: `${theme.highlightColor}15`, 
                border: `1px solid ${theme.highlightColor}`,
                color: theme.highlightColor 
              }}
            >
              {role || 'ANON STACK'}
            </span>

            <p 
              className="text-[9.5px] italic opacity-85 font-mono mt-0.5 text-center px-2"
              style={{ color: theme.accentColor }}
            >
              &ldquo;{builderTitle}&rdquo;
            </p>

            <div className="w-full h-px my-1.5 opacity-25" style={{ background: `linear-gradient(90deg, transparent, ${theme.textColor}, transparent)` }} />
            <SVGBarcode value={barcodeVal} color={theme.textColor} />
          </div>

          {stickers.map(s => (
            <DraggableSticker
              key={s.id}
              sticker={s}
              containerRef={badgeRef}
              onMove={onMoveSticker}
              onRemove={onRemoveSticker}
              isActive={activeSticker === s.id}
              onActivate={onActivateSticker}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── CIRCULAR PFP PREVIEW COMPONENT ────────────────────── */
function PfpPreviewComponent({
  image, name, role, theme, stickers, bgPattern,
  photoZoom, photoX, photoY, pfpRef, activeSticker,
  onMoveSticker, onRemoveSticker, onActivateSticker
}: {
  image: string | null
  name: string
  role: string
  theme: ThemePreset
  stickers: Sticker[]
  bgPattern: string
  photoZoom: number
  photoX: number
  photoY: number
  pfpRef: React.RefObject<HTMLDivElement | null>
  activeSticker: string | null
  onMoveSticker: (id: string, x: number, y: number) => void
  onRemoveSticker: (id: string) => void
  onActivateSticker: (id: string | null) => void
}) {
  const R = 110, CX = 145, CY = 145

  return (
    <div className="card-flip-enter flex flex-col items-center">
      <div 
        ref={pfpRef} 
        onClick={() => onActivateSticker(null)} 
        className="relative w-[290px] h-[290px] flex-shrink-0 cursor-pointer shadow-2xl"
      >
        <svg viewBox="0 0 290 290" className="absolute inset-0 w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="pfp-bg-clip"><circle cx={CX} cy={CY} r={R - 4} /></clipPath>
            <clipPath id="pfp-photo-clip"><circle cx={CX} cy={CY} r={R - 22} /></clipPath>
            <linearGradient id="pfp-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.accentColor} />
              <stop offset="50%" stopColor={theme.highlightColor} />
              <stop offset="100%" stopColor={theme.cardBorder} />
            </linearGradient>
            <path id="arc-t" d={`M ${CX - (R + 14)} ${CY} A ${R + 14} ${R + 14} 0 0 1 ${CX + (R + 14)} ${CY}`} />
            <path id="arc-b" d={`M ${CX - (R + 14)} ${CY} A ${R + 14} ${R + 14} 0 0 0 ${CX + (R + 14)} ${CY}`} />
          </defs>

          <circle cx={CX} cy={CY} r={R + 24} fill="none" stroke={theme.accentColor} strokeWidth="1" strokeDasharray="3 6" opacity="0.4" />
          
          <g clipPath="url(#pfp-bg-clip)">
            <rect x={CX - R} y={CY - R} width={R * 2} height={R * 2} fill={theme.cardBg} />
            
            {bgPattern === 'zebra' && (
              <g opacity="0.4">
                <path d={`M ${CX-R} ${CY-R} L ${CX+R} ${CY+R} M ${CX-R+40} ${CY-R} L ${CX+R} ${CY+R-40} M ${CX-R} ${CY-R+40} L ${CX+R-40} ${CY+R}`} stroke={theme.wavyPatternColor} strokeWidth="12" />
              </g>
            )}
            {bgPattern === 'paisley' && (
              <circle cx={CX} cy={CY} r={R - 22} fill="none" stroke={theme.accentColor} strokeWidth="1" opacity="0.2" />
            )}
            {bgPattern === 'grid' && (
              <g opacity="0.1" stroke={theme.textColor} strokeWidth="1">
                {Array.from({ length: 12 }).map((_, i) => {
                  const spacing = 20
                  const offset = i * spacing + 30
                  return (
                    <g key={i}>
                      <line x1={offset} y1="0" x2={offset} y2="290" />
                      <line x1="0" y1={offset} x2="290" y2={offset} />
                    </g>
                  )
                })}
              </g>
            )}
          </g>

          <circle cx={CX} cy={CY} r={R} fill="none" stroke="url(#pfp-ring)" strokeWidth="12" />
          <circle cx={CX} cy={CY} r={R - 6} fill="none" stroke={theme.cardBg} strokeWidth="2" />

          {image ? (
            <g clipPath="url(#pfp-photo-clip)">
              <rect x={CX - R} y={CY - R} width={R * 2} height={R * 2} fill="#0d1b15" />
              <image 
                href={image} 
                x={CX - (R - 22) + photoX} 
                y={CY - (R - 22) + photoY} 
                width={(R - 22) * 2 * photoZoom} 
                height={(R - 22) * 2 * photoZoom} 
                preserveAspectRatio="xMidYMid slice" 
              />
            </g>
          ) : (
            <g clipPath="url(#pfp-photo-clip)">
              <circle cx={CX} cy={CY} r={R - 22} fill="rgba(0,0,0,0.3)" />
              <circle cx={CX} cy={CY} r={R - 22} fill="none" stroke={theme.textColor} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />
              <text x={CX} y={CY + 4} textAnchor="middle" fill={theme.textColor} fontSize="8" fontFamily="monospace" letterSpacing="1.5" opacity="0.6">UPLOAD PHOTO</text>
            </g>
          )}

          <circle cx={CX} cy={CY} r={R - 22} fill="none" stroke={theme.accentColor} strokeWidth="1.5" opacity="0.8" />

          <text fontSize="8.5" fontFamily="'Space Mono', monospace" fontWeight="700" letterSpacing="2.5" fill={theme.textColor}>
            <textPath href="#arc-t" startOffset="50%" textAnchor="middle">
              HACKER HOUSE GOA · 2026
            </textPath>
          </text>
          <text fontSize="7.5" fontFamily="'Space Mono', monospace" fontWeight="700" letterSpacing="2" fill={theme.highlightColor} opacity="0.85">
            <textPath href="#arc-b" startOffset="50%" textAnchor="middle">
              BUILDER RESIDENCY · {role || 'DEVELOPER'}
            </textPath>
          </text>

          {[0, 120, 240].map((deg, i) => {
            const rRad = (deg * Math.PI) / 180
            return (
              <circle key={i} cx={CX + (R + 24) * Math.cos(rRad)} cy={CY + (R + 24) * Math.sin(rRad)} r="3" fill={i % 2 === 0 ? theme.accentColor : theme.highlightColor} />
            )
          })}
        </svg>

        {stickers.map(s => (
          <DraggableSticker
            key={s.id}
            sticker={s}
            containerRef={pfpRef}
            onMove={onMoveSticker}
            onRemove={onRemoveSticker}
            isActive={activeSticker === s.id}
            onActivate={onActivateSticker}
          />
        ))}
      </div>
      
      {name && (
        <div className="mt-4 glass-panel px-4 py-1.5 rounded-full border border-slate-700/50 text-center shadow-lg transform translate-y-[-10px] max-w-[240px] truncate">
          <span 
            className="font-mono tracking-[0.2em] block" 
            style={{ 
              color: theme.accentColor,
              fontSize: name.length > 18 ? '8.5px' : '10px'
            }}
          >
            {name.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP DASHBOARD CONTAINER
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const [view, setView] = useState<'welcome' | 'builder'>('welcome')
  const [format, setFormat] = useState<Format>('id')
  
  // Custom states matching Format B requirements
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [builderTitle, setBuilderTitle] = useState(BUILDER_TITLES[0])
  const [github, setGithub] = useState('')
  const [twitter, setTwitter] = useState('')
  
  const [themeIdx, setThemeIdx] = useState(0)
  const [frameShape, setFrameShape] = useState<FrameShape>('arch')
  const [bgPattern, setBgPattern] = useState<string>('zebra')
  const [sideTextLeft, setSideTextLeft] = useState('HUSTLE & SHIP')
  const [sideTextRight, setSideTextRight] = useState('BUILD IN GOA')
  
  // Photo positioning & scale states
  const [image, setImage] = useState<string | null>(null)
  const [photoZoom, setPhotoZoom] = useState(1.0)
  const [photoX, setPhotoX] = useState(0)
  const [photoY, setPhotoY] = useState(0)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [heicLoading, setHeicLoading] = useState(false)

  // 3D Parallax Mouse Tracking State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handlePagePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const x = (e.clientX / window.innerWidth) - 0.5
    const y = (e.clientY / window.innerHeight) - 0.5
    setMousePos({ x, y })
  }

  // Interactive Drag Stickers
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [activeSticker, setActiveSticker] = useState<string | null>(null)
  const [selectedStickerColor, setSelectedStickerColor] = useState(STICKER_COLORS[0])
  
  // Card views & utility
  const [isWearableMode, setIsWearableMode] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'frame' | 'theme' | 'stickers'>('profile')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const pfpRef = useRef<HTMLDivElement>(null)

  const activeTheme = THEMES[themeIdx]
  const [barcodeVal, setBarcodeVal] = useState('HHG-2026-X80A')

  useEffect(() => {
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
    const namePart = name ? name.substring(0, 3).toUpperCase() : 'ANON'
    setBarcodeVal(`HHG-2026-${namePart}-${randomPart}`)
  }, [name, role, format])

  const handleFile = useCallback(async (file: File) => {
    let targetFile = file
    
    // Support HEIC photos from iPhone
    if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
      setHeicLoading(true)
      try {
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        })
        const singleBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
        targetFile = new File([singleBlob], file.name.replace(/\.heic$/i, '.jpg'), {
          type: 'image/jpeg'
        })
      } catch (err) {
        console.error("HEIC conversion failed:", err)
      } finally {
        setHeicLoading(false)
      }
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target?.result as string)
      setPhotoZoom(1.0)
      setPhotoX(0)
      setPhotoY(0)
    }
    reader.readAsDataURL(targetFile)
  }, [])

  const randomizeIdentity = () => {
    const firstNames = ["Arjun", "Kabir", "Aarav", "Neha", "Ishaan", "Riya", "Diya", "Rohan", "Dev", "Tanya", "Meera", "Vikram"]
    const lastNames = ["Sharma", "Verma", "Mehta", "Patel", "Singh", "Joshi", "Iyer", "Nair", "Reddy", "Sen", "Roy", "Rao"]
    const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
    
    // Retain the name, github, and twitter handles if the user has already entered them!
    if (!name.trim()) {
      setName(randomName)
      setGithub(randomName.toLowerCase().replace(" ", ""))
      setTwitter(randomName.toLowerCase().replace(" ", "_"))
    }
    
    setRole(STACK_ROLES[Math.floor(Math.random() * STACK_ROLES.length)])
    setBuilderTitle(BUILDER_TITLES[Math.floor(Math.random() * BUILDER_TITLES.length)])
    setThemeIdx(Math.floor(Math.random() * THEMES.length))
    setFrameShape(['arch', 'shield', 'circle', 'classic'][Math.floor(Math.random() * 4)] as FrameShape)
    setBgPattern(['zebra', 'paisley', 'grid'][Math.floor(Math.random() * 3)])
    
    const sideTextsL = ["SHIP IT HARD", "WAGMI GOA", "CHAI ONLY", "10X SOLVER", "ZERO SLACK", "CODE SUNSET"]
    const sideTextsR = ["VIBES ONLY", "BUILD GOA", "ON-CHAIN", "AI AGENT", "DECENTRAL", "SHROOM VIBE"]
    setSideTextLeft(sideTextsL[Math.floor(Math.random() * sideTextsL.length)])
    setSideTextRight(sideTextsR[Math.floor(Math.random() * sideTextsR.length)])

    const id = Math.random().toString(36).slice(2)
    const randomStickerTypes: StickerType[] = ['lotus', 'goa-stamp', 'sparkle']
    setStickers([
      {
        id,
        type: randomStickerTypes[Math.floor(Math.random() * randomStickerTypes.length)],
        x: 30 + Math.random() * 40,
        y: 40 + Math.random() * 30,
        rotation: Math.round(Math.random() * 40 - 20),
        scale: 1,
        color: STICKER_COLORS[Math.floor(Math.random() * STICKER_COLORS.length)]
      }
    ])
  }

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingOver(true)
  }

  const onDragLeave = () => {
    setIsDraggingOver(false)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const onFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const addSticker = (type: StickerType) => {
    const id = Math.random().toString(36).slice(2)
    setStickers(prev => [
      ...prev,
      {
        id,
        type,
        x: 50,
        y: 50,
        rotation: Math.round(Math.random() * 30 - 15),
        scale: 1.0,
        color: selectedStickerColor
      }
    ])
    setActiveSticker(id)
  }

  const removeSticker = (id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id))
    setActiveSticker(null)
  }

  const moveSticker = (id: string, x: number, y: number) => {
    setStickers(prev => prev.map(s => (s.id === id ? { ...s, x, y } : s)))
  }

  // Captures the entire badge layout including backgrounds, photos, barcodes, name, and stickers
  const handleDownload = async () => {
    const targetRef = format === 'id' ? badgeRef : pfpRef
    if (!targetRef.current) return
    
    setDownloading(true)
    
    try {
      const dataUrl = await toPng(targetRef.current, {
        pixelRatio: 2,
        style: {
          transform: 'none',
        }
      })
      
      const downloadLink = document.createElement('a')
      downloadLink.href = dataUrl
      downloadLink.download = `hhgoa2026-${format}-${name ? name.toLowerCase().replace(/\s+/g, "-") : 'badge'}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      setDownloading(false)
    } catch (e) {
      console.error("Export failed:", e)
      setDownloading(false)
    }
  }

  // Share handler: copies high-quality PNG to clipboard first so user can paste it directly into X composer!
  const shareOnX = async () => {
    const targetRef = format === 'id' ? badgeRef : pfpRef
    if (!targetRef.current) return
    
    let copiedToClipboard = false
    try {
      const dataUrl = await toPng(targetRef.current, {
        pixelRatio: 2,
        style: {
          transform: 'none',
        }
      })
      
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ])
        copiedToClipboard = true
      }
    } catch (e) {
      console.warn("Clipboard write failed or not supported in iframe:", e)
    }

    if (copiedToClipboard) {
      alert("Badge image copied to clipboard! You can paste (Ctrl+V) it directly inside the X composer text box to attach and preview it.")
    } else {
      alert("Opening X composer... Make sure to download your badge first and attach it to your post!")
    }

    const tweetText = `Just created my Hacker House Goa 2026 Residency Badge! Excited to ship at the beach! 🌴🦀💻\n\nCreate your badge/PFP overlay here: https://hhg-badge.figma.make\n#FrameInGoa #HackerHouseGoa`
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
    window.open(shareUrl, '_blank')
  }

  // Calculate mouse position percentage across screen (0 to 1) for the sunset beach animation
  const cursorPct = mousePos.x + 0.5

  return (
    <div 
      onPointerMove={handlePagePointerMove} 
      className="min-h-screen flex flex-col font-sans relative overflow-hidden bg-[#021810] transition-colors duration-500"
    >
      {/* ─── INTERACTIVE SUNSET BEACH BACKGROUND LAYERS ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* Sky Daytime Layer */}
        <div 
          className="absolute inset-0 transition-opacity duration-500 ease-out"
          style={{
            background: 'linear-gradient(to bottom, #115e3b 0%, #047857 40%, #fed215 100%)',
            opacity: 1 - cursorPct
          }}
        />

        {/* Sky Sunset/Twilight Layer */}
        <div 
          className="absolute inset-0 transition-opacity duration-500 ease-out"
          style={{
            background: 'linear-gradient(to bottom, #022316 0%, #4a044e 35%, #be123c 65%, #fb7185 100%)',
            opacity: cursorPct
          }}
        />

        {/* Setting Sun */}
        <div 
          className="absolute left-1/2 rounded-full transition-all duration-300 ease-out"
          style={{
            width: '180px',
            height: '180px',
            bottom: `${12 + (1 - cursorPct) * 45}%`, // Sun sets as cursor goes left to right
            transform: 'translateX(-50%)',
            background: `radial-gradient(circle, ${cursorPct < 0.6 ? '#fed215' : '#ff4500'} 0%, rgba(254, 210, 21, 0) 70%)`,
            boxShadow: `0 0 80px ${cursorPct < 0.6 ? 'rgba(254, 210, 21, 0.6)' : 'rgba(255, 69, 0, 0.4)'}`,
            opacity: 0.95 - cursorPct * 0.3
          }}
        />

        {/* Ocean Horizon Horizon Water & Sand */}
        <div className="absolute bottom-0 left-0 right-0 h-[140px] z-0">
          {/* Sea water */}
          <div 
            className="absolute inset-0 transition-colors duration-500"
            style={{
              borderTop: '2.5px solid rgba(254, 210, 21, 0.25)',
              background: cursorPct < 0.6 ? 'linear-gradient(to bottom, #075e3c, #022316)' : 'linear-gradient(to bottom, #022316, #090514)'
            }}
          />
          
          {/* Sunset glow reflection on the sea */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[240px] h-[100px] transition-all duration-300"
            style={{
              background: `radial-gradient(ellipse at top, ${cursorPct < 0.6 ? '#fed215' : '#ff4500'}25 0%, transparent 70%)`,
              opacity: 0.85 - cursorPct * 0.4
            }}
          />

          {/* Animated Wave vectors */}
          <div className="absolute bottom-0 left-0 right-0 h-[60px] opacity-10">
            <SVGWaves color="#f7f4ea" width={1920} height={60} strokeWidth={2} spacing={15} opacity={0.6} />
          </div>
        </div>

        {/* Dynamic Silhouetted Coconut Palms sway with cursor */}
        <SilhouettedPalmTree position="left" swayOffset={mousePos.x} />
        <SilhouettedPalmTree position="right" swayOffset={mousePos.x} />

        {/* Front Particle Layer: Star Sparkles */}
        <div 
          className="absolute inset-0 transition-transform duration-700 ease-out"
          style={{ transform: `translate3d(${mousePos.x * -90}px, ${mousePos.y * -90}px, 0)` }}
        >
          <div className="absolute top-[20%] left-[25vw] rotate-[15deg] opacity-40"><SparkleSVG color="#fed215" size={24} /></div>
          <div className="absolute bottom-[25%] right-[20vw] rotate-[-12deg] opacity-30"><SparkleSVG color="#ff007f" size={28} /></div>
          <div className="absolute top-[8%] right-[30vw] rotate-[45deg] opacity-35"><SparkleSVG color="#fed215" size={18} /></div>
          <div className="absolute bottom-[10%] left-[15vw] rotate-[35deg] opacity-45"><SparkleSVG color="#ff007f" size={20} /></div>
        </div>
      </div>

      {/* ─── VIEW 1: WELCOME & INSTRUCTIONS PAGE ─── */}
      {view === 'welcome' && (
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 relative z-10 max-w-[960px] mx-auto w-full">
          
          {/* Logo & Header */}
          <div className="flex items-center gap-3 mb-4 animate-[fade-slide-up_0.4s_ease]">
            <div className="w-11 h-11 rounded-xl bg-pink-600 shadow-[0_0_20px_rgba(219,11,90,0.5)] flex items-center justify-center font-mono font-bold text-lg text-white select-none">
              HH
            </div>
            <div>
              <h2 className="text-xs font-mono tracking-[0.3em] text-[#fed215] uppercase font-bold">Builder Residency</h2>
              <h1 className="text-xl sm:text-2xl font-mono tracking-[0.2em] text-[#f7f4ea] font-bold leading-tight">HACKER HOUSE GOA</h1>
            </div>
          </div>

          {/* Hero Headline */}
          <div className="text-center max-w-[700px] mb-8 animate-[fade-slide-up_0.5s_ease]">
            <h1 
              className="text-4xl sm:text-6xl font-bold tracking-tight text-[#f7f4ea] leading-none"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Badge & PFP <span className="text-[#ff007f] block sm:inline">Generator</span>
            </h1>
            <p className="text-xs sm:text-sm font-mono tracking-[0.1em] text-emerald-300 mt-4 leading-relaxed max-w-[550px] mx-auto opacity-90">
              Build your customized digital residency badge or circular profile overlay for Hacker House Goa 2026 in seconds.
            </p>
          </div>

          {/* Instructions Box */}
          <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 shadow-xl animate-[fade-slide-up_0.6s_ease]">
            <h3 className="text-[11px] font-mono text-[#fed215] uppercase tracking-[0.2em] font-bold border-b border-emerald-800 pb-3 mb-6">
              Residency Task: Build Instructions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 1 & 2 */}
              <div className="flex flex-col gap-5">
                <div className="flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-full bg-[#fed215]/10 border border-[#fed215]/30 flex items-center justify-center text-xs font-mono font-bold text-[#fed215] flex-shrink-0">
                    01
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#f7f4ea]">Upload Profile Photo</h4>
                    <p className="text-xs text-emerald-100/70 mt-1 leading-relaxed">
                      Select your photo. Supports PNG, JPG, and iPhone **HEIC** formats. Zoom and pan to fit perfectly.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-full bg-[#ff007f]/10 border border-[#ff007f]/30 flex items-center justify-center text-xs font-mono font-bold text-[#ff007f] flex-shrink-0">
                    02
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#f7f4ea]">Input Identity Details</h4>
                    <p className="text-xs text-emerald-100/70 mt-1 leading-relaxed">
                      Enter your name and developer track. Randomize or write a customized Gen-Z builder title.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 & 4 */}
              <div className="flex flex-col gap-5">
                <div className="flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-full bg-[#fed215]/10 border border-[#fed215]/30 flex items-center justify-center text-xs font-mono font-bold text-[#fed215] flex-shrink-0">
                    03
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#f7f4ea]">Select Format & Vibes</h4>
                    <p className="text-xs text-emerald-100/70 mt-1 leading-relaxed">
                      Toggle between **ID Badge** or **Circle PFP**. Customize backing waves, theme colors, and drag stickers on top.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-mono font-bold text-purple-300 flex-shrink-0">
                    04
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#f7f4ea]">Export & Share on X</h4>
                    <p className="text-xs text-emerald-100/70 mt-1 leading-relaxed">
                      Download your 2x high-resolution PNG instantly, and click Share to post with **#FrameInGoa** to complete submission.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA Trigger */}
            <div className="mt-8 pt-5 border-t border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[10px] font-mono text-emerald-400">
                Deadline: 11:59 pm, 13th August 2026
              </span>
              <button
                type="button"
                onClick={() => setView('builder')}
                className="btn-spring bg-gradient-to-r from-[#e5b83b] via-[#ff007f] to-[#e5b83b] text-[#03080f] font-mono font-bold tracking-[0.15em] py-3.5 px-8 rounded-full text-xs cursor-pointer shadow-md uppercase hover:brightness-110"
              >
                Launch Badge Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── VIEW 2: ACTIVE DESIGN STUDIO ─── */}
      {view === 'builder' && (
        <>
          {/* Header bar */}
          <header className="relative z-20 glass-panel border-b border-[#fed215]/20 py-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-pink-600 shadow-[0_0_15px_rgba(219,11,90,0.4)] flex items-center justify-center font-mono font-bold text-sm text-white select-none">
                HH
              </div>
              <div>
                <h1 className="text-sm font-mono tracking-[0.25em] text-[#f7f4ea] font-bold">HACKER HOUSE GOA</h1>
                <p className="text-[9px] font-mono tracking-widest text-[#fed215] uppercase font-semibold">Builder Badge Residency · 2026</p>
              </div>
            </div>

            {/* Formats Selector Toggle (Pill Switch) */}
            <div className="flex bg-[#021810] p-1 rounded-full border border-emerald-900/60 z-10 shadow-inner">
              <button 
                type="button"
                onClick={() => setFormat('id')}
                className={`px-5 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider transition-all cursor-pointer ${
                  format === 'id' 
                    ? 'bg-gradient-to-r from-[#fed215] to-[#ff007f] text-[#021a11] shadow-md' 
                    : 'text-emerald-500 hover:text-white'
                }`}
              >
                ID Badge
              </button>
              <button 
                type="button"
                onClick={() => setFormat('pfp')}
                className={`px-5 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider transition-all cursor-pointer ${
                  format === 'pfp' 
                    ? 'bg-gradient-to-r from-[#fed215] to-[#ff007f] text-[#021a11] shadow-md' 
                    : 'text-emerald-500 hover:text-white'
                }`}
              >
                Circle PFP
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => setView('welcome')}
                className="px-3 py-1.5 rounded-lg text-xs font-mono border border-emerald-800 bg-[#021a11] hover:bg-emerald-950 text-emerald-300 cursor-pointer shadow-sm"
              >
                Instructions
              </button>
              <button 
                type="button"
                onClick={randomizeIdentity}
                className="btn-spring bg-gradient-to-r from-emerald-500/10 to-teal-500/15 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-lg text-xs font-mono tracking-wider cursor-pointer font-bold shadow-sm"
              >
                Roll Random ID
              </button>
            </div>
          </header>

          {/* Main Workspace Dashboard */}
          <main className="flex-1 max-w-[1240px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
            
            {/* Left Customize Inputs Box */}
            <section className="lg:col-span-7 glass-panel rounded-2xl p-5 sm:p-6 flex flex-col gap-6 shadow-xl z-10">
              <div>
                <span className="text-[10px] font-mono text-[#fed215] tracking-[0.2em] uppercase font-bold">Badge customizer</span>
                <h2 className="text-2xl font-bold tracking-wide text-white mt-1">Design Studio</h2>
                <p className="text-xs text-emerald-200/60 mt-1 leading-relaxed">
                  Design a wearable badge for Hacker House Goa 2026. Customize details, frames, background patterns, and drag custom stamps on top.
                </p>
              </div>

              {/* Navigation Sub-Tabs inside editor */}
              <div className="flex border-b border-emerald-900 pb-2 gap-2 overflow-x-auto">
                {(['profile', 'frame', 'theme', 'stickers'] as const).map(tab => (
                  <button
                    type="button"
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-[10px] font-mono tracking-[0.15em] uppercase pb-2 px-1 border-b-2 cursor-pointer transition-all whitespace-nowrap ${
                      activeTab === tab 
                        ? 'border-[#ff007f] text-white font-bold' 
                        : 'border-transparent text-emerald-500 hover:text-emerald-300'
                    }`}
                  >
                    {tab === 'profile' ? 'Identity' : tab === 'frame' ? 'Position' : tab === 'theme' ? 'Vibe / Theme' : 'Stickers'}
                  </button>
                ))}
              </div>

              {/* TAB 1: Profile & Identity details */}
              {activeTab === 'profile' && (
                <div className="flex flex-col gap-4 animate-[fade-slide-up_0.3s_ease]">
                  {/* Photo Upload Zone */}
                  <div 
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      isDraggingOver 
                        ? 'border-emerald-400 bg-emerald-500/5' 
                        : image 
                          ? 'border-emerald-600/40 bg-emerald-950/5' 
                          : 'border-emerald-800/40 hover:border-emerald-700 bg-[#012519]/40'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={onFileInput} 
                      accept="image/*,.heic" 
                      className="hidden" 
                    />
                    
                    {heicLoading ? (
                      <div className="flex flex-col items-center gap-2">
                        <svg className="animate-spin h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="text-xs font-mono font-bold text-slate-300">Converting HEIC image...</p>
                      </div>
                    ) : image ? (
                      <div className="flex items-center justify-center gap-4">
                        <img 
                          src={image} 
                          alt="Thumbnail avatar" 
                          className="w-12 h-16 object-cover rounded-md border border-emerald-800/40"
                        />
                        <div className="text-left">
                          <p className="text-xs font-semibold text-emerald-400 font-mono">Photo uploaded successfully</p>
                          <p className="text-[10px] text-emerald-300/60 mt-0.5">Drag new file or click here to replace</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs font-mono font-bold text-emerald-300">Drag & Drop profile photo here</p>
                        <p className="text-[9px] text-emerald-500 uppercase tracking-wider font-mono">Supports PNG, JPG, WEBP, HEIC. Portait crop is best</p>
                      </div>
                    )}
                  </div>

                  {/* Name input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-[#fed215] tracking-wider uppercase font-bold">Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Priyanshu Sharma" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={22}
                      className="bg-[#012619]/80 border border-emerald-800/60 rounded-lg px-3 py-2 text-sm text-[#f7f4ea] focus:outline-none focus:border-[#ff007f] shadow-sm font-semibold"
                    />
                  </div>

                  {/* Role select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-[#fed215] tracking-wider uppercase font-bold">Stack / Role (Fun fields)</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="bg-[#012619]/80 border border-emerald-800/60 rounded-lg px-3 py-2 text-sm text-[#f7f4ea] focus:outline-none focus:border-[#ff007f] shadow-sm font-semibold"
                    >
                      <option value="" disabled className="bg-[#021a11] text-emerald-200">Select your hacker track...</option>
                      {STACK_ROLES.map(r => (
                        <option key={r} value={r} className="bg-[#021a11] text-emerald-200">{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Builder Title input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-[#fed215] tracking-wider uppercase font-bold">Builder Title</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="e.g. Smart Contract Coconut" 
                        value={builderTitle}
                        onChange={(e) => setBuilderTitle(e.target.value)}
                        maxLength={32}
                        className="flex-1 bg-[#012619]/80 border border-emerald-800/60 rounded-lg px-3 py-2 text-sm text-[#f7f4ea] focus:outline-none focus:border-[#ff007f] shadow-sm font-mono italic"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const next = BUILDER_TITLES[Math.floor(Math.random() * BUILDER_TITLES.length)]
                          setBuilderTitle(next)
                        }}
                        className="btn-spring px-3 bg-[#012619]/80 border border-emerald-800/60 rounded-lg text-emerald-300 hover:text-white cursor-pointer font-mono font-bold text-xs shadow-sm"
                        title="Randomize Title"
                      >
                        RANDOM
                      </button>
                    </div>
                  </div>

                  {/* GitHub and Twitter for QR / Barcode mapping */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-[#fed215] tracking-wider uppercase font-bold">GitHub handle</label>
                      <input 
                        type="text" 
                        placeholder="e.g. priyanshusharma" 
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        className="bg-[#012619]/80 border border-emerald-800/60 rounded-lg px-3 py-2 text-sm text-[#f7f4ea] focus:outline-none focus:border-[#ff007f] shadow-sm font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-[#fed215] tracking-wider uppercase font-bold">Twitter handle (X)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. priyanshu_sh" 
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        className="bg-[#012619]/80 border border-emerald-800/60 rounded-lg px-3 py-2 text-sm text-[#f7f4ea] focus:outline-none focus:border-[#ff007f] shadow-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Photo Scale and Positioning Adjuster */}
              {activeTab === 'frame' && (
                <div className="flex flex-col gap-5 animate-[fade-slide-up_0.3s_ease]">
                  <div className="bg-[#012519]/40 border border-emerald-900/60 rounded-xl p-4 flex flex-col gap-4 shadow-sm">
                    <p className="text-[10px] font-mono text-[#fed215] uppercase tracking-wider font-bold">Photo Cropping adjustments</p>
                    
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-mono text-emerald-300">
                        <span>Scale / Zoom ({photoZoom.toFixed(1)}x)</span>
                        <button type="button" onClick={() => setPhotoZoom(1.0)} className="text-[10px] text-pink-500 hover:text-pink-400 cursor-pointer font-bold">Reset</button>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="3.0" 
                        step="0.1" 
                        value={photoZoom}
                        onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                        className="w-full h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#ff007f]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-mono text-emerald-300">
                        <span>Move Horizontally (X: {photoX}px)</span>
                        <button type="button" onClick={() => setPhotoX(0)} className="text-[10px] text-pink-500 hover:text-pink-400 cursor-pointer font-bold">Reset</button>
                      </div>
                      <input 
                        type="range" 
                        min="-80" 
                        max="80" 
                        step="1" 
                        value={photoX}
                        onChange={(e) => setPhotoX(parseInt(e.target.value))}
                        className="w-full h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#ff007f]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-mono text-emerald-300">
                        <span>Move Vertically (Y: {photoY}px)</span>
                        <button type="button" onClick={() => setPhotoY(0)} className="text-[10px] text-pink-500 hover:text-pink-400 cursor-pointer font-bold">Reset</button>
                      </div>
                      <input 
                        type="range" 
                        min="-80" 
                        max="80" 
                        step="1" 
                        value={photoY}
                        onChange={(e) => setPhotoY(parseInt(e.target.value))}
                        className="w-full h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#ff007f]"
                      />
                    </div>
                  </div>

                  {format === 'id' && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono text-[#fed215] tracking-wider uppercase font-bold">Photo Frame Window Shape</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['arch', 'shield', 'circle', 'classic'] as const).map(shape => (
                          <button
                            type="button"
                            key={shape}
                            onClick={() => setFrameShape(shape)}
                            className={`py-2 px-3 rounded-lg text-xs font-mono capitalize border cursor-pointer transition-all ${
                              frameShape === shape 
                                ? 'bg-[#ff007f]/10 border-[#ff007f] text-[#ff007f] font-bold' 
                                : 'bg-[#012519]/80 border-emerald-800/60 text-emerald-300 hover:border-emerald-700'
                            }`}
                          >
                            {shape}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {format === 'id' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#fed215] tracking-wider uppercase font-bold">Left vertical text</label>
                        <input 
                          type="text" 
                          value={sideTextLeft}
                          onChange={(e) => setSideTextLeft(e.target.value.toUpperCase())}
                          maxLength={18}
                          className="bg-[#012619]/80 border border-emerald-800/60 rounded-lg px-3 py-2 text-xs text-[#f7f4ea] focus:outline-none focus:border-[#ff007f] font-mono shadow-sm font-semibold"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#fed215] tracking-wider uppercase font-bold">Right vertical text</label>
                        <input 
                          type="text" 
                          value={sideTextRight}
                          onChange={(e) => setSideTextRight(e.target.value.toUpperCase())}
                          maxLength={18}
                          className="bg-[#012619]/80 border border-emerald-800/60 rounded-lg px-3 py-2 text-xs text-[#f7f4ea] focus:outline-none focus:border-[#ff007f] font-mono shadow-sm font-semibold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Theme presets & background textures */}
              {activeTab === 'theme' && (
                <div className="flex flex-col gap-5 animate-[fade-slide-up_0.3s_ease]">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-[#fed215] tracking-wider uppercase font-bold">Badge Theme Preset</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {THEMES.map((t, idx) => (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => setThemeIdx(idx)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between h-20 shadow-sm ${
                            themeIdx === idx 
                              ? 'border-[#fed215] bg-[#fed215]/5 ring-1 ring-[#fed215]' 
                              : 'border-emerald-850 bg-[#012519]/70 hover:border-emerald-700'
                          }`}
                        >
                          <span className="text-xs font-mono font-bold text-white">{t.label}</span>
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="w-4 h-4 rounded-full border border-emerald-800" style={{ backgroundColor: t.cardBg }} title="Main BG" />
                            <div className="w-4 h-4 rounded-full border border-emerald-800" style={{ backgroundColor: t.cardBorder }} title="Border Color" />
                            <div className="w-4 h-4 rounded-full border border-emerald-800" style={{ backgroundColor: t.highlightColor }} title="Accent Pink" />
                            <div className="w-4 h-4 rounded-full border border-emerald-800" style={{ backgroundColor: t.wavyPatternColor }} title="Wave Motif" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-[#fed215] tracking-wider uppercase font-bold">Backing Pattern style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'zebra', label: 'Zebra Waves' },
                        { id: 'paisley', label: 'Mandala vines' },
                        { id: 'grid', label: 'Hacker Grid' }
                      ].map(pat => (
                        <button
                          type="button"
                          key={pat.id}
                          onClick={() => setBgPattern(pat.id)}
                          className={`py-2 px-3 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                            bgPattern === pat.id 
                              ? 'bg-[#ff007f]/10 border-[#ff007f] text-[#ff007f] font-bold' 
                              : 'bg-[#012519]/80 border-emerald-800/60 text-emerald-300 hover:border-emerald-700'
                          }`}
                        >
                          {pat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Stickers toolbar */}
              {activeTab === 'stickers' && (
                <div className="flex flex-col gap-4 animate-[fade-slide-up_0.3s_ease]">
                  <div>
                    <p className="text-[10px] font-mono text-[#fed215] uppercase tracking-wider font-bold">Drag to position, click to select</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
                      {[
                        { type: 'lotus', label: 'Lotus Floral' },
                        { type: 'goa-stamp', label: 'Devanagari' },
                        { type: 'sparkle', label: 'Star sparkle' },
                        { type: 'terminal', label: 'Hacker cmd' },
                        { type: 'sunglasses', label: 'Sun Shades' },
                        { type: 'palm-tree', label: 'Goa Palm' }
                      ].map((st, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => addSticker(st.type as StickerType)}
                          className="btn-spring bg-[#012519]/80 border border-emerald-800/60 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:border-emerald-750 cursor-pointer shadow-sm"
                        >
                          <StickerAsset type={st.type as StickerType} color={selectedStickerColor} size={28} />
                          <span className="text-[8.5px] font-mono text-emerald-300 capitalize font-bold">{st.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#012519]/40 border border-emerald-900/60 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                    <span className="text-[10px] font-mono text-[#fed215] uppercase tracking-wider font-bold">Active Sticker Color</span>
                    <div className="flex items-center gap-3">
                      {STICKER_COLORS.map(c => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => {
                            setSelectedStickerColor(c)
                            if (activeSticker) {
                              setStickers(prev => prev.map(s => (s.id === activeSticker ? { ...s, color: c } : s)))
                            }
                          }}
                          className={`w-7 h-7 rounded-full border cursor-pointer transition-all ${
                            selectedStickerColor === c 
                              ? 'border-white scale-110 ring-2 ring-[#ff007f]' 
                              : 'border-emerald-800 hover:scale-105'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      <span className="text-xs font-mono text-emerald-350 ml-auto">
                        {activeSticker ? "✓ Customizing Selected Sticker" : "Sticker color palette"}
                      </span>
                    </div>
                  </div>

                  {stickers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setStickers([])
                        setActiveSticker(null)
                      }}
                      className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-mono py-2 rounded-xl transition-all cursor-pointer font-bold"
                    >
                      Clear all placed stickers
                    </button>
                  )}
                </div>
              )}

              {/* Action buttons wrapper */}
              <div className="border-t border-emerald-900/60 pt-5 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="btn-spring flex-1 bg-gradient-to-r from-[#e5b83b] to-[#ff007f] hover:brightness-110 text-[#03080f] font-mono font-bold tracking-wider py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-pink-600/10 disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-[#03080f]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      GENERATE IMAGE...
                    </>
                  ) : (
                    <>DOWNLOAD BADGE PNG</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={shareOnX}
                  className="btn-spring bg-[#012519]/80 border border-emerald-800/65 hover:bg-emerald-950/70 text-[#f7f4ea] font-mono py-3.5 px-6 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer font-bold shadow-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  SHARE BADGE ON X
                </button>
              </div>
            </section>

            {/* Right Side: Interactive Showcase Stage */}
            <section className="lg:col-span-5 flex flex-col items-center justify-center gap-6 relative animate-[fade-slide-up_0.4s_ease]">
              
              <div className="w-full flex justify-between items-center glass-panel p-3 rounded-2xl border border-white/5 shadow-sm">
                <span className="text-[10px] font-mono tracking-widest text-[#fed215] font-bold">PREVIEW STAGE</span>
                
                <div className="flex gap-2">
                  {format === 'id' && (
                    <button
                      type="button"
                      onClick={() => setIsWearableMode(prev => !prev)}
                      className={`px-3 py-1 rounded-lg text-[9px] font-mono tracking-wide cursor-pointer transition-all border font-bold ${
                        isWearableMode 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                          : 'bg-[#012519]/80 border-emerald-800/60 text-emerald-300 hover:border-emerald-700'
                      }`}
                    >
                      {isWearableMode ? 'Flat View' : 'Wearable Badge'}
                    </button>
                  )}
                </div>
              </div>

              {/* Canvas Preview Frame */}
              <div 
                className={`w-full flex items-center justify-center p-8 rounded-2xl relative overflow-visible ${
                  isWearableMode 
                    ? 'h-[500px] border border-emerald-900/40' 
                    : 'min-h-[480px] bg-slate-900/30 border border-emerald-900/20'
                }`}
                style={{
                  backgroundImage: isWearableMode 
                    ? 'radial-gradient(circle at center, rgba(12, 59, 39, 0.4) 0%, rgba(2, 26, 17, 0.9) 100%)' 
                    : 'none',
                  transition: 'background-color 0.4s ease'
                }}
              >
                {isWearableMode && (
                  <div className="absolute inset-0 flex flex-col items-center justify-start pointer-events-none opacity-20 z-0 pt-4">
                    <svg width="220" height="200" viewBox="0 0 100 100" fill="none" className="overflow-visible text-slate-800">
                      <path d="M 10,-20 L 90,-20 L 90,10 C 90,10 80,35 50,35 C 20,35 10,10 10,10 Z" fill="#02140d" stroke="#052c1e" strokeWidth="0.5" />
                      <path d="M 30,-20 L 50,15 L 70,-20" stroke="#052c1e" strokeWidth="1" />
                    </svg>
                  </div>
                )}

                {/* Live badge preview builder */}
                {format === 'id' ? (
                  <BadgeCardComponent
                    image={image}
                    name={name}
                    role={role}
                    builderTitle={builderTitle}
                    theme={activeTheme}
                    stickers={stickers}
                    frameShape={frameShape}
                    bgPattern={bgPattern}
                    photoZoom={photoZoom}
                    photoX={photoX}
                    photoY={photoY}
                    sideTextLeft={sideTextLeft}
                    sideTextRight={sideTextRight}
                    barcodeVal={barcodeVal}
                    badgeRef={badgeRef}
                    activeSticker={activeSticker}
                    onMoveSticker={moveSticker}
                    onRemoveSticker={removeSticker}
                    onActivateSticker={setActiveSticker}
                    isWearableMode={isWearableMode}
                  />
                ) : (
                  <PfpPreviewComponent
                    image={image}
                    name={name}
                    role={role}
                    theme={activeTheme}
                    stickers={stickers}
                    bgPattern={bgPattern}
                    photoZoom={photoZoom}
                    photoX={photoX}
                    photoY={photoY}
                    pfpRef={pfpRef}
                    activeSticker={activeSticker}
                    onMoveSticker={moveSticker}
                    onRemoveSticker={removeSticker}
                    onActivateSticker={setActiveSticker}
                  />
                )}
              </div>

              <div className="text-center font-mono text-[10px] text-emerald-400 select-none">
                {format === 'id' 
                  ? "Pro-Tip: Hover over the badge to tilt in 3D & view holographic glares."
                  : "Pro-Tip: Select stickers from edit panel to place them on your PFP."
                }
              </div>
            </section>
          </main>
        </>
      )}

      {/* Footer disclaimer */}
      <footer className="py-6 text-center text-[10px] text-emerald-500 font-mono border-t border-emerald-950 mt-auto z-20">
        Hacker House Goa · 2026 Residency Badge Builder. Built for Gen Z shippers.
      </footer>
    </div>
  )
}
