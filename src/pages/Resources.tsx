import { useMemo, useState } from 'react'
import { Check, Download } from '../components/ui/icons'

type Resource = { id: string; category: string; title: string; reference: string; body: string }

const encouragement: Resource[] = [
  { id: 'new-convert', category: 'New converts', title: 'Keep growing in the grace you have received', reference: '2 Peter 3:18', body: 'Your journey with Christ has begun, and there is room to keep growing. Take time to pray, read the Word, and remain connected to other believers. You do not have to understand everything at once; keep taking faithful steps with the Lord.' },
  { id: 'absent', category: 'Absent members', title: 'You are remembered', reference: 'Hebrews 10:24–25', body: 'We noticed your absence and wanted to check how you are doing. You are valued, and we would love to see you again when you are able. Is there anything we can pray with you about?' },
  { id: 'discouraged', category: 'Discouraged believers', title: 'Do not lose heart', reference: 'Galatians 6:9', body: 'A difficult season does not mean that God has abandoned you. Keep trusting Him one day at a time. You are not expected to carry everything alone; let us stand with you in prayer and fellowship.' },
  { id: 'fellowship', category: 'Fellowship consistency', title: 'Keep making room for fellowship', reference: 'Hebrews 10:24–25', body: 'Our faith is strengthened as we encourage one another. Let us keep making room for the gathering of believers, mutual care, and the sharing of God’s Word.' },
  { id: 'prayer-study', category: 'Prayer and Bible study', title: 'Build a steady rhythm with God', reference: 'Colossians 4:2', body: 'You do not need a complicated routine to begin. Set aside a consistent time to speak with God and listen to His Word. Small, faithful steps can help establish a deeper life of prayer and Scripture.' },
  { id: 'difficult-season', category: 'Difficult seasons', title: 'You do not have to walk alone', reference: 'Romans 12:15', body: 'I am sorry this season has been difficult. I may not have all the answers, but I am willing to listen and pray with you. Please let me know how we can support you in a practical way.' },
  { id: 'fervency', category: 'Spiritual fervency', title: 'Stir up your devotion again', reference: 'Romans 12:11', body: 'If your spiritual routine has become quiet, you can begin again. Return to prayer, the Scriptures, fellowship and obedience, trusting the Lord for renewed strength and desire.' },
]

const paulinePrayers: Resource[] = [
  { id: 'eph1', category: 'Spiritual understanding', title: 'Prayer for revelation and enlightened understanding', reference: 'Ephesians 1:15–23', body: 'Father, grant us the spirit of wisdom and revelation in the knowledge of You. Enlighten the eyes of our understanding, that we may know the hope of Your calling, the riches of Your inheritance in the saints, and the exceeding greatness of Your power toward us who believe. Establish our hearts in the truth of Christ, who is exalted above every principality and power. Amen.' },
  { id: 'eph3', category: 'Strength and love', title: 'Prayer for inner strength and the fullness of God', reference: 'Ephesians 3:14–21', body: 'Father, strengthen us with might by Your Spirit in our inner man. Let Christ dwell in our hearts by faith. Root and ground us in love, and help us comprehend the breadth, length, depth and height of the love of Christ. Fill us with all Your fullness, and do in us beyond what we can ask or think, according to Your power at work within us. Amen.' },
  { id: 'phil1', category: 'Love and discernment', title: 'Prayer for growing love and wise choices', reference: 'Philippians 1:9–11', body: 'Lord, cause our love to abound more and more in knowledge and in all judgment. Help us discern what is excellent, walk sincerely, and be filled with the fruits of righteousness which come through Jesus Christ, to the glory and praise of God. Amen.' },
  { id: 'col1', category: 'Fruitfulness and wisdom', title: 'Prayer for knowledge of God’s will', reference: 'Colossians 1:9–14', body: 'Father, fill us with the knowledge of Your will in all wisdom and spiritual understanding. Teach us to walk worthy of You, pleasing You in every good work, increasing in the knowledge of God. Strengthen us with Your glorious power for patience, endurance and joy, and keep us thankful for the redemption we have in Christ. Amen.' },
  { id: '1thess3', category: 'Love and holiness', title: 'Prayer for abundant love and steadfast hearts', reference: '1 Thessalonians 3:12–13', body: 'Lord, make our love increase and overflow toward one another and toward all people. Establish our hearts blameless in holiness before You, and teach us to live in readiness and faithfulness before the coming of our Lord Jesus Christ. Amen.' },
  { id: '2thess1', category: 'Faith and perseverance', title: 'Prayer that God fulfils every good purpose', reference: '2 Thessalonians 1:11–12', body: 'God, count us worthy of Your calling. Fulfil every good purpose and work of faith by Your power. Let the name of our Lord Jesus be glorified in us, and let our lives reflect His grace, for the glory of our God and the Lord Jesus Christ. Amen.' },
]

