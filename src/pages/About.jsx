import { useContext } from 'react'
import { AppContext } from '../context/AppContext.jsx'

function About() {
  const { t } = useContext(AppContext)

  return (
    <div className="landing-section">
      <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ color: 'var(--text)' }}>{t('aboutHeading')}</h1>
        <p className="mt-16" style={{ lineHeight: 1.7 }}>
          {t('aboutText1')}
        </p>
        <p className="mt-16 text-muted" style={{ lineHeight: 1.7 }}>
          {t('aboutText2')}
        </p>
      </div>
    </div>
  )
}

export default About
