// Typeset wordmark matching the logo lockup: tiny, widely-tracked "THE"
// over a heavy geometric "SUPERNATURAL ARENA". Rendered as live text (not
// an image) so it stays razor-sharp at any size and follows light/dark mode.
export default function Wordmark({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const cfg = {
    sm: { the: 'text-[0.46rem] tracking-[0.62em]', main: 'text-[0.8rem] tracking-[-0.01em]' },
    md: { the: 'text-[0.55rem] tracking-[0.6em]', main: 'text-[1.05rem] tracking-[-0.01em]' },
    lg: { the: 'text-xs tracking-[0.65em]', main: 'text-[2rem] tracking-[-0.015em] sm:text-[2.4rem]' },
  }[size]
  return (
    <div className={`font-brand leading-none ${className}`}>
      <div className={`mb-[0.35em] pl-[0.1em] font-bold ${cfg.the}`}>THE</div>
      <div className={`font-black uppercase ${cfg.main}`}>Supernatural Arena</div>
    </div>
  )
}
