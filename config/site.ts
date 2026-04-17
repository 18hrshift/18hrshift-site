export const site = {
  name: '18HRSHIFT',
  monogram: '18',
  tagline: 'OUTPUT IS THE ONLY METRIC.',
  description: '18HRSHIFT — digital native production.',
  url: 'https://18hrshift.vercel.app',

  nav: [
    { label: 'SIGNAL',   href: '#signal' },
    { label: 'ARCHIVE',  href: '#archive' },
    { label: 'ENDPOINT', href: '#endpoint' },
  ],

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
    email: 'signal@18hrshift.com',
    socials: [
      { label: 'GH', href: 'https://github.com/18hrshift' },
    ],
  },
} as const
