import {
  useState, useRef, useCallback, useEffect,
  type DragEvent, type PointerEvent as ReactPointerEvent, type ChangeEvent,
} from 'react'
import heic2any from 'heic2any'
import { toPng } from 'html-to-image'
import { toDataURL } from 'qrcode'

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

interface MapPin {
  id: string
  name: string
  role: string
  title: string
  gh: string
  tw: string
  avatar: string
  bio: string
  beach: string
  x: number
  y: number
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

const BEACH_LOCATIONS = [
  { id: 'arambol', label: 'Arambol Beach', x: 30, y: 12 },
  { id: 'morjim', label: 'Morjim Beach', x: 38, y: 24 },
  { id: 'siolim', label: 'Siolim Town', x: 42, y: 20 },
  { id: 'assagao', label: 'Assagao Village', x: 45, y: 26 },
  { id: 'vagator', label: 'Vagator Beach', x: 41, y: 32 },
  { id: 'anjuna', label: 'Anjuna Beach', x: 44, y: 38 },
  { id: 'baga', label: 'Baga Beach', x: 47, y: 41 },
  { id: 'calangute', label: 'Calangute Beach', x: 49, y: 44 },
  { id: 'candolim', label: 'Candolim Beach', x: 50, y: 48 },
  { id: 'porvorim', label: 'Porvorim Hub', x: 55, y: 52 },
  { id: 'panaji', label: 'Panaji Capital', x: 58, y: 58 },
  { id: 'vasco', label: 'Vasco da Gama', x: 50, y: 68 },
  { id: 'margao', label: 'Margao City', x: 65, y: 78 },
  { id: 'palolem', label: 'Palolem Beach', x: 76, y: 86 }
]

const MOCK_PINS: MapPin[] = [
  {
    id: "pin-1",
    name: "Ishaan Verma",
    role: "Web3 / Smart Contracts",
    title: "Layer-2 Beach Bum",
    gh: "ishaanv",
    tw: "ishaan_v",
    avatar: "m1",
    bio: "Building zero-knowledge protocols at Anjuna. Enjoys surfing, deep house music, and spicy prawn curry.",
    beach: "Anjuna Beach",
    x: 44,
    y: 38
  },
  {
    id: "pin-2",
    name: "Neha Patel",
    role: "Product Designer",
    title: "Chief Vibe Officer",
    gh: "nehapatel",
    tw: "neha_vibes",
    avatar: "f1",
    bio: "Crafting beautiful UI and stickers for the residency. Hooked on dynamic parallax web experiments.",
    beach: "Morjim Beach",
    x: 38,
    y: 24
  },
  {
    id: "pin-3",
    name: "Arjun Sharma",
    role: "AI / ML Engineer",
    title: "Zero-Knowledge Zen Master",
    gh: "arjunml",
    tw: "arjun_ai",
    avatar: "m2",
    bio: "Running client-side models on edge browsers. Catch me coding under the palm trees at Arambol.",
    beach: "Arambol Beach",
    x: 30,
    y: 12
  },
  {
    id: "pin-4",
    name: "Meera Sen",
    role: "Frontend / UI Engineer",
    title: "dApp Drifter",
    gh: "meerasen",
    tw: "meera_codes",
    avatar: "f2",
    bio: "Obsessed with creative coding and standard web shaders. Hobbies include sunrise beach runs.",
    beach: "Panaji Capital",
    x: 58,
    y: 58
  },
  {
    id: "pin-5",
    name: "Dev Joshi",
    role: "Backend / Systems",
    title: "Decentralized Chai Wallah",
    gh: "devj",
    tw: "dev_joshi",
    avatar: "m3",
    bio: "Optimizing database speeds for local residency servers. Fueled strictly by cardamom chai.",
    beach: "Candolim Beach",
    x: 50,
    y: 48
  },
  {
    id: "pin-6",
    name: "Tanya Roy",
    role: "Founder / Hacker",
    title: "Solidity Surfer",
    gh: "tanyaroy",
    tw: "tanya_crypto",
    avatar: "f3",
    bio: "Hacking multi-sig wallets at the beach. Looking for contributors in ZK privacy tech.",
    beach: "Palolem Beach",
    x: 76,
    y: 86
  }
]

/* ─── Vector Avatars Components ────────────────────────── */
function AvatarIcon({ type, size = 48, className = "" }: { type: string; size?: number; className?: string }) {
  const getAvatarContent = () => {
    switch(type) {
      case 'm1': // Hoodie guy
        return (
          <g>
            <circle cx="24" cy="24" r="23" fill="#1e293b" stroke="#fed215" strokeWidth="1.2" />
            <path d="M 9,38 C 9,24 12,14 24,14 C 36,14 39,24 39,38 Z" fill="#ff007f" />
            <circle cx="24" cy="24" r="10" fill="#fbcfe8" />
            <path d="M 14,24 C 14,18 18,16 24,16 C 30,16 34,18 34,24" fill="none" stroke="#be123c" strokeWidth="2" />
            <rect x="17" y="21" width="6" height="4" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.5" />
            <rect x="25" y="21" width="6" height="4" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.5" />
            <line x1="23" y1="23" x2="25" y2="23" stroke="#1e293b" strokeWidth="1.5" />
            <path d="M 21,29 Q 24,32 27,29" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 19,34 L 24,39 L 29,34" fill="none" stroke="#ff007f" strokeWidth="2" />
          </g>
        )
      case 'm2': // Cap & shades guy
        return (
          <g>
            <circle cx="24" cy="24" r="23" fill="#0f172a" stroke="#00f2fe" strokeWidth="1.2" />
            <path d="M 12,24 C 12,18 36,18 36,24 Z" fill="#78350f" />
            <circle cx="24" cy="25" r="9.5" fill="#fed7aa" />
            <path d="M 13,20 C 13,12 24,10 35,20 Z" fill="#fed215" />
            <path d="M 15,20 L 5,20 C 5,20 5,16 15,16 Z" fill="#eab308" />
            <path d="M 15,23 Q 24,25 33,23 L 31,27 Q 24,29 17,27 Z" fill="#000000" stroke="#00f2fe" strokeWidth="1" />
            <path d="M 15,28 C 17,34 31,34 33,28 Z" fill="#78350f" opacity="0.8" />
            <path d="M 22,29 Q 24,31 26,29" fill="none" stroke="#ffffff" strokeWidth="1" />
          </g>
        )
      case 'm3': // Headset guy
        return (
          <g>
            <circle cx="24" cy="24" r="23" fill="#022c22" stroke="#ff007f" strokeWidth="1.2" />
            <circle cx="24" cy="11" r="5" fill="#1a0f00" />
            <path d="M 12,24 C 12,14 36,14 36,24 Z" fill="#291a00" />
            <circle cx="24" cy="25" r="9.5" fill="#fde047" />
            <path d="M 16,23 L 22,23 M 26,23 L 32,23" stroke="#000" strokeWidth="2" />
            <path d="M 13,24 C 13,10 35,10 35,24" fill="none" stroke="#ff007f" strokeWidth="3" />
            <rect x="10" y="20" width="4" height="8" rx="2" fill="#ff007f" />
            <rect x="34" y="20" width="4" height="8" rx="2" fill="#ff007f" />
            <path d="M 21,30 Q 24,33 27,30" fill="none" stroke="#000000" strokeWidth="1.5" />
          </g>
        )
      case 'f1': // Beanie girl
        return (
          <g>
            <circle cx="24" cy="24" r="23" fill="#1e1b4b" stroke="#fed215" strokeWidth="1.2" />
            <path d="M 10,26 C 10,40 13,44 13,44 L 35,44 C 35,44 38,40 38,26 Z" fill="#451a03" />
            <circle cx="24" cy="24" r="9.5" fill="#ffedd5" />
            <path d="M 13,21 C 13,12 24,10 35,21 Z" fill="#ff007f" />
            <rect x="12" y="19" width="24" height="4" rx="1.5" fill="#be123c" />
            <circle cx="19" cy="24" r="3.5" fill="#000" stroke="#fed215" strokeWidth="1" />
            <circle cx="29" cy="24" r="3.5" fill="#000" stroke="#fed215" strokeWidth="1" />
            <line x1="22.5" y1="24" x2="25.5" y2="24" stroke="#fed215" strokeWidth="1" />
            <path d="M 22,29 Q 24,31 26,29" fill="none" stroke="#000" strokeWidth="1.5" />
          </g>
        )
      case 'f2': // Ponytail glasses girl
        return (
          <g>
            <circle cx="24" cy="24" r="23" fill="#2d063d" stroke="#00f2fe" strokeWidth="1.2" />
            <path d="M 33,26 C 41,20 44,32 41,38 C 38,44 32,38 33,26 Z" fill="#172554" />
            <path d="M 12,24 C 12,14 36,14 36,24 Z" fill="#1d4ed8" />
            <circle cx="24" cy="25" r="9.5" fill="#ffedd5" />
            <path d="M 13,20 C 18,17 22,21 24,20 C 26,21 30,17 35,20" fill="none" stroke="#1d4ed8" strokeWidth="3" />
            <rect x="16" y="22" width="6" height="4" rx="1" fill="none" stroke="#dc2626" strokeWidth="1.5" />
            <rect x="26" y="22" width="6" height="4" rx="1" fill="none" stroke="#dc2626" strokeWidth="1.5" />
            <line x1="22" y1="24" x2="26" y2="24" stroke="#dc2626" strokeWidth="1.5" />
            <path d="M 21,30 Q 24,32 27,30" fill="none" stroke="#000" strokeWidth="1.5" />
          </g>
        )
      default: // 'f3' (Space buns girl)
        return (
          <g>
            <circle cx="24" cy="24" r="23" fill="#311005" stroke="#ff007f" strokeWidth="1.2" />
            <circle cx="13" cy="13" r="5" fill="#f43f5e" />
            <circle cx="35" cy="13" r="5" fill="#f43f5e" />
            <path d="M 12,24 C 12,14 36,14 36,24 Z" fill="#fda4af" />
            <circle cx="24" cy="25" r="9.5" fill="#fee2e2" />
            <circle cx="17" cy="27" r="1.5" fill="#f43f5e" opacity="0.6" />
            <circle cx="31" cy="27" r="1.5" fill="#f43f5e" opacity="0.6" />
            <path d="M 21,29 Q 24,31 27,29" fill="none" stroke="#4c0519" strokeWidth="1.5" />
            <path d="M 12,20 C 12,10 36,10 36,20" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          </g>
        )
    }
  }

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={`select-none ${className}`} xmlns="http://www.w3.org/2000/svg">
      {getAvatarContent()}
    </svg>
  )
}

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
        <path d="M5 6h32a2 2 0 012 2v3a1 1 0 01-1 1h-6a4 4 0 01-8 0h-4a4 4 0 01-8 0H5a1 1 0 01-1-1V8a2 2 0 01-2-2z" />
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
      <svg width="150" height="20" viewBox="0 0 180 26" className="overflow-visible">
        <g fill={color}>
          {lines.map((w, idx) => {
            const x = idx * 6
            return <rect key={idx} x={x} y="0" width={w} height="26" opacity={idx % 2 === 0 ? 0.95 : 0.0} />
          })}
        </g>
      </svg>
      <span className="text-[6.5px] font-mono tracking-[0.25em]" style={{ color }}>
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
  photoZoom, photoX, photoY, sideTextLeft, sideTextRight, barcodeVal, qrCodeUrl,
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
  qrCodeUrl: string
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
    const currentRef = badgeRef?.current || containerRef.current
    if (!currentRef || isWearableMode) return
    const rect = currentRef.getBoundingClientRect()
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
      className="card-perspective relative select-none animate-[fade-slide-up_0.4s_ease]"
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
          <div className="relative z-10 flex flex-col items-center gap-0.5 text-center mb-1 w-full">
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
              className="inline-block px-3 py-0.5 rounded-full text-[8px] font-bold tracking-[0.12em] uppercase font-mono"
              style={{ 
                backgroundColor: `${theme.highlightColor}15`, 
                border: `1px solid ${theme.highlightColor}`,
                color: theme.highlightColor 
              }}
            >
              {role || 'ANON STACK'}
            </span>

            <p 
              className="text-[9px] italic opacity-85 font-mono text-center px-2"
              style={{ color: theme.accentColor }}
            >
              &ldquo;{builderTitle}&rdquo;
            </p>

            <div className="w-full h-px my-1 opacity-25" style={{ background: `linear-gradient(90deg, transparent, ${theme.textColor}, transparent)` }} />
            
            {/* Scannable connection footer (QR Code + Barcode) */}
            <div className="flex items-center justify-between gap-3 w-full px-1">
              <div className="flex-1 flex flex-col items-center">
                <SVGBarcode value={barcodeVal} color={theme.textColor} />
              </div>
              
              {qrCodeUrl && (
                <div 
                  className="w-10 h-10 p-0.5 rounded bg-white flex-shrink-0 shadow-md border border-[#fed215]/20 hover:scale-105 transition-transform"
                  title="Scan to view profile hub & map location"
                >
                  <img src={qrCodeUrl} alt="Scan QR" className="w-full h-full" />
                </div>
              )}
            </div>
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
   GOA HACKER INTERACTIVE SVG COASTLINE MAP COMPONENT
   ═══════════════════════════════════════════════════════════ */
