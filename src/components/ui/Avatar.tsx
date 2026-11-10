// Initials avatar with a stable, muted jewel-tone per person so lists feel
// alive without needing photos.
const TONES = [
  'bg-gold-500/15 text-gold-700 dark:text-gold-300',
  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  'bg-orange-500/15 text-orange-700 dark:text-orange-300',
]

export function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export default function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-bold ${TONES[h % TONES.length]}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  )
}
