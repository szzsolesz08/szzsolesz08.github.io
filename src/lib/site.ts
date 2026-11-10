export const SITE = {
  name: 'Zsolt Szabó',
  role: 'Frontend developer',
  email: 'szzsolesz008@gmail.com',
  github: 'https://github.com/szzsolesz08',
  linkedin: 'https://www.linkedin.com/in/zsolt-szabo08/',
  repo: 'https://github.com/szzsolesz08/szzsolesz08.github.io',
} as const

export const sourceUrl = (path: string) => `${SITE.repo}/blob/main/${path}`

export const SECTIONS = [
  { id: 'top', label: 'The core' },
  { id: 'manifesto', label: 'How I work' },
  { id: 'lab', label: 'The Lab' },
  { id: 'built', label: 'How this site was built' },
  { id: 'toolkit', label: 'Toolkit' },
  { id: 'contact', label: 'Say hello' },
] as const