const scriptures: Resource[] = [
  { id: 'love', category: 'Love and unity', title: 'A new commandment', reference: 'John 13:34 (KJV)', body: 'A new commandment I give unto you, That ye love one another; as I have loved you, that ye also love one another.' },
  { id: 'unity', category: 'Love and unity', title: 'Dwelling together in unity', reference: 'Psalm 133:1 (KJV)', body: 'Behold, how good and how pleasant it is for brethren to dwell together in unity!' },
  { id: 'faith', category: 'Faith and trust in God', title: 'The substance of faith', reference: 'Hebrews 11:1 (KJV)', body: 'Now faith is the substance of things hoped for, the evidence of things not seen.' },
  { id: 'trust', category: 'Faith and trust in God', title: 'Trust in the Lord', reference: 'Proverbs 3:5–6 (KJV)', body: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.' },
  { id: 'prayer', category: 'Prayer', title: 'Continue in prayer', reference: 'Colossians 4:2 (KJV)', body: 'Continue in prayer, and watch in the same with thanksgiving;' },
  { id: 'pray-always', category: 'Prayer', title: 'Pray without ceasing', reference: '1 Thessalonians 5:17 (KJV)', body: 'Pray without ceasing.' },
  { id: 'growth', category: 'Spiritual growth', title: 'Grow in grace', reference: '2 Peter 3:18 (KJV)', body: 'But grow in grace, and in the knowledge of our Lord and Saviour Jesus Christ. To him be glory both now and for ever. Amen.' },
  { id: 'evangelism', category: 'Evangelism', title: 'Go into all the world', reference: 'Mark 16:15 (KJV)', body: 'And he said unto them, Go ye into all the world, and preach the gospel to every creature.' },
  { id: 'endurance', category: 'Endurance', title: 'Do not grow weary', reference: 'Galatians 6:9 (KJV)', body: 'And let us not be weary in well doing: for in due season we shall reap, if we faint not.' },
  { id: 'character', category: 'Christian character', title: 'The fruit of the Spirit', reference: 'Galatians 5:22–23 (KJV)', body: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law.' },
  { id: 'encouragement', category: 'Encouragement', title: 'Steadfast labour in the Lord', reference: '1 Corinthians 15:58 (KJV)', body: 'Therefore, my beloved brethren, be ye stedfast, unmoveable, always abounding in the work of the Lord, forasmuch as ye know that your labour is not in vain in the Lord.' },
  { id: 'provision', category: 'God’s provision', title: 'God supplies our need', reference: 'Philippians 4:19 (KJV)', body: 'But my God shall supply all your need according to his riches in glory by Christ Jesus.' },
]

const tabs = ['Encouragement', 'Pauline Prayers', 'Scripture Library'] as const

export default function Resources() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Encouragement')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [copied, setCopied] = useState('')

  const source = tab === 'Encouragement' ? encouragement : tab === 'Pauline Prayers' ? paulinePrayers : scriptures
  const categories = useMemo(() => ['All', ...Array.from(new Set(source.map((item) => item.category)))], [source])
  const visible = source.filter((item) =>
    (category === 'All' || item.category === category)
    && `${item.title} ${item.reference} ${item.body} ${item.category}`.toLowerCase().includes(search.toLowerCase()),
  )

  const copy = async (item: Resource) => {
    const text = `${item.title}\n${item.reference}\n\n${item.body}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(item.id)
      window.setTimeout(() => setCopied(''), 1800)
    } catch {
      alert('Copy is unavailable in this browser. Please select and copy the text manually.')
    }
  }

  return (
    <div className="space-y-6">
      <header><p className="eyebrow">Ministry library</p><h1 className="page-title mt-3">Spiritual Resources</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Scripture-grounded encouragement, Pauline prayers and Bible passages for personal growth and thoughtful follow-up.</p></header>
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-white/10">
        {tabs.map((item) => <button key={item} onClick={() => { setTab(item); setCategory('All') }} className={`px-3 py-2 text-sm font-semibold ${tab === item ? 'border-b-2 border-gold-500 text-slate-950 dark:text-white' : 'text-slate-500'}`}>{item}</button>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_16rem]">
        <input className="input" placeholder="Search resources…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
      </div>
      <p className="text-xs text-slate-500">{visible.length} resources · Scripture quotations are from the King James Version (KJV).</p>
      <div className="grid gap-3 md:grid-cols-2">
        {visible.map((item) => <article key={item.id} className="card flex flex-col gap-3 p-5">
          <div><p className="eyebrow">{item.category}</p><h2 className="mt-2 font-display text-xl">{item.title}</h2><p className="mt-1 text-xs font-semibold text-gold-700 dark:text-gold-400">{item.reference}</p></div>
          <p className="flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">{item.body}</p>
          <div className="border-t border-slate-100 pt-3 dark:border-white/10"><button onClick={() => copy(item)} className="btn-secondary !py-2 !text-xs">{copied === item.id ? <Check size={14} /> : <Download size={14} />}{copied === item.id ? 'Copied' : 'Copy and share'}</button></div>
        </article>)}
        {visible.length === 0 && <p className="py-8 text-sm text-slate-500">No resources match this search.</p>}
      </div>
    </div>
  )
}
