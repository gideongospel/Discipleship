import white from '../../assets/logo-mark-white.png'
import ink from '../../assets/logo-mark.png'

// The doors-and-cross mark, drawn as two independent halves so the doors
// can slide open on entrance. At rest the halves meet seamlessly.
function Halves({ src, size, animate }: { src: string; size: number; animate: boolean }) {
  const half = (side: 'l' | 'r') => (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`absolute inset-0 h-full w-full select-none ${
        animate ? (side === 'l' ? 'animate-door-left' : 'animate-door-right') : ''
      }`}
      style={{ clipPath: side === 'l' ? 'inset(0 49.6% 0 0)' : 'inset(0 0 0 49.6%)' }}
    />
  )
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
  className = '',
}: {
  size?: number
  tone?: 'white' | 'ink' | 'auto'
  animate?: boolean
  className?: string
}) {
  return (
    <div className={className} role="img" aria-label="The Supernatural Arena">
      {tone === 'white' && <Halves src={white} size={size} animate={animate} />}
      {tone === 'ink' && <Halves src={ink} size={size} animate={animate} />}
      {tone === 'auto' && (
        <>
          <div className="dark:hidden"><Halves src={ink} size={size} animate={animate} /></div>
          <div className="hidden dark:block"><Halves src={white} size={size} animate={animate} /></div>
        </>
      )}
    </div>
  )
}
