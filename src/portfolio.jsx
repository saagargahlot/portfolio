import React, { useEffect, useState } from 'react';
import CaptainMapScene from './CaptainMapScene.jsx';

const navSections = ['home', 'about', 'fluctra', 'experience', 'skills', 'projects', 'contact'];

const routeSections = [
  { id: 'home', label: 'Home', x: -6.2, z: 3.4 },
  { id: 'about', label: 'About', x: -4.3, z: 1.2 },
  { id: 'fluctra', label: 'Fluctra', x: -1.7, z: -0.45 },
  { id: 'experience', label: 'Experience', x: 0.9, z: -1.65 },
  { id: 'skills', label: 'Skills', x: 3.1, z: -0.2 },
  { id: 'projects', label: 'Projects', x: 5.1, z: -2.25 },
  { id: 'contact', label: 'Contact', x: 6.35, z: 1.65 },
];

const allProjects = [
  {
    image: '/photo/fluctra.png',
    title: 'Fluctra',
    description: 'Daily pattern puzzle game live at fluctra.com. Players race to find the hidden pattern before the grid morphs, with 8 second rounds, 6 pattern types, daily challenges, real time battles, and a global leaderboard. Built solo end to end: web client, Supabase backend, Stripe and PayPal payments, plus an in-progress SwiftUI iOS port.',
    tags: ['JavaScript', 'SwiftUI', 'Supabase', 'PostgreSQL', 'Stripe', 'PayPal', 'Vercel'],
    link: 'https://fluctra.com',
    linkLabel: 'Play Live',
  },
  {
    image: '/photo/dungeon-break.webp',
    title: 'Dungeon Break',
    description: 'Solo-developed iOS RPG from concept to App Store launch in Swift and SpriteKit. Achieved 150+ downloads in the first release window, then shipped a full v1.2 update within two weeks based on live analytics. Combat system supports hero rarity levels, skill trees, and distinct dungeon zones.',
    tags: ['Swift', 'SpriteKit', 'Xcode', 'iOS', 'Game Development'],
    link: null,
  },
  {
    image: '/photo/moviezilla.webp',
    title: 'Moviezilla',
    description: 'Movie favorites management application with user authentication, CRUD operations, and admin controls. Users can search movies, curate favorites lists, while administrators manage user accounts.',
    tags: ['Node.js', 'Express', 'MongoDB', 'Mongoose', 'Pug', 'JavaScript'],
    link: 'https://github.com/saagargahlot/proj-moviezilla',
  },
  {
    image: '/photo/chat-server.png',
    title: 'Real-Time Chat Server',
    description: 'Architected a WebSocket server handling public, group, and private channels with low-latency bidirectional communication. Designed room-based namespacing and connection state management for clean isolation of message streams across concurrent users.',
    tags: ['Node.js', 'Socket.io', 'JavaScript', 'Real-time Communication'],
    link: 'https://github.com/saagargahlot/proj-chat-server',
  },
  {
    image: '/photo/ecommerce.webp',
    title: 'Streetwear E-Commerce Store',
    description: 'Built a dynamic product page with item filtering, cart management across components using React hooks, and a multi-step checkout flow. Structured global state to keep the cart accurate during navigation without relying on a backend.',
    tags: ['React.js', 'CSS3', 'JavaScript', 'E-commerce'],
    link: 'https://github.com/saagargahlot/saagars-clothing',
  },
  {
    image: '/photo/garden.png',
    title: 'Memory Garden',
    description: 'Procedural garden game where your movement patterns create unique flowers. Features timelapse recording, screenshot export, and dynamic flower generation based on gameplay.',
    tags: ['Python', 'Pygame', 'Procedural Generation', 'Game Development'],
    link: 'https://github.com/saagargahlot/memory-garden',
  },
  {
    image: '/photo/racer-game.png',
    title: 'Highway Racer',
    description: 'Fast-paced arcade racing game with Survival and Race modes. Features 10 car customization options, smart AI opponents, smooth lane-changing mechanics, and progressive difficulty.',
    tags: ['Python', 'Pygame', 'Game Development', 'AI'],
    link: 'https://github.com/saagargahlot/racing-game',
  },
  {
    image: '/photo/pacman.png',
    title: 'Pac-Man Arcade Game',
    description: 'Faithful recreation of the classic arcade game with authentic ghost AI, progressive difficulty, and high score persistence. Features custom game loop, collision detection, and responsive HUD.',
    tags: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Game Development'],
    link: 'https://github.com/saagargahlot/Pac-Man-Arcade-Game',
  },
  {
    image: '/photo/2048-game.png',
    title: '2048 Game',
    description: 'Classic 2048 puzzle game implementation with smooth animations and responsive design. Built to practice game logic and state management with modern TypeScript.',
    tags: ['TypeScript', 'React', 'Zustand', 'Game Development', 'State Management'],
    link: 'https://github.com/saagargahlot/2048-game',
  },
];

