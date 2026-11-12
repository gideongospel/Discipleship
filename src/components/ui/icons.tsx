import type { ReactElement, ReactNode } from 'react'

// ───────────────────────────────────────────────────────────────────────
// The Supernatural Arena icon set.
// Drawn on a 24px grid with square caps and mitered joins so every icon
// shares the sharp, architectural geometry of the doors-and-cross logo
// (instead of the soft, rounded look of stock icon libraries). Where it
// matters, the metaphor is a church one: a lantern for outreach, a
// calendar marked with a cross for follow-ups, a pew for attendance, a key
// for administration, a sprout for new converts.
// ───────────────────────────────────────────────────────────────────────

export interface IconProps {
  size?: number
  className?: string
  strokeWidth?: number
}
export type IconType = (props: IconProps) => ReactElement

function Svg({ size = 20, strokeWidth = 1.6, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const icon =
  (children: ReactNode): IconType =>
  (props) => <Svg {...props}>{children}</Svg>

// ── Domain icons ──────────────────────────────────────────────────────
/** Two door panels, slightly ajar — the logo, simplified. */
export const Threshold = icon(
  <>
    <path d="M3 7 L11 4 V20 L3 18 Z" />
    <path d="M13 4 L21 7 V18 L13 20 Z" />
  </>,
)
export const People = icon(
  <>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20 V18 L6 15 H12 L15 18 V20" />
    <path d="M15.5 5.3 A3.2 3.2 0 0 1 15.5 10.7" />
    <path d="M17.5 15 H18 L21 18 V20" />
  </>,
)
export const PersonAdd = icon(
  <>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20 V18 L6 15 H12 L15 18 V20" />
    <path d="M19 5 V11 M16 8 H22" />
  </>,
)
/** A lantern with a small flame — light carried outward. */
export const Lantern = icon(
  <>
    <path d="M10 4.5 L12 2.5 L14 4.5" />
    <path d="M8.5 6.5 H15.5" />
    <path d="M8.5 6.5 L7 18 H17 L15.5 6.5" />
    <path d="M8 18 V21 H16 V18" />
    <path d="M12 10 L13.5 12.8 L12 15.5 L10.5 12.8 Z" />
  </>,
)
/** Calendar marked with the cross. */
export const Visit = icon(
  <>
    <path d="M4 6 H20 V20 H4 Z" />
    <path d="M4 10 H20" />
    <path d="M8 3.5 V7.5 M16 3.5 V7.5" />
    <path d="M12 12.5 V18 M9.5 15 H14.5" />
  </>,
)
/** A pew, seen from the front. */
export const Pew = icon(
  <>
    <path d="M4 5 H20 V11 H4 Z" />
    <path d="M3 14.5 H21" />
    <path d="M6 14.5 V20 M18 14.5 V20" />
  </>,
)
/** A staircase — steady growth, one step at a time. */
export const Steps = icon(
  <>
    <path d="M3 20 V16 H8 V12 H13 V8 H18 V4 H21" />
    <path d="M3 20 H21" />
  </>,
)
export const Key = icon(
  <>
    <circle cx="7.5" cy="7.5" r="3.5" />
    <path d="M10.2 10.2 L21 21" />
    <path d="M16.5 16.5 L19.5 13.5" />
    <path d="M19.2 19.2 L21.7 16.7" />
  </>,
)
export const Sliders = icon(
  <>
    <path d="M3 6 H13 M17 6 H21" />
    <path d="M13 4 H17 V8 H13 Z" />
    <path d="M3 12 H6 M10 12 H21" />
    <path d="M6 10 H10 V14 H6 Z" />
    <path d="M3 18 H11 M15 18 H21" />
    <path d="M11 16 H15 V20 H11 Z" />
  </>,
)
export const Sprout = icon(
  <>
    <path d="M12 21 V11" />
    <path d="M12 15 L5 13 L4.5 7.5 L10.5 9.5 Z" />
    <path d="M12 11 L19 9 L19.5 4 L13.5 5.5 Z" />
    <path d="M8 21 H16" />
  </>,
)

// ── Utility icons ─────────────────────────────────────────────────────
export const X = icon(<path d="M5 5 L19 19 M19 5 L5 19" />)
export const Plus = icon(<path d="M12 4 V20 M4 12 H20" />)
export const Check = icon(<path d="M4.5 12.5 L9.5 17.5 L19.5 6.5" />)
export const Search = icon(
  <>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 L21 21" />
  </>,
)
export const Bell = icon(
  <>
    <path d="M6 17 V10 L9.5 5 H14.5 L18 10 V17 Z" />
    <path d="M4 17 H20" />
    <path d="M10 20.5 H14" />
  </>,
)
export const Sun = icon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5 V5 M12 19 V21.5 M2.5 12 H5 M19 12 H21.5 M5.3 5.3 L7 7 M17 17 L18.7 18.7 M5.3 18.7 L7 17 M17 7 L18.7 5.3" />
  </>,
)
export const Moon = icon(<path d="M21 12.8 A9 9 0 1 1 11.2 3 A7 7 0 0 0 21 12.8 Z" />)
export const Menu = icon(<path d="M4 7 H20 M4 12 H20 M4 17 H13" />)
export const LogOut = icon(
  <>
    <path d="M10 4 H4 V20 H10" />
    <path d="M9 12 H21 M17 8 L21 12 L17 16" />
  </>,
)
export const Download = icon(<path d="M12 4 V15 M7 10.5 L12 15.5 L17 10.5 M4 19.5 H20" />)
export const ArrowRight = icon(<path d="M4 12 H20 M14 6 L20 12 L14 18" />)
export const ArrowUp = icon(<path d="M12 20 V5 M6 11 L12 5 L18 11" />)
export const ArrowDown = icon(<path d="M12 4 V19 M6 13 L12 19 L18 13" />)
export const Enter = icon(<path d="M20 5 V13 H6 M10 9 L6 13 L10 17" />)
export const Pencil = icon(
  <>
    <path d="M4 20 L4.8 15.5 L16 4.3 L19.7 8 L8.5 19.2 Z" />
    <path d="M13.5 6.8 L17.2 10.5" />
  </>,
)
export const Trash = icon(
  <>
    <path d="M4 7 H20 M9 7 V4 H15 V7" />
    <path d="M6 7 L7 20 H17 L18 7" />
    <path d="M10 11 V16 M14 11 V16" />
  </>,
)
export const Alert = icon(
  <>
    <path d="M12 3.5 L21.5 20 H2.5 Z" />
    <path d="M12 10 V14.5 M12 17 V17.6" />
  </>,
)

// ── Aliases (so call-sites read naturally and stay short) ─────────────
export {
  Threshold as LayoutDashboard,
  People as Users,
  PersonAdd as UserPlus,
  Lantern as Megaphone,
  Visit as CalendarClock,
  Visit as CalendarCheck,
  Pew as ClipboardCheck,
  Steps as BarChart3,
  Steps as TrendingUp,
  Key as ShieldCheck,
  Key as KeyRound,
  Sliders as Settings,
  Sprout as Sparkles,
  Trash as Trash2,
  Alert as AlertTriangle,
  Enter as CornerDownLeft,
}
export type LucideIcon = IconType