function GoaResidencyMap({
  pins,
  selectedPinId,
  onSelectPin,
  highlightedBeach,
  userPinLocation,
  userPinCoords,
  userAvatar,
  onMapClick
}: {
  pins: MapPin[]
  selectedPinId: string | null
  onSelectPin: (pin: MapPin | null) => void
  highlightedBeach?: string
  userPinLocation?: string
  userPinCoords?: { x: number; y: number }
  userAvatar?: string
  onMapClick?: (x: number, y: number) => void
}) {
  const [filterRole, setFilterRole] = useState('All')
  const selectedPin = pins.find(p => p.id === selectedPinId)

  // Filter pins based on selected developer track role
  const filteredPins = pins.filter(p => {
    if (filterRole === 'All') return true
    return p.role === filterRole
  })

  return (
    <section className="glass-panel rounded-3xl p-5 sm:p-7 shadow-xl w-full border border-[#fed215]/20 flex flex-col gap-5 mt-8 relative z-10 overflow-hidden">
      
      {/* Map Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-[10px] font-mono text-[#fed215] tracking-[0.2em] uppercase font-bold">Residency Radar</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">Hacker Map of Goa</h2>
          <p className="text-xs text-emerald-250/60 mt-0.5">Explore who is hacking from Morjim, Anjuna, Panaji, and other Goa beaches.</p>
        </div>

        {/* Developer track filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase whitespace-nowrap">Filter Stack:</span>
          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value)
              onSelectPin(null)
            }}
            className="bg-[#012619]/90 border border-emerald-800/80 rounded-lg px-2.5 py-1 text-xs text-[#f7f4ea] focus:outline-none focus:border-[#ff007f] font-mono cursor-pointer"
          >
            <option value="All">All Tracks</option>
            {STACK_ROLES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[380px]">
        {/* Left Side: Dynamic Interactive Coastline SVG Canvas Map */}
        <div 
          onClick={(e) => {
            if (!onMapClick) return
            const target = e.target as HTMLElement
            const currentTarget = e.currentTarget as HTMLElement
            if (target === currentTarget || target.tagName === 'svg' || target.tagName === 'path' || target.tagName === 'rect' || target.tagName === 'text' || target.tagName === 'circle') {
              const rect = currentTarget.getBoundingClientRect()
              const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
              const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
              onMapClick(x, y)
            }
          }}
          className="lg:col-span-8 relative bg-emerald-950/40 rounded-2xl border border-emerald-900/60 overflow-hidden h-[380px] select-none flex items-center justify-center cursor-crosshair"
        >
          {/* Visual click target help */}
          <div className="absolute top-2 left-2 pointer-events-none text-[8.5px] font-mono text-pink-400 bg-pink-950/80 px-2 py-0.5 rounded border border-pink-900/60 z-30">
            📍 Click anywhere to set your map pin position!
          </div>

          {/* Sea / Coastline Vector Layout */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="seaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#083e29" />
                <stop offset="70%" stopColor="#03261a" />
                <stop offset="100%" stopColor="#011b11" />
              </linearGradient>
            </defs>

            {/* Ocean Fill */}
            <rect x="0" y="0" width="100%" height="100%" fill="url(#seaGrad)" />
            
            {/* Grid lines */}
            <g stroke="#ffffff" strokeWidth="0.5" opacity="0.04" strokeDasharray="3 6">
              {Array.from({ length: 15 }).map((_, i) => (
                <line key={`x-${i}`} x1={`${i * 7}%`} y1="0" x2={`${i * 7}%`} y2="100%" />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <line key={`y-${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} />
              ))}
            </g>

            {/* Landmass Coastline Path curves from North-West to South-East */}
            <path 
              d="M 120,-20 Q 150,80 200,120 T 260,200 T 360,280 T 480,420 L 1000,420 L 1000,-20 Z" 
              className="fill-[#021d13] stroke-[#fed215]/25" 
              strokeWidth="2.5" 
            />

            {/* Coastline foam outline details */}
            <path 
              d="M 120,-20 Q 150,80 200,120 T 260,200 T 360,280 T 480,420" 
              fill="none" 
              stroke="#00f2fe" 
              strokeWidth="1.5" 
              opacity="0.15" 
            />

            {/* Beach Text labels */}
            {BEACH_LOCATIONS.map(beach => {
              const isTargetHighlight = highlightedBeach === beach.label || userPinLocation === beach.label
              return (
                <g key={beach.id}>
                  {/* Glowing text node */}
                  <text 
                    x={`${beach.x + 8}%`} 
                    y={`${beach.y}%`} 
                    fill={isTargetHighlight ? '#ff007f' : '#fed215'}
                    fontSize="9.5" 
                    fontFamily="monospace" 
                    fontWeight="700"
                    letterSpacing="1.2"
                    opacity={isTargetHighlight ? 1.0 : 0.6}
                    textAnchor="start"
                    className="transition-all duration-300 font-bold"
                  >
                    {beach.label.toUpperCase()} {isTargetHighlight && '📍'}
                  </text>
                  <circle 
                    cx={`${beach.x}%`} 
                    cy={`${beach.y}%`} 
                    r="2.5" 
                    fill={isTargetHighlight ? '#ff007f' : '#fed215'} 
                    opacity="0.5" 
                  />
                </g>
              )
            })}
          </svg>

          {/* Render Active Avatar Markers (Pins) on top */}
          <div className="absolute inset-0">
            {filteredPins.map(pin => {
              const isSelected = selectedPinId === pin.id
              const isUserPin = pin.id === 'user-pin'
              return (
                <div
                  key={pin.id}
                  onClick={() => onSelectPin(pin)}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 select-none z-20 group"
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                >
                  {/* Glowing Radar Rings if selected */}
                  {isSelected && (
                    <div className="absolute -inset-4 rounded-full border-2 border-pink-500 animate-ping opacity-60 pointer-events-none" />
                  )}

                  {/* Avatar wrapper pin container */}
                  <div 
                    className={`p-0.5 rounded-full border-2 transition-all shadow-md group-hover:scale-110 ${
                      isSelected 
                        ? 'border-pink-500 bg-pink-500/20 scale-110 shadow-pink-600/30' 
                        : isUserPin
                          ? 'border-[#fed215] bg-[#fed215]/20 animate-[bounce_2s_infinite]'
                          : 'border-emerald-500 bg-emerald-950/90 shadow-black/50'
                    }`}
                  >
                    <AvatarIcon type={pin.avatar} size={isSelected ? 44 : 36} className="pointer-events-none" />
                  </div>

                  {/* Tiny Name Popup Tooltip */}
                  <div className="absolute top-[110%] left-1/2 -translate-x-1/2 pointer-events-none bg-emerald-950/95 border border-emerald-800 px-2 py-0.5 rounded text-[8px] font-mono text-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow z-30">
                    {pin.name}
                  </div>
                </div>
              )
            })}

            {/* Pulsing Pin Preview showing active pointer coords */}
            {userPinCoords && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-35 animate-[pulse_1.5s_infinite] pointer-events-none"
                style={{ left: `${userPinCoords.x}%`, top: `${userPinCoords.y}%` }}
              >
                <div className="absolute -inset-3 rounded-full border border-pink-400 animate-ping opacity-75" />
                <div className="p-0.5 rounded-full border-2 border-[#ff007f] bg-emerald-950 shadow-lg shadow-pink-500/50">
                  <AvatarIcon type={userAvatar || 'm1'} size={38} />
                </div>
                <div className="absolute top-[110%] left-1/2 -translate-x-1/2 bg-pink-900 border border-pink-500 px-1.5 py-0.5 rounded text-[7.5px] font-mono text-white whitespace-nowrap shadow-md uppercase font-bold">
                  Pin Preview 📍
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-2 left-2 flex gap-4 text-[8px] font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-900/60 pointer-events-none">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Hackers</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Scanned</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#fed215]" /> You</span>
          </div>
        </div>

        {/* Right Side: Pin Profile Details card drawer */}
        <div className="lg:col-span-4 flex flex-col justify-between p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/60 z-10 shadow-inner">
          {selectedPin ? (
            <div className="flex flex-col gap-4 animate-[fade-slide-up_0.3s_ease] h-full justify-between">
              
              {/* Avatar + Basic details */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="p-1 rounded-full border-2 border-[#fed215] bg-emerald-900/40">
                    <AvatarIcon type={selectedPin.avatar} size={50} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight uppercase font-mono">{selectedPin.name}</h3>
                    <p className="text-[10px] text-pink-400 font-mono tracking-wide mt-0.5">{selectedPin.beach.toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[9px] font-mono text-[#fed215] uppercase tracking-wider font-bold">Residency Role:</span>
                  <span className="text-xs text-white font-semibold font-mono bg-emerald-900/30 px-2 py-1 rounded border border-emerald-900/40 w-fit">
                    {selectedPin.role}
                  </span>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[9px] font-mono text-[#fed215] uppercase tracking-wider font-bold">Builder Title:</span>
                  <span className="text-xs text-[#f7f4ea] italic font-mono">
                    &ldquo;{selectedPin.title}&rdquo;
                  </span>
                </div>

                {/* Scopes Hacker Bio */}
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[9px] font-mono text-[#fed215] uppercase tracking-wider font-bold">Hacker Bio & Hobbies:</span>
                  <div className="text-xs text-emerald-100/80 leading-relaxed bg-emerald-950/60 border border-emerald-900/40 p-2.5 rounded-lg italic">
                    {selectedPin.bio || 'This builder is currently heads-down shipping code... Chai lover.'}
                  </div>
                </div>
              </div>

              {/* Social buttons connect */}
              <div className="flex flex-col gap-2 pt-4 border-t border-emerald-900/60 mt-auto">
                <div className="flex gap-2">
                  {selectedPin.gh && (
                    <a
                      href={`https://github.com/${selectedPin.gh}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-spring flex-1 py-1.5 rounded-lg bg-[#012519]/80 border border-emerald-800 text-[10px] font-mono font-bold text-emerald-300 hover:text-white flex items-center justify-center gap-1.5 shadow"
                    >
                      GitHub
                    </a>
                  )}
                  {selectedPin.tw && (
                    <a
                      href={`https://twitter.com/${selectedPin.tw}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-spring flex-1 py-1.5 rounded-lg bg-[#012519]/80 border border-emerald-800 text-[10px] font-mono font-bold text-emerald-300 hover:text-white flex items-center justify-center gap-1.5 shadow"
                    >
                      Twitter
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onSelectPin(null)}
                  className="w-full text-center text-[9px] font-mono text-emerald-500 hover:text-emerald-350 cursor-pointer py-1"
                >
                  Close Profile Details
                </button>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-2.5 py-12 my-auto" style={{ color: 'rgba(247,244,234,0.45)' }}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-xs font-mono font-bold uppercase text-[#fed215]">Hacker Pins Details</p>
                <p className="text-[10px] max-w-[200px] mt-1 leading-relaxed">
                  Click on any hacker avatar pin on the Goa map to view their name, stacks, hobbies, and social handles!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP DASHBOARD CONTAINER
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const [view, setView] = useState<'welcome' | 'builder' | 'scan-hub'>('welcome')
  const [format, setFormat] = useState<Format>('id')
  
  // Custom states matching Format B requirements
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [builderTitle, setBuilderTitle] = useState(BUILDER_TITLES[0])
  const [github, setGithub] = useState('')
  const [twitter, setTwitter] = useState('')
  
  // Bio, custom location name, and avatar selections for Goa map & scan view
  const [bio, setBio] = useState('')
  const [avatarType, setAvatarType] = useState('m1')
  const [locationName, setLocationName] = useState('Anjuna Beach')
  const [userPinCoords, setUserPinCoords] = useState({ x: 44, y: 38 })
  const [showInstructions, setShowInstructions] = useState(true)

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

  // Dynamic QR Code link URL
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  // Map Pins state (mock pins + current user pin)
  const [mapPins, setMapPins] = useState<MapPin[]>([])
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null)
  const [highlightedBeach, setHighlightedBeach] = useState<string>('')

  // Profile scan hub state
  const [scannedProfile, setScannedProfile] = useState<{
    name: string
    role: string
    title: string
    gh: string
    tw: string
    avatar: string
    bio: string
  } | null>(null)

  // 1. Detect scan query parameter on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('scan') === 'true') {
      const scannedName = params.get('name') || 'Anon Builder'
      const scannedRole = params.get('role') || 'Developer'
      const scannedTitle = params.get('title') || 'Chai Hacker'
      const scannedGh = params.get('gh') || ''
      const scannedTw = params.get('tw') || ''
      const scannedAvatar = params.get('avatar') || 'm1'
      const scannedBio = params.get('bio') || ''

      setScannedProfile({
        name: scannedName,
        role: scannedRole,
        title: scannedTitle,
        gh: scannedGh,
        tw: scannedTw,
        avatar: scannedAvatar,
        bio: scannedBio
      })
      setView('scan-hub')
    }
  }, [])

  // 2. Generate QR Code image url whenever details change
  useEffect(() => {
    const baseUrl = window.location.origin + window.location.pathname
    const params = new URLSearchParams()
    params.set('scan', 'true')
    params.set('name', name || 'Anon Builder')
    params.set('role', role || 'Developer')
    params.set('title', builderTitle || 'Chai Hacker')
    params.set('gh', github || '')
    params.set('tw', twitter || '')
    params.set('avatar', avatarType)
    params.set('bio', bio || '')

    const scanUrl = `${baseUrl}?${params.toString()}`

    toDataURL(scanUrl, {
      margin: 1,
      width: 120,
      color: {
        dark: '#021a11', // High contrast dark green/black
        light: '#ffffff' // White background
      }
    }).then(url => {
      setQrCodeUrl(url)
    }).catch(err => {
      console.error("QR generation error:", err)
    })
  }, [name, role, builderTitle, github, twitter, avatarType, bio, activeTheme])

  // 3. Update User pin inside Remote database and local mapPins
  const saveUserPinToMap = (updatedName?: string, updatedRole?: string) => {
    let userId = localStorage.getItem('hhg-user-id')
    if (!userId) {
      userId = 'user-' + Math.random().toString(36).slice(2)
      localStorage.setItem('hhg-user-id', userId)
    }

    const userPin: MapPin = {
      id: userId,
      name: updatedName || name || 'Anon Builder',
      role: updatedRole || role || 'Hacking track',
      title: builderTitle || 'Resident',
      gh: github || '',
      tw: twitter || '',
      avatar: avatarType,
      bio: bio || 'Currently shipping code beachside at Hacker House Goa.',
      beach: locationName || 'Goa',
      x: userPinCoords.x,
      y: userPinCoords.y
    }

    // Sync with remote database on kvdb.io to keep friends' pins in sync!
    fetch('https://kvdb.io/hhg_ritika_badge_pins/pins')
      .then(res => {
        if (!res.ok) return []
        return res.json()
      })
      .then(data => {
        const currentPins = Array.isArray(data) ? data : []
        const filtered = currentPins.filter((p: MapPin) => p.id !== userId)
        const newPinsList = [...filtered, userPin]

        return fetch('https://kvdb.io/hhg_ritika_badge_pins/pins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPinsList)
        }).then(() => newPinsList)
      })
      .then(newPinsList => {
        setMapPins(newPinsList)
        setSelectedPinId(userId)
        localStorage.setItem('hhg-user-pin', JSON.stringify(userPin))
      })
      .catch(err => {
        console.error("Failed to sync pins:", err)
        // Fallback to local
        setMapPins(prev => [...prev.filter(p => p.id !== userId), userPin])
      })
  }

  // Load remote pins list on mount, and try to restore user pin location
  useEffect(() => {
    fetch('https://kvdb.io/hhg_ritika_badge_pins/pins')
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) {
          setMapPins(data)
          
          // Set coordinates based on user's saved pin if available
          const userId = localStorage.getItem('hhg-user-id')
          if (userId) {
            const userSavedPin = data.find((p: MapPin) => p.id === userId)
            if (userSavedPin) {
              setLocationName(userSavedPin.beach)
              setUserPinCoords({ x: userSavedPin.x, y: userSavedPin.y })
            }
          }
        }
      })
      .catch(err => {
        console.log("Starting with empty map:", err)
        setMapPins([])
      })
  }, [])

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
    setAvatarType(['m1', 'm2', 'm3', 'f1', 'f2', 'f3'][Math.floor(Math.random() * 6)])
    setBeachLocation(['arambol', 'morjim', 'anjuna', 'candolim', 'panaji', 'palolem'][Math.floor(Math.random() * 6)])
    
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

  const handleDownload = async () => {
    const targetRef = format === 'id' ? badgeRef : pfpRef
    if (!targetRef.current) return
    
    setDownloading(true)
    saveUserPinToMap() // Proactively save the pin to the map when they download!
    
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

  const shareOnX = async () => {
    const targetRef = format === 'id' ? badgeRef : pfpRef
    if (!targetRef.current) return
    
    let copiedToClipboard = false
    saveUserPinToMap() // Proactively save to the map when they share!
    
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
          
          {/* Subtle floating background patterns */}
          <div className="absolute top-[40%] right-[10vw]"><PalmLeafSVG color="#fed215" size={120} /></div>
          <div className="absolute top-[60%] left-[8vw]"><FloatingLotus color="#ff007f" size={90} /></div>
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
          <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 shadow-xl animate-[fade-slide-up_0.6s_ease] border border-[#fed215]/20">
            <h3 className="text-[11px] font-mono text-[#fed215] uppercase tracking-[0.2em] font-bold border-b border-emerald-900 pb-3 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
              Residency Task: Build Instructions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 */}
              <div className="flex gap-4 items-start p-4 rounded-xl border border-emerald-900/50 bg-[#012519]/30 hover:bg-[#012519]/50 transition-all hover:border-[#fed215]/30 group shadow-md hover:translate-y-[-2px] duration-300">
                <span className="w-9 h-9 rounded-xl bg-[#fed215]/10 border border-[#fed215]/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-4 h-4 text-[#fed215]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#f7f4ea] font-mono tracking-wide flex items-center gap-1.5">
                    <span>Upload Profile Photo</span>
                    <span className="text-[8px] font-mono text-[#fed215]/75 bg-[#fed215]/5 px-1.5 py-0.5 rounded border border-[#fed215]/20 font-bold">01</span>
                  </h4>
                  <p className="text-xs text-emerald-100/70 mt-1 leading-relaxed">
                    Select your photo. Supports PNG, JPG, and iPhone **HEIC** formats. Zoom and pan to fit perfectly.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start p-4 rounded-xl border border-emerald-900/50 bg-[#012519]/30 hover:bg-[#012519]/50 transition-all hover:border-[#ff007f]/30 group shadow-md hover:translate-y-[-2px] duration-300">
                <span className="w-9 h-9 rounded-xl bg-[#ff007f]/10 border border-[#ff007f]/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-4 h-4 text-[#ff007f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#f7f4ea] font-mono tracking-wide flex items-center gap-1.5">
                    <span>Input Identity Details</span>
                    <span className="text-[8px] font-mono text-[#ff007f]/75 bg-[#ff007f]/5 px-1.5 py-0.5 rounded border border-[#ff007f]/20 font-bold">02</span>
                  </h4>
                  <p className="text-xs text-emerald-100/70 mt-1 leading-relaxed">
                    Enter your name and developer track. Write a customized builder bio, select a cartoon avatar, and pick your Goa location.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start p-4 rounded-xl border border-emerald-900/50 bg-[#012519]/30 hover:bg-[#012519]/50 transition-all hover:border-[#00f2fe]/30 group shadow-md hover:translate-y-[-2px] duration-300">
                <span className="w-9 h-9 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-4 h-4 text-[#00f2fe]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#f7f4ea] font-mono tracking-wide flex items-center gap-1.5">
                    <span>Generate Dynamic QR Codes</span>
                    <span className="text-[8px] font-mono text-[#00f2fe]/75 bg-[#00f2fe]/5 px-1.5 py-0.5 rounded border border-[#00f2fe]/20 font-bold">03</span>
                  </h4>
                  <p className="text-xs text-emerald-100/70 mt-1 leading-relaxed">
                    The generated QR code stores your social handles, bio, and Goa beach coordinates. When scanned, it loads your custom profile hub!
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 items-start p-4 rounded-xl border border-emerald-900/50 bg-[#012519]/30 hover:bg-[#012519]/50 transition-all hover:border-purple-500/30 group shadow-md hover:translate-y-[-2px] duration-300">
                <span className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#f7f4ea] font-mono tracking-wide flex items-center gap-1.5">
                    <span>Join the Goa Hacker Map</span>
                    <span className="text-[8px] font-mono text-purple-400/75 bg-purple-500/5 px-1.5 py-0.5 rounded border border-purple-500/20 font-bold">04</span>
                  </h4>
                  <p className="text-xs text-emerald-100/70 mt-1 leading-relaxed">
                    Saving your badge automatically drops your custom avatar pin onto the interactive coastline map of Goa for other builders to discover!
                  </p>
                </div>
              </div>
            </div>
            
            {/* CTA Trigger */}
            <div className="mt-8 pt-5 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[9px] font-mono bg-pink-950/40 border border-[#ff007f]/30 px-3.5 py-1.5 text-[#ff007f] rounded-full font-bold uppercase tracking-wider shadow-inner">
                ⚠️ Deadline: 11:59 pm, 13th August 2026
              </span>
              <button
                type="button"
                onClick={() => setView('builder')}
                className="btn-spring relative bg-gradient-to-r from-[#fed215] via-[#ff007f] to-[#fed215] text-[#021a11] font-mono font-bold tracking-[0.2em] py-3.5 px-8 rounded-full text-xs cursor-pointer shadow-[0_0_20px_rgba(255,0,127,0.3)] hover:shadow-[0_0_25px_rgba(255,0,127,0.55)] uppercase transition-all duration-300 hover:brightness-110 active:scale-95"
              >
                Launch Badge Studio 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── VIEW 2: ACTIVE DESIGN STUDIO & GOA HACKER MAP ─── */}
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
                onClick={() => {
                  const mapElement = document.getElementById('residency-hacker-map')
                  mapElement?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-mono border border-pink-600 bg-pink-700/10 hover:bg-pink-700/20 text-pink-300 cursor-pointer shadow-sm font-bold"
              >
                📍 View Map
              </button>
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
          <main className="flex-1 max-w-[1240px] w-full mx-auto p-4 sm:p-6 flex flex-col gap-6 relative z-10">
            
            {/* Workspace split columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Customize Inputs Box */}
              <section className="lg:col-span-7 glass-panel rounded-2xl p-5 sm:p-6 flex flex-col gap-6 shadow-xl z-10">
                <div>
                  <span className="text-[10px] font-mono text-[#fed215] tracking-[0.2em] uppercase font-bold">Badge customizer</span>
                  <div className="flex items-center justify-between mt-1 flex-wrap gap-2">
                    <h2 className="text-2xl font-bold tracking-wide text-white">Design Studio</h2>
                    <button 
                      type="button"
                      onClick={() => setShowInstructions(!showInstructions)}
                      className="text-[9px] font-mono text-pink-400 border border-pink-500/30 hover:border-pink-500 bg-[#ff007f]/5 px-2.5 py-1 rounded-md transition-all cursor-pointer font-bold uppercase tracking-wider select-none"
                    >
                      {showInstructions ? 'Hide Help ✕' : 'How it works? 💡'}
                    </button>
                  </div>
                  
                  {showInstructions && (
                    <div className="mt-3.5 border border-[#fed215]/20 bg-[#021d13]/85 rounded-xl p-3.5 sm:p-4 text-emerald-250 animate-[fade-slide-down_0.3s_ease]">
                      <h3 className="text-xs font-bold font-mono text-[#fed215] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        ⚡ residency badge checklist:
                      </h3>
                      <ol className="text-[11px] font-mono flex flex-col gap-2 list-none p-0 m-0">
                        <li className="flex gap-2">
                          <span className="text-[#ff007f] font-bold">01.</span>
                          <span><strong>Customize Badge:</strong> Set your name, role, custom bio/hobbies, and upload a portrait photo. Pick an avatar representing yourself.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#ff007f] font-bold">02.</span>
                          <span><strong>Drop Location Pin:</strong> Type your hacking town/villa under <em>Hacking Location</em>, or <strong>click directly on the Goa map</strong> below to set your pin coordinates. Click <strong>Drop Pin</strong> to upload it to the live server.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#ff007f] font-bold">03.</span>
                          <span><strong>Verified QR Scanner:</strong> The badge embeds a dynamic QR Code. When someone scans your badge, it loads your verified hacker bio, socials, and beach pin.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#ff007f] font-bold">04.</span>
                          <span><strong>Download & Share:</strong> Click <strong>Download PNG & Pin Map</strong> to download a flat high-res card and automatically pin yourself on the shared map!</span>
                        </li>
                      </ol>
                    </div>
                  )}

                  {!showInstructions && (
                    <p className="text-xs text-emerald-200/60 mt-1.5 leading-relaxed">
                      Design a wearable badge for Hacker House Goa 2026. Custom QR codes map your profile details & drop your custom avatar onto the interactive Goa Map!
                    </p>
                  )}
                </div>

                {/* Navigation Sub-Tabs inside editor */}
                <div className="flex border-b border-emerald-900 pb-2.5 gap-2.5 overflow-x-auto scrollbar-thin">
                  {(['profile', 'frame', 'theme', 'stickers'] as const).map(tab => (
                    <button
                      type="button"
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-[10px] font-mono tracking-[0.15em] uppercase py-1.5 px-3 rounded-lg border cursor-pointer transition-all whitespace-nowrap ${
                        activeTab === tab 
                          ? 'border-[#ff007f] bg-[#ff007f]/10 text-white font-bold shadow-sm shadow-[#ff007f]/10' 
                          : 'border-transparent text-emerald-500 hover:text-emerald-300 hover:bg-emerald-950/20'
                      }`}
                    >
                      {tab === 'profile' ? '👤 Identity' : tab === 'frame' ? '📐 Position' : tab === 'theme' ? '🎨 Vibe / Theme' : '✨ Stickers'}
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
                      className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
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
                          <svg className="w-7 h-7 text-emerald-650" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs font-mono font-bold text-emerald-350">Drag & Drop profile photo here</p>
                          <p className="text-[8.5px] text-emerald-500/80 uppercase tracking-wider font-mono">Supports PNG, JPG, WEBP, HEIC</p>
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

                    {/* Bio / Hobbies */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-baseline">
                        <label className="text-[10px] font-mono text-[#fed215] tracking-wider uppercase font-bold">Hacker Bio & Hobbies (Stored in QR code)</label>
                        <span className="text-[8px] font-mono text-emerald-500">{120 - bio.length} chars left</span>
                      </div>
                      <textarea
                        placeholder="Write something fun, hobbies, or what interests you! (e.g. Loves sunset runs & DeFi)"
                        value={bio}
                        onChange={(e) => setBio(e.target.value.substring(0, 120))}
                        rows={2}
                        className="bg-[#012619]/80 border border-emerald-800/60 rounded-lg px-3 py-2 text-xs text-[#f7f4ea] focus:outline-none focus:border-[#ff007f] shadow-sm font-sans"
                      />
                    </div>

                    {/* Map Placement Selections */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-emerald-900/40 pt-4">
                      {/* Avatar Picker */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-mono text-[#fed215] tracking-wider uppercase font-bold">Map Avatar Element</label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {['m1', 'm2', 'm3', 'f1', 'f2', 'f3'].map(av => (
                            <button
                              type="button"
                              key={av}
                              onClick={() => {
                                setAvatarType(av)
                                setSelectedPinId(null)
                              }}
                              className={`p-1 rounded-full border-2 transition-all hover:scale-105 cursor-pointer ${
                                avatarType === av 
                                  ? 'border-[#ff007f] bg-[#ff007f]/10 shadow-md shadow-pink-600/10' 
                                  : 'border-emerald-850 bg-emerald-950/40'
                              }`}
                            >
                              <AvatarIcon type={av} size={30} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Location Placement */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#fed215] tracking-wider uppercase font-bold">Hacking Location (Goa)</label>
                        <input
                          type="text"
                          list="goa-places"
                          placeholder="e.g. Vagator Beach, Assagao Villa"
                          value={locationName}
                          onChange={(e) => {
                            const val = e.target.value
                            setLocationName(val)
                            // If they select an option that matches one of our predefined locations, jump their coordinates there!
                            const matched = BEACH_LOCATIONS.find(b => b.label.toLowerCase() === val.toLowerCase() || b.id === val.toLowerCase())
                            if (matched) {
                              setUserPinCoords({ x: matched.x, y: matched.y })
                              setHighlightedBeach(matched.label)
                            }
                          }}
                          className="bg-[#012619]/80 border border-emerald-800/60 rounded-lg px-3 py-2 text-xs text-[#f7f4ea] focus:outline-none focus:border-[#ff007f] shadow-sm font-mono font-bold"
                        />
                        <datalist id="goa-places">
                          {BEACH_LOCATIONS.map(beach => (
                            <option key={beach.id} value={beach.label} />
                          ))}
                        </datalist>
                        
                        <div className="text-[9px] font-mono text-emerald-350/80 leading-normal mt-0.5">
                          📍 Coordinates: {userPinCoords.x}%, {userPinCoords.y}% (Click map below to position pin)
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            saveUserPinToMap()
                            alert(`Pin dropped on map at ${locationName}! Scroll down to see your location in Goa.`)
                          }}
                          className="btn-spring mt-1.5 py-1 px-3 bg-[#ff007f]/10 border border-[#ff007f] text-[#ff007f] hover:bg-[#ff007f]/20 rounded-lg text-[9px] font-mono font-bold tracking-wider cursor-pointer shadow"
                        >
                          📌 Drop Pin on Map
                        </button>
                      </div>
                    </div>

                    {/* GitHub and Twitter handles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-emerald-900/40 pt-4">
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
                      <>DOWNLOAD BADGE PNG & PIN MAP</>
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
                    SHARE ON X
                  </button>
                </div>
              </section>

              {/* Right Side: Interactive Showcase Stage */}
              <section className="lg:col-span-5 flex flex-col items-center justify-center gap-6 relative">
                
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
                      qrCodeUrl={qrCodeUrl}
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
            </div>

            {/* Goa Hacker Map interactive display section */}
            <div id="residency-hacker-map" className="scroll-mt-8">
              <GoaResidencyMap 
                pins={mapPins} 
                selectedPinId={selectedPinId} 
                onSelectPin={(pin) => {
                  setSelectedPinId(pin ? pin.id : null)
                  setHighlightedBeach(pin ? pin.beach : '')
                }}
                highlightedBeach={highlightedBeach}
                userPinLocation={locationName}
                userPinCoords={userPinCoords}
                userAvatar={avatarType}
                onMapClick={(x, y) => setUserPinCoords({ x, y })}
              />
            </div>
          </main>
        </>
      )}

      {/* ─── VIEW 3: SCAN PROFILE HUB (LOADED ON QR SCAN) ─── */}
      {view === 'scan-hub' && scannedProfile && (
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 relative z-10 max-w-[960px] mx-auto w-full gap-8">
          {/* Scan Logo header */}
          <div className="flex flex-col items-center text-center animate-[fade-slide-up_0.3s_ease]">
            <div className="w-12 h-12 rounded-2xl bg-pink-650 shadow-[0_0_20px_rgba(219,11,90,0.5)] flex items-center justify-center font-mono font-bold text-xl text-white select-none">
              HH
            </div>
            <h1 className="text-xl font-bold tracking-[0.15em] text-[#fed215] mt-3 uppercase font-mono">Hacker Verified</h1>
            <p className="text-xs text-emerald-300 mt-1 font-mono uppercase tracking-wider">Hacker House Goa Residency · 2026</p>
          </div>

          {/* Profile Card split column details */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Scanned Card Presentation */}
            <div className="flex justify-center items-center scale-95 sm:scale-100">
              <BadgeCardComponent
                image={null} // Scanned profiles don't load huge binary blobs locally
                name={scannedProfile.name}
                role={scannedProfile.role}
                builderTitle={scannedProfile.title}
                theme={THEMES[0]}
                stickers={[]}
                frameShape="arch"
                bgPattern="zebra"
                photoZoom={1}
                photoX={0}
                photoY={0}
                sideTextLeft="HUSTLE & SHIP"
                sideTextRight="BUILD IN GOA"
                barcodeVal="HHG-2026-VERIFIED"
                qrCodeUrl=""
                badgeRef={badgeRef}
                activeSticker={null}
                onMoveSticker={() => {}}
                onRemoveSticker={() => {}}
                onActivateSticker={() => {}}
                isWearableMode={false}
              />
            </div>

            {/* Profile Info Hub card details */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-xl animate-[fade-slide-up_0.5s_ease]">
              <div className="flex items-center gap-3.5 pb-4 border-b border-emerald-900">
                <div className="p-1 rounded-full border-2 border-[#fed215] bg-emerald-900/40 flex-shrink-0">
                  <AvatarIcon type={scannedProfile.avatar} size={56} />
                </div>
                <div>
                  <span className="text-[8px] font-mono text-pink-400 uppercase tracking-widest">Residency Builder</span>
                  <h2 className="text-2xl font-bold text-white leading-tight uppercase font-mono">{scannedProfile.name}</h2>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-[0.08em] uppercase font-mono mt-1" style={{ backgroundColor: '#ff007f15', border: '1px solid #ff007f', color: '#ff007f' }}>
                    {scannedProfile.role}
                  </span>
                </div>
              </div>

              {/* Bio block */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-[#fed215] uppercase tracking-wider font-bold">About the builder:</span>
                <p className="text-sm text-emerald-100/90 leading-relaxed bg-[#012519]/70 border border-emerald-900/60 p-4 rounded-xl italic">
                  {scannedProfile.bio || '"Currently shipping code and chasing sunsets at Hacker House Goa residency."'}
                </p>
              </div>

              {/* Builder track details */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-emerald-300">
                <div className="bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/50">
                  <span className="block text-[8px] text-emerald-500 uppercase tracking-wider">Builder Title:</span>
                  <span className="block text-white font-bold italic mt-0.5">&ldquo;{scannedProfile.title}&rdquo;</span>
                </div>
                <div className="bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/50">
                  <span className="block text-[8px] text-emerald-500 uppercase tracking-wider">Status:</span>
                  <span className="block text-emerald-400 font-bold mt-0.5">🟢 ACTIVE RESIDENT</span>
                </div>
              </div>

              {/* Interactive buttons */}
              <div className="flex flex-col gap-2 pt-4 border-t border-emerald-900/60">
                <div className="flex gap-2">
                  {scannedProfile.gh && (
                    <a
                      href={`https://github.com/${scannedProfile.gh}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-spring flex-1 py-3 rounded-xl bg-[#012519]/90 border border-emerald-800 text-xs font-mono font-bold text-[#fed215] hover:text-white flex items-center justify-center gap-2 shadow"
                    >
                      View GitHub
                    </a>
                  )}
                  {scannedProfile.tw && (
                    <a
                      href={`https://twitter.com/${scannedProfile.tw}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-spring flex-1 py-3 rounded-xl bg-[#012519]/90 border border-emerald-800 text-xs font-mono font-bold text-[#fed215] hover:text-white flex items-center justify-center gap-2 shadow"
                    >
                      Connect on X
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Redirect to builder and drop user pin
                      // Pre-populate scanned user on map
                      const targetBeach = BEACH_LOCATIONS[Math.floor(Math.random() * BEACH_LOCATIONS.length)]
                      const scannedPin: MapPin = {
                        id: `scanned-${Math.random().toString(36).slice(2)}`,
                        name: scannedProfile.name,
                        role: scannedProfile.role,
                        title: scannedProfile.title,
                        gh: scannedProfile.gh,
                        tw: scannedProfile.tw,
                        avatar: scannedProfile.avatar,
                        bio: scannedProfile.bio,
                        beach: targetBeach.label,
                        x: targetBeach.x,
                        y: targetBeach.y
                      }
                      setMapPins(prev => [...prev.filter(p => p.name !== scannedProfile.name), scannedPin])
                      setSelectedPinId(scannedPin.id)
                      setHighlightedBeach(scannedPin.beach)
                      
                      setView('builder')
                      setTimeout(() => {
                        document.getElementById('residency-hacker-map')?.scrollIntoView({ behavior: 'smooth' })
                      }, 400)
                    }}
                    className="py-2.5 rounded-xl border border-pink-600/50 bg-pink-700/10 hover:bg-pink-700/20 text-pink-300 font-mono text-[10px] font-bold cursor-pointer transition-all"
                  >
                    📍 View on Map
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setView('builder')
                    }}
                    className="py-2.5 rounded-xl bg-gradient-to-r from-[#fed215] to-[#ff007f] text-[#021810] font-mono text-[10px] font-bold cursor-pointer transition-all text-center flex items-center justify-center hover:brightness-110"
                  >
                    Create My Badge
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Footer disclaimer */}
      <footer className="py-6 text-center text-[10px] text-emerald-500 font-mono border-t border-emerald-950 mt-auto z-20">
        Hacker House Goa · 2026 Residency Badge Builder. Built for Gen Z shippers.
      </footer>
    </div>
  )
}