const experienceItems = [
  {
    role: 'Indie iOS Developer',
    period: 'Feb 2026 – Present',
    bullets: [
      'Organized the complete App Store submission process, successfully launching Dungeon Break to 150+ downloads within its first release window.',
      'Iterated to v1.2 in under two weeks based on live user feedback.',
      'Independently owned the whole development lifecycle, operating the same as a full product team.',
    ],
  },
  {
    role: 'Data Annotation | Analyst',
    period: 'Sept 2025 – Jan 2026',
    bullets: [
      'Wrote code samples and reviewed technical content across numerous programming languages to support clients.',
      'Consistently met quality benchmarks and identified errors across high-volume task queues.',
    ],
  },
];

const skillCategories = [
  {
    title: 'Languages',
    skills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 'Rust', 'Swift', 'SQL', 'HTML/CSS', 'Haskell', 'Prolog'],
  },
  {
    title: 'Frontend',
    skills: ['React.js', 'HTML5', 'CSS3', 'Canvas API', 'Tailwind CSS', 'Responsive Design'],
  },
  {
    title: 'Backend',
    skills: ['Node.js', 'Express.js', 'RESTful APIs', 'PostgreSQL', 'MongoDB', 'SQLite', 'Supabase', 'Stripe', 'PayPal', 'Google OAuth', 'Socket.io', 'Spotify API', 'Docker'],
  },
  {
    title: 'Tools',
    skills: ['Git/GitHub', 'Claude Code', 'Pygame', 'UML', 'Design Patterns', 'QT Framework', 'Linux', 'AWS', 'Agile Development', 'Xcode'],
  },
];

const contactItems = [
  { title: 'Email', value: 'saagargahlot@gmail.com', link: 'mailto:saagargahlot@gmail.com' },
  { title: 'GitHub', value: '@saagargahlot', link: 'https://github.com/saagargahlot' },
  { title: 'LinkedIn', value: '/in/saagar-gahlot', link: 'https://www.linkedin.com/in/saagar-gahlot/' },
];

