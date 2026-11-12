export function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

// Quiet monogram: serif initials in a hairline circle. No colour-coding —
// a congregation list shouldn't look like a rainbow.
export default function Avatar({ name, size = 36, onDark = false }: { name: string; size?: number; onDark?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border font-display font-medium italic ${
        onDark
          ? 'border-white/20 text-slate-200'
          : 'border-slate-300 text-slate-700 dark:border-white/20 dark:text-slate-200'
      }`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  )
}
