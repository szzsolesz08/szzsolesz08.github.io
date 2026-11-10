import './Toolkit.css'

const GROUPS = [
  {
    name: 'Build',
    tools: ['React', 'TypeScript', 'Next.js', 'Vite', 'React Native · Expo'],
    why: 'React and TypeScript for everything. Next.js when it needs a server, Vite when it doesn’t.',
  },
  {
    name: 'Style & motion',
    tools: ['Modern CSS', 'Tailwind CSS', 'GSAP', 'WebGL · GLSL', 'Canvas'],
    why: 'Plain CSS first. Animation libraries when choreography matters, shaders when nothing else will do.',
  },
  {
    name: 'State & data',
    tools: ['Redux Toolkit', 'Zustand', 'Supabase', 'REST', 'i18next'],
    why: 'The smallest store that works, and data kept close to where it is used.',
  },
  {
    name: 'Quality',
    tools: ['Vitest', 'Testing Library', 'Playwright', 'ESLint · Prettier', 'GitHub Actions'],
    why: 'Tests where bugs would hurt, lint everywhere, and a pipeline that ships on every push.',
  },
]

export function Toolkit() {
  return (
    <section id="toolkit" className="toolkit" aria-labelledby="toolkit-title">
      <div className="wrap toolkit__grid">
        <h2 id="toolkit-title" className="section-title">
          Toolkit
        </h2>
        <div className="toolkit__groups">
          {GROUPS.map((g) => (
            <div key={g.name} className="toolkit__group">
              <h3 className="toolkit__name">{g.name}</h3>
              <ul className="toolkit__tools">
                {g.tools.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p className="toolkit__why">{g.why}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
