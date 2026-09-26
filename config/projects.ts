export type ProjectCategory = 'Products' | 'Games' | 'Systems'

export type Project = {
  id: string
  number: string
  name: string
  discipline: string
  categories: readonly ProjectCategory[]
  summary: string
  headline: string
  story: string
  features: readonly string[]
  status: string
  statusNote: string
  url?: string
  linkLabel?: string
  layout?: 'system'
}

export const projects: readonly Project[] = [
  {
    id: 'embersave',
    number: '01',
    name: 'Embersave',
    discipline: 'Gaming tools / Desktop',
    categories: ['Products', 'Games'],
    summary: 'One world. Whoever gets online first.',
    headline: 'Keep the world alive.',
    story: 'A survival world should belong to the whole friend group. Embersave is an open-source launcher that passes one shared save between players. Take a turn hosting, play together, then hand the world on when you leave.',
    features: [
      'Palworld host handoffs between two machines',
      'One host at a time, with background save snapshots',
      'Save recovery and a desktop launcher',
      'Save files kept in the players’ own Google Drive',
    ],
    status: 'In development',
    statusNote: 'The Palworld handoff has been tested end to end. There is no public installer yet; broader game support is still ahead.',
    url: 'https://embersave.18hrshift.com',
    linkLabel: 'Meet Embersave',
  },
  {
    id: 'specter',
    number: '02',
    name: 'Specter 1-1',
    discipline: 'Games / Real-time 3D',
    categories: ['Games'],
    summary: 'A world below. Every decision carries.',
    headline: 'Bring the squad home.',
    story: 'A tactical gunship experiment set in an alternate Cold War. Orbit above a stylized world, protect the team on the ground, and carry a persistent squad through operations where losses stay with you.',
    features: [
      'Playable gunship combat with multiple weapons and sensors',
      'Five theaters with distinct terrain and missions',
      'A campaign, field upgrades and a persistent squad roster',
      'A real-time 3D browser prototype',
    ],
    status: 'Playable prototype',
    statusNote: 'Explore the browser prototype on a desktop with a mouse and keyboard. The game is in development; this is an experimental build.',
    url: 'https://c130.18hrshift.com',
    linkLabel: 'Play the prototype',
  },
  {
    id: 'hairraiser',
    number: '03',
    name: 'Hairraiser',
    discipline: 'Platforms / Brand',
    categories: ['Products'],
    summary: 'An idea with a human side.',
    headline: 'Fund your comeback.',
    story: 'Personal crowdfunding for hair-restoration journeys. Hairraiser brings campaign stories, contributions and progress updates together in a warm, approachable product built around the people using it.',
    features: [
      'Campaign creation, cover photos and progress updates',
      'One-off contributions through Stripe Checkout',
      'Campaigner dashboards and payout-review requests',
      'A complete brand, website and educational content',
    ],
    status: 'Live web platform',
    statusNote: 'The public website and campaign platform are available now, with ongoing product development.',
    url: 'https://hairraiser.xyz',
    linkLabel: 'Visit Hairraiser',
  },
  {
    id: 'openwater',
    number: '04',
    name: 'Openwater',
    discipline: 'Mobile / Maps',
    categories: ['Products'],
    summary: 'Less screen time. More water time.',
    headline: 'Find your next good day.',
    story: 'A local-first fishing companion, starting in Pennsylvania. Find water, keep a personal catch log and share waypoints with friends, with your own fishing history kept close to you.',
    features: [
      'A Flutter mobile app with map and water-detail views',
      'Catch logging, photos, waypoints and a personal logbook',
      'Water conditions and stocking-data integrations',
      'On-device storage with optional friend sharing',
    ],
    status: 'In development',
    statusNote: 'The app and data services are being developed. There is no public app-store release to download yet. The map artwork shown here is an illustration.',
  },
  {
    id: 'bedrock',
    number: '05',
    name: 'Bedrock SQL',
    discipline: 'Infrastructure / PostgreSQL',
    categories: ['Systems'],
    layout: 'system',
    summary: 'The foundation underneath the products.',
    headline: 'Build on something solid.',
    story: 'Our self-hosted PostgreSQL platform gives separate projects a shared operational foundation. The work goes beyond running a database: it includes tenant boundaries, encrypted connections, recoverable backups and checks that exercise the database itself.',
    features: [
      'Separate project databases and access roles',
      'TLS connections and bounded tenant connection budgets',
      'Off-provider backups and point-in-time recovery',
      'Automated restore drills and authenticated health checks',
    ],
    status: 'Built & operated',
    statusNote: 'An operational platform for our own projects, designed around a single database server and tested recovery workflows.',
  },
  {
    id: 'openwrt',
    number: '06',
    name: 'OpenWrt network',
    discipline: 'Networking / Open source',
    categories: ['Systems'],
    layout: 'system',
    summary: 'Own the network. Understand every layer.',
    headline: 'A network with a plan.',
    story: 'An open-source network build, from router firmware to DNS filtering and a considered cutover. OpenWrt and Pi-hole form the base, with guest separation, private remote access and monitoring designed for everyday use.',
    features: [
      'Official OpenWrt router setup and completed cutover',
      'Pi-hole filtering with a filtered DNS fallback',
      'Guest Wi-Fi separation and WireGuard remote access',
      'Service checks, configuration backups and recovery guides',
    ],
    status: 'Built & operated',
    statusNote: 'Running on our own network, with configuration backups and documented recovery procedures.',
  },
  {
    id: 'homelab',
    number: '07',
    name: 'The home lab',
    discipline: 'Virtualization / Operations',
    categories: ['Systems'],
    layout: 'system',
    summary: 'Where the experiments become infrastructure.',
    headline: 'From the machine up.',
    story: 'A hands-on environment for building and running our own services. Virtual machines, backup routines, power monitoring and documented recovery turn a collection of hardware into a place where ideas can keep running.',
    features: [
      'Proxmox virtualization with Linux guests',
      'Scheduled virtual-machine backups and boot configuration',
      'UPS monitoring and graceful-shutdown configuration',
      'Shared observability and evidence-led incident runbooks',
    ],
    status: 'Built & operated',
    statusNote: 'Our working environment for self-hosted services, development, and infrastructure experiments.',
  },
]
