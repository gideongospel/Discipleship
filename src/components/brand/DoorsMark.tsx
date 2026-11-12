import white from '../../assets/logo-mark-white.png'
import ink from '../../assets/logo-mark.png'

type Motion = 'none' | 'enter' | 'loop'

// The doors-and-cross mark, drawn as two independent halves so the doors can
// slide open on entrance ('enter'), or part and close gently as a loader ('loop').
function Halves({ src, size, motion }: { src: string; size: number; motion: Motion }) {
  const half = (side: 'l' | 'r') => {
    const anim =
      motion === 'enter'
        ? side === 'l' ? 'animate-door-left' : 'animate-door-right'
        : motion === 'loop'
          ? side === 'l' ? 'animate-loader-left' : 'animate-loader-right'
          : ''
    return (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={`absolute inset-0 h-full w-full select-none ${anim}`}
        style={{ clipPath: side === 'l' ? 'inset(0 49.6% 0 0)' : 'inset(0 0 0 49.6%)' }}
      />
    )
  }
  return (
    <div className="relative" style={{ width: size, height: (size * 505) / 525 }}>
      {half('l')}
      {half('r')}
    </div>
  )
}

export default function DoorsMark({
  size = 96,
  tone = 'auto',
  animate = false,
  motion,
  className = '',
}: {
  size?: number
  tone?: 'white' | 'ink' | 'auto'
  animate?: boolean
  motion?: Motion
  className?: string
}) {
  const m: Motion = motion ?? (animate ? 'enter' : 'none')
  return (
    <div className={className} role="img" aria-label="The Supernatural Arena">
      {tone === 'white' && <Halves src={white} size={size} motion={m} />}
      {tone === 'ink' && <Halves src={ink} size={size} motion={m} />}
      {tone === 'auto' && (
        <>
          <div className="dark:hidden"><Halves src={ink} size={size} motion={m} /></div>
          <div className="hidden dark:block"><Halves src={white} size={size} motion={m} /></div>
        </>
      )}
    </div>
  )
}
