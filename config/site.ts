export const site = {
  name: '18HRSHIFT',
  monogram: '18',
  tagline: 'OUTPUT IS THE ONLY METRIC.',
  description: '18HRSHIFT — digital native production.',
  url: 'https://18hrshift.com',

  nav: [
    { label: 'SIGNAL',   href: '#signal' },
    { label: 'BLOG',     href: '#blog' },
    { label: 'WOW_',     href: '#wow' },
    { label: 'ARCHIVE',  href: '#archive' },
    { label: 'ENDPOINT', href: '#endpoint' },
  ],

  blog: {
    categories: ['TECH', 'AI', 'GAMING', 'ENTERTAINMENT', 'SPORTS', 'CULTURE'],
    posts: [
      { id: 'p1',  title: 'The local-first reckoning',       category: 'TECH',   excerpt: 'Why the cloud pendulum swings back toward the edge, offline-first apps, and the machines in every pocket.', date: '2026-02-11', read: '6 MIN' },
      { id: 'p2',  title: 'MCP and the agentic supply chain', category: 'AI',     excerpt: 'Agents stop being demos when tools become contracts. A field guide to the model-as-commodity stack.', date: '2026-02-02', read: '9 MIN' },
      { id: 'p3',  title: 'The comeback meta nobody saw',    category: 'GAMING', excerpt: 'Buffs, nerfs, and the one patch that flipped a forgotten roster into the most-streamed comp of the season.', date: '2026-01-24', read: '5 MIN' },
      { id: 'p4',  title: 'Blockbusters are a volume game now', category: 'ENTERTAINMENT', excerpt: 'One a quarter is nobody\'s model anymore. How studios survive the pivot to a constant output treadmill.', date: '2026-01-15', read: '7 MIN' },
      { id: 'p5',  title: 'The stat that lies about your team', category: 'SPORTS', excerpt: 'Possession, expected value, and the numbers coaches quietly ignore when the game is on the line.', date: '2026-01-08', read: '4 MIN' },
      { id: 'p6',  title: 'Scrolling as a sport',            category: 'CULTURE', excerpt: 'Attention spans are the new arena. A look at the feeds engineered to keep you in the crowd forever.', date: '2025-12-19', read: '8 MIN' },
      { id: 'p7',  title: 'Hype cycles metered by the megawatt', category: 'TECH', excerpt: 'Energy is the real GPU shortage now. What happens to everyone else when the grid becomes the bottleneck.', date: '2025-12-05', read: '6 MIN' },
      { id: 'p8',  title: 'Benchmarks are a trust fund',     category: 'AI',     excerpt: 'Leaderboards rot in months. The only metric that matters is shipped value, and it refuses to be a score.', date: '2025-11-21', read: '7 MIN' },
      { id: 'p9',  title: 'Roguelites eat the live-service lunch', category: 'GAMING', excerpt: 'Failure becomes the fun. Why the games that let you lose are the ones you cannot stop running back.', date: '2025-11-08', read: '5 MIN' },
      { id: 'p10', title: 'Sequels, remakes, and the nostalgia bind', category: 'ENTERTAINMENT', excerpt: 'IP is not a moat, it is a memory. The economics of selling you the thing you already loved.', date: '2025-10-30', read: '6 MIN' },
      { id: 'p11', title: 'The two-minute tempo',            category: 'SPORTS', excerpt: 'Every great play is a pulse. How tempo datasets are reshaping the way finishing moves are engineered.', date: '2025-10-17', read: '4 MIN' },
      { id: 'p12', title: 'Anti-algorithms',                 category: 'CULTURE', excerpt: 'Chasing the feed is a full-time job nobody survives. Notes on disconnecting inside the machine you already own.', date: '2025-10-02', read: '9 MIN' },
    ],
  },

  signal: {
    label: 'SIGNAL',
    lines: [
      'Content is compute.',
      'Distribute or dissolve.',
      'Every frame deliberate.',
    ],
  },

  archive: [
    { id: '01', label: 'REDACTED',    code: '#A01', year: '2025' },
    { id: '02', label: 'CLASSIFIED',  code: '#B07', year: '2025' },
    { id: '03', label: 'UNDISCLOSED', code: '#C12', year: '2024' },
    { id: '04', label: '████████',    code: '#D04', year: '2024' },
    { id: '05', label: 'PENDING',     code: '#E09', year: '2026' },
    { id: '06', label: 'UNKNOWN',     code: '#F03', year: '2026' },
  ],

  endpoint: {
    prompt: 'TRANSMIT >',
    email: 'admin@18hrshift.com',
    socials: [
      { label: 'GH', href: 'https://github.com/18hrshift' },
    ],
  },
} as const