const ProjectCard = ({ project, compact = false }) => (
  <article className="project-card">
    <div className="project-image">
      <img src={project.image} alt={project.title} loading="lazy" />
    </div>
    <div className="project-body">
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="tag-row">
        {(compact ? project.tags.slice(0, 3) : project.tags).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      {project.link && (
        <a className="project-link" href={project.link} target="_blank" rel="noopener noreferrer">
          {project.linkLabel || 'View Code'}
        </a>
      )}
    </div>
  </article>
);

const Portfolio = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let frame = 0;

    const updateActiveSection = () => {
      frame = 0;
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      if (isAtBottom) {
        setActiveSection((current) => current === 'contact' ? current : 'contact');
        return;
      }

      const viewportMiddle = window.scrollY + window.innerHeight / 2;
      let nextSection = 'home';
      let minDistance = Infinity;

      navSections.forEach((section) => {
        const element = document.getElementById(section);
        if (!element) return;

        const sectionMiddle = element.offsetTop + element.offsetHeight / 2;
        const distance = Math.abs(viewportMiddle - sectionMiddle);
        if (distance < minDistance) {
          minDistance = distance;
          nextSection = section;
        }
      });

      setActiveSection((current) => current === nextSection ? current : nextSection);
    };

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToSection = (sectionId, event) => {
    if (event) event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const featuredProjects = allProjects.slice(0, 3);
  const compactProjects = allProjects.slice(3);

  return (
    <div className="site-shell">
      <nav className="top-nav" aria-label="Primary navigation">
        <div className="top-nav-inner">
          <a className="brand-mark" href="#home" onClick={(event) => scrollToSection('home', event)}>
            Saagar Gahlot
          </a>
          <div className="nav-links">
            {navSections.map((section) => (
              <a
                key={section}
                className={`nav-link ${activeSection === section ? 'is-active' : ''}`}
                href={`#${section}`}
                onClick={(event) => scrollToSection(section, event)}
              >
                {section}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <main>
        <section id="home" className="map-hero">
          <div className="hero-copy">
            <div className="status-row">
              <span className="status-pill">Available for opportunities!</span>
              <span className="status-pill">Based in Alberta</span>
            </div>
            <p className="hero-kicker">Developer</p>
            <h1 className="hero-title">Saagar Gahlot</h1>
            <p className="hero-role">Full-Stack Developer &amp; iOS Developer</p>
            <p className="hero-summary">
              Computer Science graduate from Carleton University. I build exceptional digital experiences
              spanning full-stack web apps to shipped iOS games on the App Store.
              Passionate about clean code and user-focused solutions.
            </p>
            <div className="hero-actions">
              <button className="primary-action" type="button" onClick={(event) => scrollToSection('projects', event)}>
                My Projects
              </button>
              <button className="secondary-action" type="button" onClick={(event) => scrollToSection('contact', event)}>
                Contact Me
              </button>
            </div>
          </div>

          <div className="captain-map-wrap">
            <CaptainMapScene
              sections={routeSections}
              activeSection={activeSection}
              onNavigate={scrollToSection}
              isMobile={isMobile}
            />
            <div className="map-caption">
              <span>Captain's map</span>
              <span>Click a route marker</span>
            </div>
          </div>
        </section>

        <section id="about" className="section-band">
          <div className="glass-panel">
            <h2 className="section-title">ABOUT ME</h2>
            <div className="two-column">
              <div className="body-copy">
                <p>
                  Hello. I'm a developer who is passionate about creating things that live on the internet.
                  My journey in the coding space began with curiosity, which led me to build a simple McDonald's kiosk.
                  I then wanted to learn more and more about different languages and their respective purposes.
                </p>
                <p>
                  Fast-forward to today, I am a graduate of Carleton University with a Major Degree in Computer Science and
                  have had the privilege of working on diverse projects ranging from responsive websites to complex applications.
                  My focus is on building accessible, performant digital experiences.
                </p>
                <p>
                  When I'm not coding, I'm exploring new technologies, contributing to open-source projects, or working on personal projects to sharpen my skills.
                  I am always looking to get better and learn more.
                </p>
              </div>
              <div className="portrait-frame">
                <img src="/photo/me.webp" alt="Saagar Gahlot" loading="eager" />
              </div>
            </div>
          </div>
        </section>

        <section id="fluctra" className="section-band">
          <div className="glass-panel feature-panel">
            <span className="section-label">FEATURED WORK</span>
            <h2 className="section-title">FLUCTRA</h2>
            <div className="feature-grid">
              <div className="body-copy">
                <p>
                  Fluctra is a daily pattern puzzle game I designed, built, and operate solo,
                  live at fluctra.com. Players race to find the hidden pattern before the grid
                  morphs, with 8 second rounds, 6 pattern types, daily challenges, real time
                  battle mode, and a global leaderboard.
                </p>
                <p>
                  I own the full product: game design, frontend, backend, payments, and
                  deployment. The web client runs on Vercel with Supabase powering accounts
                  and leaderboards, and Stripe and PayPal handling in-game purchases. A native
                  iOS version built in SwiftUI is in active development with full unit and UI
                  test coverage.
                </p>
                <ul className="clean-list">
                  <li>Live product with real players, payments, and daily content</li>
                  <li>Real time multiplayer battle mode and global leaderboards</li>
                  <li>Secure serverless payment APIs for Stripe and PayPal</li>
                  <li>SwiftUI iOS port sharing one design across web and mobile</li>
                </ul>
                <div className="tag-row">
                  {['JavaScript', 'SwiftUI', 'Supabase', 'PostgreSQL', 'Stripe', 'PayPal', 'Google OAuth', 'Vercel', 'Node.js'].map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <a className="primary-action" href="https://fluctra.com" target="_blank" rel="noopener noreferrer">
                  Play Fluctra
                </a>
              </div>
              <div className="media-frame">
                <img src="/photo/fluctra.png" alt="Fluctra gameplay preview" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="section-band">
          <div className="glass-panel">
            <h2 className="section-title">EXPERIENCE</h2>
            <div className="logbook-list">
              {experienceItems.map((job) => (
                <article className="logbook-entry" key={job.role}>
                  <div className="entry-head">
                    <h3>{job.role}</h3>
                    <span>{job.period}</span>
                  </div>
                  <ul className="clean-list">
                    {job.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="skills" className="section-band">
          <div className="glass-panel">
            <h2 className="section-title">MY SKILLS</h2>
            <div className="skill-grid">
              {skillCategories.map((category) => (
                <article className="skill-card" key={category.title}>
                  <h3>{category.title}</h3>
                  <div className="skill-tags">
                    {category.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="section-band">
          <div className="glass-panel">
            <h2 className="section-title">MY PROJECTS</h2>
            <div className="project-harbor">
              {featuredProjects.map((project) => (
                <ProjectCard project={project} key={project.title} />
              ))}
            </div>

            {showAllProjects && (
              <div className="project-harbor compact-harbor">
                {compactProjects.map((project) => (
                  <ProjectCard project={project} compact key={project.title} />
                ))}
              </div>
            )}

            {compactProjects.length > 0 && (
              <div className="project-toggle">
                <button
                  className="secondary-action"
                  type="button"
                  onClick={() => setShowAllProjects((current) => !current)}
                >
                  {showAllProjects ? 'Show Less' : `View More Projects (${compactProjects.length} more)`}
                </button>
              </div>
            )}
          </div>
        </section>

        <section id="contact" className="section-band">
          <div className="glass-panel">
            <span className="section-label">CONTACT ME!</span>
            <h2 className="section-title">Let's Work Together!</h2>
            <p className="body-copy">
              I am always interested in hearing about new projects and opportunities.
              Whether you have a question or just want to say hi, please feel free to reach out!
            </p>
            <div className="contact-harbor">
              {contactItems.map((contact) => (
                <a className="contact-card" href={contact.link} target="_blank" rel="noopener noreferrer" key={contact.title}>
                  <h3>{contact.title}</h3>
                  <p>{contact.value}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>© 2026 Saagar Gahlot</p>
        <p>Built with React and Pure Passion 💙</p>
      </footer>
    </div>
  );
};

export default Portfolio;
