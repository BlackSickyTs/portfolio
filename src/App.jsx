import { useState, useEffect, useRef, useCallback } from 'react'
import FloatingLines from './components/FloatingLines'

/* ---------- main app ---------- */
export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true))
  }, [])

  /* loader */
  useEffect(() => {
    if (!fontsReady) return
    const t = setTimeout(() => setLoaded(true), 1800)
    return () => clearTimeout(t)
  }, [fontsReady])

  /* cursor */
  const cursorDot = useRef(null)
  const cursorRing = useRef(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const dot = cursorDot.current
    const ring = cursorRing.current
    if (!dot || !ring) return

    const handleMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      dot.style.left = e.clientX + 'px'
      dot.style.top = e.clientY + 'px'
    }
    const handleLeave = () => { dot.style.opacity = '0'; ring.style.opacity = '0' }
    const handleEnter = () => { dot.style.opacity = '1'; ring.style.opacity = '1' }
    const handleDown = () => ring.classList.add('click')
    const handleUp = () => ring.classList.remove('click')

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseleave', handleLeave)
    document.addEventListener('mouseenter', handleEnter)
    document.addEventListener('mousedown', handleDown)
    document.addEventListener('mouseup', handleUp)

    const animate = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.12
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.12
      ring.style.left = ringPos.current.x + 'px'
      ring.style.top = ringPos.current.y + 'px'
      raf = requestAnimationFrame(animate)
    }
    let raf = requestAnimationFrame(animate)

    document.querySelectorAll('a, button, .hover-trigger').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'))
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'))
    })

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', handleLeave)
      document.removeEventListener('mouseenter', handleEnter)
      document.removeEventListener('mousedown', handleDown)
      document.removeEventListener('mouseup', handleUp)
    }
  }, [loaded])

  /* nav scroll */
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  /* mobile menu */
  const [menuOpen, setMenuOpen] = useState(false)

  /* card mouse tracking */
  const handleCardMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    e.currentTarget.style.setProperty('--mx', x + '%')
    e.currentTarget.style.setProperty('--my', y + '%')
  }, [])

  if (!fontsReady || !loaded) {
    return (
      <div className="loader" style={{
        position:'fixed',inset:0,zIndex:99998,background:'#07070a',
        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
        fontFamily:'"Space Grotesk",sans-serif',color:'#6b6b7a'
      }}>
        <div style={{width:280,position:'relative'}}>
          {[60,80,100,70,45].map((w,i) => (
            <div key={i} style={{
              height:1,background:'linear-gradient(90deg,transparent,#818cf8,transparent)',
              width:w+'%',marginBottom:6,transformOrigin:'center'
            }} className="loader-line" />
          ))}
        </div>
        <div style={{fontSize:11,letterSpacing:2,marginTop:20,minHeight:20}}>
          <LoaderMsg /><span style={{animation:'blink 1s step-end infinite'}}>_</span>
        </div>
        <div style={{width:280,height:1,background:'rgba(255,255,255,0.05)',marginTop:12,borderRadius:2,overflow:'hidden'}}>
          <div id="loaderProgress" style={{height:'100%',width:'0%',background:'linear-gradient(90deg,#818cf8,#a855f7)',borderRadius:2}} />
        </div>
        <div style={{fontSize:11,color:'#6b6b7a',marginTop:8,letterSpacing:1}} id="loaderPercent">0%</div>
        <style>{`
          @keyframes blink { 50% { opacity: 0 } }
          .loader-line { animation: lineReveal .4s ease forwards; opacity: 0; }
          @keyframes lineReveal { to { opacity: 1; transform: scaleX(1); } }
        `}</style>
      </div>
    )
  }

  return (
    <>
      {/* cursor */}
      <div ref={cursorDot} className="cursor cursor-dot" />
      <div ref={cursorRing} className="cursor cursor-ring" />

      {/* floating lines background */}
      <div className="bg-lines">
        <FloatingLines
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[8, 12, 16]}
          lineDistance={[6, 4, 3]}
          bendRadius={4.0}
          bendStrength={-0.4}
          animationSpeed={0.6}
          interactive={true}
          parallax={true}
          parallaxStrength={0.15}
          linesGradient={['#1a1a2e', '#16213e', '#0f3460', '#818cf8', '#a855f7']}
          mixBlendMode="screen"
        />
      </div>

      {/* background darkening overlay */}
      <div className="bg-overlay" />

      {/* noise */}
      <div className="noise" />

      {/* nav */}
      <nav className={scrolled ? 'scrolled' : ''}>
        <div className="container nav-inner">
          <div className="logo">DAIMOS.</div>
          <button className={'hamburger' + (menuOpen ? ' active' : '')} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
          <ul className={'nav-links' + (menuOpen ? ' open' : '')}>
            <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
            <li><a href="#projects" onClick={() => setMenuOpen(false)}>Projects</a></li>
            <li><a href="#skills" onClick={() => setMenuOpen(false)}>Skills</a></li>
            <li><a href="#contact" className="nav-cta" onClick={() => setMenuOpen(false)}>Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* hero */}
      <section className="hero" id="home">
        <div className="hero-glare" />
        <div className="container hero-content">
          <div className="hero-content-left">
            <div className="hero-badge"><span className="dot" />BUILDING THE FUTURE</div>
            <h1 className="hero-title">
              <span className="line">
                <span className="gradient">DAIMOS</span>
              </span>
              <span className="line">
                <span className="gradient">PORTFOLIO</span>
              </span>
            </h1>
            <p className="hero-desc">Full-stack developer & AI architect building systems that power the next generation of digital experiences.</p>
            <div className="hero-actions">
              <a href="#projects" className="btn btn-primary hover-trigger">
                View Work
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                <div className="btn-glow" />
              </a>
              <a href="#contact" className="btn btn-glass hover-trigger">
                Let's Talk
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </a>
            </div>
          </div>
          <div className="hero-content-right">
            <div className="hero-pfp">
              <div className="ring" /><div className="ring" />
              <img src="/daimo.jpg" alt="Daimos" />
              <div className="hero-pfp-status" />
            </div>
            <div className="hero-username">
              <svg width="18" height="14" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="12" y2="13"/><line x1="8" y1="5" x2="14" y2="5"/></svg>
              <span style={{background:'linear-gradient(135deg,#818cf8,#ec4899)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',fontWeight:700,fontFamily:'"Space Grotesk",sans-serif',fontSize:14}}>wasted__35</span>
              <span className="tag">⚡ live</span>
            </div>
          </div>
        </div>
        <div className="hero-scroll">
          <span className="hero-scroll-text">Scroll</span>
          <div className="hero-scroll-line" />
        </div>
      </section>

      {/* about */}
      <section id="about">
        <div className="container">
          <span className="section-label">— About</span>
            <h2 className="section-title">Architect of<br />Digital Systems</h2>
          <p className="section-sub">Full-stack engineer crafting high-performance products — from AI conversations to game infrastructure.</p>
          <div className="about-grid">
            <div className="about-text">
              <p>I'm Daimos — a developer who doesn't just write code but builds <strong>complete digital ecosystems</strong>. From AI-powered chat platforms with deep research capabilities to premium game server hosting across UAE and India, every project I touch is driven by <strong>precision, performance, and purpose</strong>.</p>
              <p>I work across the entire stack — frontend, backend, infrastructure, and AI — blending <strong>technical depth</strong> with an obsessive eye for <strong>user experience</strong>. Whether it's a client portal handling invoices or a neural interface generating images, I ship products that feel as good as they perform.</p>
            </div>
            <div className="stats-grid">
              <div className="stat-card hover-trigger" onMouseMove={handleCardMove}><div className="stat-number">03</div><div className="stat-label">Projects Shipped</div></div>
              <div className="stat-card hover-trigger" onMouseMove={handleCardMove}><div className="stat-number">∞</div><div className="stat-label">AI Integrations</div></div>
              <div className="stat-card hover-trigger" onMouseMove={handleCardMove}><div className="stat-number">24/7</div><div className="stat-label">Infrastructure Live</div></div>
              <div className="stat-card hover-trigger" onMouseMove={handleCardMove}><div className="stat-number">100%</div><div className="stat-label">Code Quality</div></div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* projects */}
      <section id="projects" className="projects">
        <div className="container">
          <span className="section-label">— Work</span>
          <h2 className="section-title">
            Selected Projects
          </h2>
          <p className="section-sub">Real products. Real users. Built from the ground up.</p>
          <div className="projects-grid">
            {[
              { num:'01', name:'Elenkify', desc:'Client portal built for modern agencies — managing projects, invoices, and team communication in one streamlined dashboard.', tags:['React','Dashboard','Portal'], url:'https://elenkify-portal.vercel.app/' },
              { num:'02', name:'Anthropod AI', desc:'Next-gen conversational AI platform — deep research, stunning image generation, and intelligent chat, all in one interface.', tags:['AI','LLM','Chat'], url:'https://xi-ics-8.vercel.app/' },
              { num:'03', name:'RaveNodes', desc:'Premium hosting platform built for communities — high-performance servers with instant deploy, Discord integration, and seamless checkout.', tags:['Hosting','Community','Infrastructure'], url:'https://ravenodes.vercel.app/' },
              { num:'04', name:'GraceNodes', desc:'Premium game server hosting — instant Minecraft & VPS deploy in UAE and India with Discord-first support and smooth PKR/USD checkout.', tags:['Hosting','Minecraft','VPS'], url:'https://grace-nodes-hosting.vercel.app/' },
            ].map((p,i) => (
              <div key={i} className="project-card hover-trigger" onMouseMove={handleCardMove}>
                <div className="glow" />
                <div className="project-num">{p.num}</div>
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
                <div className="project-tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div>
                <a href={p.url} target="_blank" rel="noopener" className="project-link">
                  Live Demo
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* skills */}
      <section id="skills">
        <div className="container">
          <span className="section-label">— Stack</span>
            <h2 className="section-title">Tools & Technologies</h2>
          <p className="section-sub">The core systems I work with to build, deploy, and scale.</p>
          <div className="skills-grid">
            {[
              { icon:'⚛️', name:'React' },
              { icon:'🔷', name:'TypeScript' },
              { icon:'🟢', name:'Node.js' },
              { icon:'🐍', name:'Python' },
              { icon:'🧠', name:'AI / LLMs' },
              { icon:'☁️', name:'Cloud' },
              { icon:'🗄️', name:'MongoDB' },
              { icon:'▲', name:'Vercel' },
              { icon:'🎨', name:'Tailwind' },
              { icon:'🐳', name:'Docker' },
            ].map(({icon, name}) => (
                <div key={name} className="skill-item hover-trigger" onMouseMove={handleCardMove}>
                  <span className="skill-icon">{icon}</span>
                  <div className="skill-name">{name}</div>
                </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* contact */}
      <section id="contact" className="contact-wrap">
        <div className="container">
          <span className="section-label">— Connect</span>
          <h2 className="section-title">
            Start Something
          </h2>
          <p className="section-sub" style={{margin:'0 auto'}}>Have a project, idea, or collaboration? Let's build.</p>
          <div className="contact-card">
            <h3>Get In Touch</h3>
            <p>I'm open to opportunities, collaborations, and interesting challenges.</p>
            <div className="contact-links">
              <a href="mailto:daimos@example.com" className="contact-link hover-trigger">
                <span className="link-icon">✉️</span>
                daimos@example.com
              </a>
              <a href="https://github.com/daimos" target="_blank" rel="noopener" className="contact-link hover-trigger">
                <span className="link-icon">🐙</span>
                github.com/daimos
              </a>
              <a href="https://linkedin.com/in/daimos" target="_blank" rel="noopener" className="contact-link hover-trigger">
                <span className="link-icon">💼</span>
                linkedin.com/in/daimos
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container footer-inner">
          <p>&copy; 2026 Daimos</p>
          <div className="footer-links">
            <a href="#home">Top</a>
            <a href="#projects">Work</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>

      <style>{`
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        :root{
          --bg:#07070a;--surface:rgba(255,255,255,0.03);--border:rgba(255,255,255,0.06);
          --text:#e8e8ed;--muted:#6b6b7a;--accent:#818cf8;--accent2:#a855f7;--accent3:#ec4899;
          --radius:20px;--glass:rgba(255,255,255,0.03)
        }
        html{scroll-behavior:smooth}
        body{
          font-family:'Cormorant Garamond',serif;
          background:var(--bg);color:var(--text);line-height:1.65;font-weight:400;font-size:17px;
          overflow-x:hidden;cursor:none
        }

        /* cursor */
        .cursor{position:fixed;top:0;left:0;z-index:99999;pointer-events:none;transform:translate(-50%,-50%);transition:width .3s,height .3s,background .3s,border-color .3s}
        .cursor-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 20px rgba(129,140,248,.4)}
        .cursor-ring{width:40px;height:40px;border-radius:50%;border:1.5px solid rgba(129,140,248,.3);transition:width .4s cubic-bezier(.25,.46,.45,.94),height .4s cubic-bezier(.25,.46,.45,.94),border-color .3s,background .3s}
        .cursor-ring.hover{width:60px;height:60px;border-color:rgba(129,140,248,.5);background:rgba(129,140,248,.06)}
        .cursor-ring.click{width:30px;height:30px;border-color:rgba(129,140,248,.6);background:rgba(129,140,248,.1)}

        /* noise */
        .bg-lines{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.65}
        .bg-lines canvas{width:100%!important;height:100%!important}
        .bg-overlay{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(ellipse at center,transparent 30%,rgba(7,7,10,.85) 100%)}
        .noise{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.025;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-repeat:repeat;background-size:256px 256px}

        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:var(--bg)}
        ::-webkit-scrollbar-thumb{background:var(--accent);border-radius:2px}

        .container{max-width:1200px;margin:0 auto;padding:0 32px}
        section{position:relative;padding:120px 0;z-index:2}

        /* nav */
        nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:20px 0;transition:all .5s cubic-bezier(.25,.46,.45,.94)}
        nav.scrolled{background:rgba(7,7,10,.75);backdrop-filter:blur(40px) saturate(1.2);-webkit-backdrop-filter:blur(40px) saturate(1.2);border-bottom:1px solid rgba(255,255,255,.04);padding:12px 0}
        .nav-inner{display:flex;align-items:center;justify-content:space-between}
        .logo{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;letter-spacing:1px;background:linear-gradient(135deg,#fff 30%,var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .nav-links{display:flex;gap:40px;list-style:none;align-items:center}
        .nav-links a{color:var(--muted);text-decoration:none;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;transition:color .3s;position:relative}
        .nav-links a:hover{color:var(--text)}
        .nav-links a::after{content:'';position:absolute;bottom:-6px;left:0;width:0;height:1.5px;background:linear-gradient(90deg,var(--accent),var(--accent2));transition:width .4s cubic-bezier(.25,.46,.45,.94)}
        .nav-links a:hover::after{width:100%}
        .nav-cta{padding:10px 24px;border-radius:100px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff!important;font-weight:600!important;text-transform:uppercase!important;letter-spacing:1px!important;font-size:11px!important;box-shadow:0 4px 24px rgba(129,140,248,.2);transition:all .3s!important}
        .nav-cta:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(129,140,248,.35)!important;color:#fff!important}
        .nav-cta::after{display:none!important}
        .hamburger{display:none;flex-direction:column;cursor:pointer;background:none;border:none;padding:4px;z-index:101;gap:5px}
        .hamburger span{display:block;width:24px;height:2px;background:var(--text);border-radius:2px;transition:all .3s}

        /* hero */
        .hero{min-height:100vh;display:flex;align-items:center;position:relative;overflow:hidden}
        .hero-content{position:relative;z-index:2;width:100%;display:flex;align-items:center;justify-content:space-between;gap:60px}
        .hero-content-left{flex:1}
        .hero-content-right{flex-shrink:0;display:flex;flex-direction:column;align-items:center}
        .hero-pfp{width:220px;height:220px;border-radius:50%;position:relative;animation:pfp-float 4s ease-in-out infinite;box-shadow:0 0 40px rgba(129,140,248,.15),0 0 80px rgba(129,140,248,.05)}
        .hero-pfp img{width:100%;height:100%;border-radius:50%;object-fit:cover;border:3px solid rgba(129,140,248,.3);display:block}
        .hero-pfp .ring{position:absolute;inset:-6px;border-radius:50%;border:1.5px solid rgba(129,140,248,.15);animation:pfp-ring 3s ease-in-out infinite}
        .hero-pfp .ring:nth-child(2){inset:-14px;animation-delay:.5s;border-color:rgba(168,85,247,.1)}
        @keyframes pfp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        @keyframes pfp-ring{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.05);opacity:1}}
        .hero-pfp-status{width:18px;height:18px;border-radius:50%;background:#22c55e;border:3px solid var(--bg);position:absolute;bottom:12px;right:12px;z-index:3;box-shadow:0 0 12px rgba(34,197,94,.4);animation:pulse-dot 2s infinite}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 20px;border-radius:100px;border:1px solid rgba(129,140,248,.15);background:rgba(129,140,248,.06);font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;color:var(--accent);margin-bottom:32px;backdrop-filter:blur(10px)}
        .hero-badge .dot{width:6px;height:6px;border-radius:50%;background:#22c55e;display:inline-block;animation:pulse-dot 2s infinite}
        @keyframes pulse-dot{0%,100%{opacity:1;box-shadow:0 0 8px rgba(34,197,94,.4)}50%{opacity:.3;box-shadow:0 0 0 rgba(34,197,94,0)}}
        .hero-title{font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(64px,10vw,140px);line-height:.88;letter-spacing:-1px;margin-bottom:8px;overflow:hidden}
        .hero-title .line{display:block}
        .hero-title .gradient{display:inline-block;background:linear-gradient(135deg,var(--accent),var(--accent2),var(--accent3));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 30px rgba(0,0,0,.8))}
        .hero-desc{font-family:'Cormorant Garamond',serif;font-size:clamp(18px,1.6vw,24px);color:#b0b0c0;max-width:540px;line-height:1.7;margin:24px 0 48px;font-weight:300;font-style:italic;text-shadow:0 0 20px rgba(0,0,0,.7)}
        .hero-actions{display:flex;gap:16px;flex-wrap:wrap}
        .btn{position:relative;display:inline-flex;align-items:center;gap:10px;padding:16px 36px;border-radius:12px;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;text-decoration:none;letter-spacing:.5px;border:none;cursor:none;overflow:hidden;transition:all .35s cubic-bezier(.25,.46,.45,.94)}
        .btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;box-shadow:0 4px 24px rgba(129,140,248,.2)}
        .btn-primary:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 12px 40px rgba(129,140,248,.35)}
        .btn-primary .btn-glow{position:absolute;inset:0;border-radius:12px;background:linear-gradient(135deg,var(--accent2),var(--accent3));opacity:0;transition:opacity .4s;z-index:-1}
        .btn-primary:hover .btn-glow{opacity:1}
        .btn-glass{background:var(--glass);backdrop-filter:blur(20px);border:1px solid var(--border);color:var(--text)}
        .btn-glass:hover{background:rgba(255,255,255,.06);border-color:rgba(129,140,248,.2);transform:translateY(-3px)}
        .hero-scroll{position:absolute;bottom:48px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:12px}
        .hero-scroll-text{font-family:'Space Grotesk',sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:var(--muted)}
        .hero-scroll-line{width:1px;height:40px;background:linear-gradient(180deg,var(--muted),transparent);animation:scroll-line 2s ease-in-out infinite}
        @keyframes scroll-line{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}50.1%{transform:scaleY(1);transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
        .hero-glare{position:absolute;top:-40%;right:-20%;width:600px;height:600px;background:radial-gradient(circle,rgba(129,140,248,.08),transparent 70%);pointer-events:none;z-index:1}

        .hero-username{font-family:'Space Grotesk',sans-serif;font-size:13px;letter-spacing:1px;color:var(--muted);margin-top:20px;display:flex;align-items:center;gap:8px}
        .hero-username .tag{padding:3px 10px;border-radius:6px;background:rgba(129,140,248,.08);color:var(--accent);font-size:10px;letter-spacing:.5px;font-weight:600}

        /* section headers */
        .section-label{font-family:'Space Grotesk',sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:var(--accent);margin-bottom:12px;font-weight:500}
        .section-title{font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(48px,5.5vw,88px);line-height:.92;letter-spacing:-.5px;margin-bottom:20px;text-shadow:0 0 30px rgba(0,0,0,.6)}
        .section-sub{font-family:'Cormorant Garamond',serif;font-size:clamp(17px,1.4vw,22px);color:#b0b0c0;max-width:500px;font-weight:300;font-style:italic;line-height:1.7;text-shadow:0 0 15px rgba(0,0,0,.5)}

        /* about */
        .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;margin-top:56px}
        .about-text p{color:#b0b0c0;font-size:18px;line-height:1.8;margin-bottom:20px;font-weight:300;text-shadow:0 0 12px rgba(0,0,0,.4)}
        .about-text p strong{color:#fff;font-weight:500}
        .stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .stat-card{background:var(--glass);border:1px solid var(--border);border-radius:var(--radius);padding:28px;text-align:center;backdrop-filter:blur(20px);transition:all .4s cubic-bezier(.25,.46,.45,.94);position:relative;overflow:hidden}
        .stat-card:hover{border-color:rgba(129,140,248,.15);transform:translateY(-4px)}
        .stat-card::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(129,140,248,.06),transparent 60%);opacity:0;transition:opacity .4s}
        .stat-card:hover::before{opacity:1}
        .stat-number{font-family:'Playfair Display',serif;font-size:52px;font-weight:700;line-height:1;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .stat-label{font-family:'Space Grotesk',sans-serif;font-size:11px;color:var(--muted);margin-top:8px;letter-spacing:1.5px;text-transform:uppercase;font-weight:500}

        /* projects */
        .projects{background:linear-gradient(180deg,transparent,rgba(129,140,248,.015),transparent)}
        .projects-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:56px}
        .project-card{background:var(--glass);border:1px solid var(--border);border-radius:var(--radius);padding:36px 32px;backdrop-filter:blur(20px);transition:all .5s cubic-bezier(.25,.46,.45,.94);position:relative;overflow:hidden;cursor:none}
        .project-card:hover{border-color:rgba(129,140,248,.15);transform:translateY(-8px);box-shadow:0 30px 60px rgba(0,0,0,.3)}
        .project-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--accent),var(--accent2),var(--accent3));transform:scaleX(0);transform-origin:left;transition:transform .6s cubic-bezier(.25,.46,.45,.94)}
        .project-card:hover::before{transform:scaleX(1)}
        .project-card .glow{position:absolute;top:-50%;right:-50%;width:200%;height:200%;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(129,140,248,.04),transparent 60%);pointer-events:none;opacity:0;transition:opacity .4s}
        .project-card:hover .glow{opacity:1}
        .project-num{font-family:'Space Grotesk',sans-serif;font-size:12px;letter-spacing:3px;color:var(--accent);margin-bottom:16px}
        .project-card h3{font-family:'Playfair Display',serif;font-weight:700;font-size:30px;letter-spacing:-.3px;margin-bottom:12px;line-height:1.1;text-shadow:0 0 15px rgba(0,0,0,.5)}
        .project-card p{color:#b0b0c0;font-family:'Cormorant Garamond',serif;font-size:17px;line-height:1.7;margin-bottom:24px;font-weight:300;text-shadow:0 0 10px rgba(0,0,0,.3)}
        .project-tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px}
        .project-tags span{padding:5px 14px;border-radius:100px;font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:500;letter-spacing:.5px;background:rgba(129,140,248,.08);color:var(--accent);border:1px solid rgba(129,140,248,.1)}
        .project-link{display:inline-flex;align-items:center;gap:8px;color:var(--accent);font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;text-decoration:none;transition:gap .4s;letter-spacing:.5px;text-transform:uppercase}
        .project-link:hover{gap:14px}
        .project-link svg{transition:transform .4s}
        .project-link:hover svg{transform:translateX(4px)}

        /* skills */
        .skills-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-top:56px}
        .skill-item{background:var(--glass);border:1px solid var(--border);border-radius:16px;padding:28px 16px;text-align:center;backdrop-filter:blur(20px);transition:all .4s cubic-bezier(.25,.46,.45,.94);cursor:none;position:relative;overflow:hidden}
        .skill-item:hover{border-color:rgba(129,140,248,.12);transform:translateY(-4px)}
        .skill-item::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(129,140,248,.05),transparent 60%);opacity:0;transition:opacity .4s}
        .skill-item:hover::before{opacity:1}
        .skill-icon{font-size:32px;margin-bottom:10px;display:block}
        .skill-name{font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;letter-spacing:.5px;text-transform:uppercase}

        /* contact */
        .contact-wrap{text-align:center}
        .contact-card{max-width:600px;margin:56px auto 0;background:var(--glass);border:1px solid var(--border);border-radius:var(--radius);padding:56px 48px;backdrop-filter:blur(20px);position:relative;overflow:hidden}
        .contact-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--accent),var(--accent2),var(--accent3))}
        .contact-card h3{font-family:'Playfair Display',serif;font-weight:700;font-size:32px;letter-spacing:-.3px;margin-bottom:8px}
        .contact-card p{color:var(--muted);font-family:'Cormorant Garamond',serif;font-size:18px;margin-bottom:36px;font-weight:300;font-style:italic}
        .contact-links{display:flex;flex-direction:column;gap:14px}
        .contact-link{display:flex;align-items:center;gap:14px;padding:16px 24px;border-radius:14px;background:rgba(255,255,255,.02);border:1px solid var(--border);text-decoration:none;color:var(--text);font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:400;transition:all .35s cubic-bezier(.25,.46,.45,.94);cursor:none}
        .contact-link:hover{border-color:rgba(129,140,248,.15);background:rgba(129,140,248,.04);transform:translateX(6px)}
        .contact-link .link-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(129,140,248,.08);font-size:16px}

        /* footer */
        footer{border-top:1px solid var(--border);padding:40px 0;position:relative;z-index:2}
        .footer-inner{display:flex;align-items:center;justify-content:space-between}
        footer p{color:var(--muted);font-family:'Space Grotesk',sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase}
        .footer-links{display:flex;gap:24px}
        .footer-links a{color:var(--muted);text-decoration:none;font-family:'Space Grotesk',sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;transition:color .3s}
        .footer-links a:hover{color:var(--text)}
        .divider{height:1px;background:linear-gradient(90deg,transparent,var(--border),transparent);margin:0 auto;max-width:80%}

        /* responsive */
        @media(max-width:1024px){
          .projects-grid{grid-template-columns:1fr 1fr}
          .skills-grid{grid-template-columns:repeat(4,1fr)}
        }
        @media(max-width:768px){
          .nav-links{display:none;position:fixed;top:0;right:0;bottom:0;width:300px;background:rgba(7,7,10,.97);backdrop-filter:blur(40px);flex-direction:column;padding:120px 48px;gap:28px;border-left:1px solid var(--border)}
          .nav-links.open{display:flex}
          .hamburger{display:flex}
          .hamburger.active span:nth-child(1){transform:rotate(45deg) translate(5px,5px)}
          .hamburger.active span:nth-child(2){opacity:0}
          .hamburger.active span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px)}
          .hero-content{flex-direction:column;text-align:center;gap:40px}
          .hero-content-right{order:-1;align-items:center}
          .hero-content-left{display:flex;flex-direction:column;align-items:center}
          .hero-actions{justify-content:center}
          .hero-pfp{width:160px;height:160px}
          .hero-title{font-size:clamp(56px,14vw,90px)}
          .about-grid{grid-template-columns:1fr;gap:48px}
          .projects-grid{grid-template-columns:1fr}
          .skills-grid{grid-template-columns:repeat(3,1fr)}
          .contact-card{padding:40px 24px}
          section{padding:80px 0}
          .container{padding:0 20px}
        }
        @media(max-width:480px){
          .hero-pfp{width:130px;height:130px}
          .hero-title{font-size:clamp(44px,18vw,64px)}
          .skills-grid{grid-template-columns:repeat(2,1fr)}
          .stats-grid{grid-template-columns:1fr}
          .footer-inner{flex-direction:column;gap:16px}
        }
        @media(prefers-reduced-motion:reduce){
          *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
        }
      `}</style>
    </>
  )
}

/* ---- loader message component ---- */
function LoaderMsg() {
  const [msg, setMsg] = useState('INITIALIZING SYSTEM')
  const messages = ['INITIALIZING SYSTEM','LOADING MODULES','CONFIGURING ENVIRONMENT','ESTABLISHING CONNECTION','READY']
  useEffect(() => {
    let p = 0
    const progress = document.getElementById('loaderProgress')
    const percent = document.getElementById('loaderPercent')
    const interval = setInterval(() => {
      p += 1
      if (p > 100) { clearInterval(interval); setMsg('SYSTEM READY'); return }
      if (progress) progress.style.width = p + '%'
      if (percent) percent.textContent = p + '%'
      const idx = Math.floor((p / 100) * (messages.length - 1))
      setMsg(messages[Math.min(idx, messages.length - 1)])
    }, 18)
    return () => clearInterval(interval)
  }, [])
  return <>{msg}</>
}


