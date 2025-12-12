import React, { useState, useEffect, useRef } from 'react';

const ScrollingBoat = ({ scrollPosition, scrollDirection }) => {
  const pathRef = useRef(null);
  const [boatPosition, setBoatPosition] = useState({ x: 0, y: 0, angle: 0 });
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const prevAngleRef = useRef(0);
  const scrollTimeoutRef = useRef(null);

  // Detect when user stops scrolling
  useEffect(() => {
    setIsIdle(false);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set new timeout - consider user "idle" after 1.5 seconds of no scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 1000);

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [scrollPosition]);

  useEffect(() => {
    if (pathRef.current) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = Math.min(scrollPosition / maxScroll, 1);
      setScrollPercentage(percentage);

      const pathLength = pathRef.current.getTotalLength();
      const point = pathRef.current.getPointAtLength(pathLength * percentage);

      // Use a larger lookahead for smoother angle calculation
      const nextPoint = pathRef.current.getPointAtLength(
        Math.min(pathLength * percentage + 20, pathLength)
      );

      let newAngle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);

      // Smooth angle transitions to prevent twirling
      const prevAngle = prevAngleRef.current;
      let angleDiff = newAngle - prevAngle;

      // Handle angle wrap-around (e.g., 359° to 1°)
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;

      // Interpolate angle for smoother rotation
      const smoothedAngle = prevAngle + angleDiff * 0.15;
      prevAngleRef.current = smoothedAngle;

      setBoatPosition({ x: point.x, y: point.y, angle: smoothedAngle });
    }
  }, [scrollPosition]);

  return (
    <>
      <style>{`
        @keyframes boatFloat {
          0%, 100% {
            transform: translate(-50%, -50%) rotate(${boatPosition.angle + 90}deg) translateY(0px) translateX(0px) rotate(-2deg);
          }
          25% {
            transform: translate(-50%, -50%) rotate(${boatPosition.angle + 90}deg) translateY(-8px) translateX(3px) rotate(1deg);
          }
          50% {
            transform: translate(-50%, -50%) rotate(${boatPosition.angle + 90}deg) translateY(-3px) translateX(-2px) rotate(2deg);
          }
          75% {
            transform: translate(-50%, -50%) rotate(${boatPosition.angle + 90}deg) translateY(-10px) translateX(1px) rotate(-1deg);
          }
        }
      `}</style>

      {/* Visible dotted path that curves around content */}
      <svg
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 100,
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(100, 255, 218, 0.8)" />
            <stop offset="100%" stopColor="rgba(100, 255, 218, 0.4)" />
          </linearGradient>
        </defs>

        {/* Path curves: left around About image, right between skills, left around projects, right to island */}
        <path
          ref={pathRef}
          d="M 5,8
             Q 10,12 11,18
             Q 12,24 18 25
             Q 55,15 55,34
             Q 50,40 45,50
             Q 40,50 34,48
             Q 34,60 35,70
             Q 30,85 50,85
             Q 53,88 67,88
             Q 65,25 65,18
             Q 65,15 80,28"
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="0.3"
          strokeDasharray="1,3"
          opacity="0"
        />
      </svg>

      {/* Boat following the path */}
      <img
        src="photo/boat.png"
        alt="Sailing boat"
        style={{
          position: 'fixed',
          left: `${boatPosition.x}%`,
          top: `${boatPosition.y}%`,
          width: '70px',
          height: '70px',
          transform: `translate(-50%, -50%) rotate(${boatPosition.angle + 90}deg)`,
          transition: isIdle ? 'none' : 'all 0.15s linear',
          animation: isIdle ? 'boatFloat 3s ease-in-out infinite' : 'none',
          filter: 'drop-shadow(0 5px 15px rgba(100, 255, 218, 0.6))',
          zIndex: 101,
          pointerEvents: 'none',
        }}
      />
    </>

  );
};

      

const WaterRippleBackground = ({ ripples, scrollDirection, scrollPosition }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      zIndex: 0,
      background: 'linear-gradient(135deg, #0a192f 0%, #112240 50%, #1a365d 100%)',
    }}>
      {/* Mesh/Weave Pattern Overlay */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundImage: `
          linear-gradient(0deg, transparent 24%, rgba(100, 255, 218, 0.03) 25%, rgba(100, 255, 218, 0.03) 26%, transparent 27%, transparent 74%, rgba(100, 255, 218, 0.03) 75%, rgba(100, 255, 218, 0.03) 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, rgba(100, 255, 218, 0.03) 25%, rgba(100, 255, 218, 0.03) 26%, transparent 27%, transparent 74%, rgba(100, 255, 218, 0.03) 75%, rgba(100, 255, 218, 0.03) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '50px 50px',
        opacity: 0.5,
      }} />
      
      <div
        style={{
          position: 'absolute',
          left: '70%',
          top: '65%',
          fontSize: '25px',
          animation: 'swim2 30s ease-in-out infinite 5s, verticalSwim 6s ease-in-out infinite 2s',
          filter: 'drop-shadow(0 2px 8px rgba(45, 212, 191, 0.3))',
          zIndex: 1,
        }}
      >
        🐠
      </div>
      
      <div
        style={{
          position: 'absolute',
          left: '40%',
          top: '75%',
          fontSize: '28px',
          animation: 'swim3 20s ease-in-out infinite 10s, verticalSwim 7s ease-in-out infinite 4s',
          filter: 'drop-shadow(0 2px 8px rgba(56, 189, 248, 0.3))',
          zIndex: 1,
        }}
      >
        🐡
      </div>
      
      <div
        style={{
          position: 'absolute',
          left: '85%',
          top: '68%',
          fontSize: '22px',
          animation: 'swim2 28s ease-in-out infinite 15s, verticalSwim 5.5s ease-in-out infinite 1s',
          filter: 'drop-shadow(0 2px 8px rgba(45, 212, 191, 0.3))',
          zIndex: 1,
        }}
      >
        🐟
      </div>
      
      {/* Animated water gradient layers */}
      <div style={{
        position: 'absolute',
        width: '200%',
        height: '200%',
        top: '-50%',
        left: '-50%',
        background: `
          radial-gradient(circle at 20% 50%, rgba(100, 255, 218, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(45, 212, 191, 0.12) 0%, transparent 50%),
          radial-gradient(circle at 40% 20%, rgba(56, 189, 248, 0.1) 0%, transparent 50%)
        `,
        animation: 'waterFlow 25s ease-in-out infinite',
      }} />
      
      {/* Animated Wave Layers using SVG */}
      <svg
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        {/* Wave 1 - Bottom layer */}
        <path
          fill="rgba(100, 255, 218, 0.03)"
          d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,176C672,181,768,139,864,128C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          style={{ animation: 'wave1 15s ease-in-out infinite' }}
        />
        {/* Wave 2 - Middle layer */}
        <path
          fill="rgba(45, 212, 191, 0.05)"
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          style={{ animation: 'wave2 12s ease-in-out infinite' }}
        />
        {/* Wave 3 - Top layer */}
        <path
          fill="rgba(56, 189, 248, 0.04)"
          d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,117.3C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          style={{ animation: 'wave3 18s ease-in-out infinite' }}
        />
      </svg>
      
      {/* Top Waves */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          transform: 'rotate(180deg)',
        }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="rgba(100, 255, 218, 0.02)"
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          style={{ animation: 'wave1 20s ease-in-out infinite' }}
        />
      </svg>
      
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            border: '2px solid rgba(100, 255, 218, 0.6)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            animation: `ripple ${ripple.duration}ms ease-out forwards`,
            pointerEvents: 'none',
          }}
        />
      ))}
      
      <style>{`
        @keyframes waterFlow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(3%, 3%) rotate(90deg); }
          50% { transform: translate(-2%, 4%) rotate(180deg); }
          75% { transform: translate(4%, -2%) rotate(270deg); }
        }
        
        @keyframes ripple {
          from {
            width: 20px;
            height: 20px;
            opacity: 1;
          }
          to {
            width: 400px;
            height: 400px;
            opacity: 0;
          }
        }
        
        @keyframes bobbing {
          0%, 100% {
            transform: translateY(0) rotate(-2deg);
          }
          50% {
            transform: translateY(-15px) rotate(2deg);
          }
        }
        
        @keyframes waveRide {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(-3deg);
          }
          50% {
            transform: translateY(-5px) rotate(0deg);
          }
          75% {
            transform: translateY(-18px) rotate(3deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }
        
        @keyframes drift {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(50px);
          }
        }
        
        @keyframes swim1 {
          0% {
            left: -10%;
            transform: scaleX(1);
          }
          48% {
            transform: scaleX(1);
          }
          50% {
            left: 110%;
            transform: scaleX(1);
          }
          52% {
            transform: scaleX(-1);
          }
          98% {
            transform: scaleX(-1);
          }
          100% {
            left: -10%;
            transform: scaleX(-1);
          }
        }
        
        @keyframes swim2 {
          0% {
            left: 110%;
            transform: scaleX(-1);
          }
          48% {
            transform: scaleX(-1);
          }
          50% {
            left: -10%;
            transform: scaleX(-1);
          }
          52% {
            transform: scaleX(1);
          }
          98% {
            transform: scaleX(1);
          }
          100% {
            left: 110%;
            transform: scaleX(1);
          }
        }
        
        @keyframes swim3 {
          0%, 100% {
            left: 40%;
            transform: scaleX(1) translateX(0);
          }
          25% {
            left: 20%;
            transform: scaleX(-1) translateX(0);
          }
          50% {
            left: 40%;
            transform: scaleX(-1) translateX(0);
          }
          75% {
            left: 60%;
            transform: scaleX(1) translateX(0);
          }
        }
        
        @keyframes verticalSwim {
          0%, 100% {
            transform: translateY(0);
          }
          25% {
            transform: translateY(-30px);
          }
          50% {
            transform: translateY(-10px);
          }
          75% {
            transform: translateY(-40px);
          }
        }
        
        @keyframes flyAcross {
          0% {
            left: -10%;
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            left: 110%;
            transform: translateY(0);
          }
        }
        
        @keyframes cloudDrift {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100px);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(255, 200, 100, 0.5));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 30px rgba(255, 200, 100, 0.8));
            transform: scale(1.05);
          }
        }
        
        @keyframes wave1 {
          0%, 100% {
            d: path("M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,176C672,181,768,139,864,128C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
          }
          50% {
            d: path("M0,192L48,176C96,160,192,128,288,128C384,128,480,160,576,176C672,192,768,192,864,181.3C960,171,1056,149,1152,154.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
          }
        }
        
        @keyframes wave2 {
          0%, 100% {
            d: path("M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
          }
          50% {
            d: path("M0,256L48,234.7C96,213,192,171,288,165.3C384,160,480,192,576,197.3C672,203,768,181,864,186.7C960,192,1056,224,1152,229.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
          }
        }
        
        @keyframes wave3 {
          0%, 100% {
            d: path("M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,117.3C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
          }
          50% {
            d: path("M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,138.7C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
          }
        }
      `}</style>
    </div>
  );
};

const Portfolio = () => {
  const [ripples, setRipples] = useState([]);
  const [activeSection, setActiveSection] = useState('home');
  const [scrollDirection, setScrollDirection] = useState('down');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [islandVisible, setIslandVisible] = useState(false);
  const rippleIdRef = useRef(0);
  const lastScrollRef = useRef(0);

  const createRipple = (e) => {
    const ripple = {
      id: rippleIdRef.current++,
      x: e.clientX,
      y: e.clientY,
      duration: 1500,
    };
    
    setRipples(prev => [...prev, ripple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, ripple.duration);
  };

  const handleButtonClick = (e) => {
    createRipple(e);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      // Determine scroll direction
      if (currentScroll > lastScrollRef.current) {
        setScrollDirection('down');
      } else if (currentScroll < lastScrollRef.current) {
        setScrollDirection('up');
      }

      lastScrollRef.current = currentScroll;
      setScrollPosition(currentScroll);

      // Check if user is near the bottom (within 500px of the bottom)
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const nearBottom = currentScroll >= maxScroll - 500;
      setIslandVisible(nearBottom);

      // Update active section
      const sections = ['home', 'about', 'skills', 'projects', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId, e) => {
    e.preventDefault();
    createRipple(e);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#e6f1ff', position: 'relative' }}>
      <WaterRippleBackground ripples={ripples} scrollDirection={scrollDirection} scrollPosition={scrollPosition} />
      <ScrollingBoat scrollPosition={scrollPosition} scrollDirection={scrollDirection} />
      
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '1.5rem 2rem',
        backdropFilter: 'blur(10px)',
        background: 'rgba(10, 25, 47, 0.85)',
        borderBottom: '1px solid rgba(100, 255, 218, 0.1)',
        zIndex: 1000,
        animation: 'slideDown 0.6s ease',
      }}>
        <style>{`
          @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(100, 255, 218, 0.3); }
            50% { box-shadow: 0 0 40px rgba(100, 255, 218, 0.6); }
          }
          @keyframes floatIsland {
            0%, 100% { transform: translateY(0px) rotate(-2deg); }
            50% { transform: translateY(-15px) rotate(2deg); }
          }
          @keyframes islandAppear {
            from {
              opacity: 0;
              transform: translateY(50px) scale(0.8);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #64ffda 0%, #2dd4bf 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Saagar Gahlot
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {['home', 'about', 'skills', 'projects', 'contact'].map((section) => (
              <a
                key={section}
                href={`#${section}`}
                onClick={(e) => scrollToSection(section, e)}
                style={{
                  color: activeSection === section ? '#64ffda' : '#8892b0',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  position: 'relative',
                  transition: 'color 0.3s ease',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.target.style.color = '#64ffda'}
                onMouseLeave={(e) => {
                  if (activeSection !== section) e.target.style.color = '#8892b0';
                }}
              >
                {section}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '6rem 2rem 2rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', animation: 'fadeInUp 0.8s ease' }}>
          <div style={{
            display: 'inline-block',
            padding: '0.5rem 1.5rem',
            border: '2px solid #64ffda',
            borderRadius: '2rem',
            color: '#64ffda',
            fontSize: '0.9rem',
            marginBottom: '2rem',
            animation: 'float 3s ease-in-out infinite',
          }}>
            Available for opportunities! 
          </div>
          
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: '900',
            lineHeight: '1.1',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #e6f1ff 0%, #64ffda 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Developer
          </h1>
          
          <p style={{
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            color: '#8892b0',
            marginBottom: '2rem',
            fontWeight: '300',
            lineHeight: '1.1',
            background: 'linear-gradient(135deg, #e6f1ff 0%, #64ffda 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Creating experiences with code and creativity!
          </p>
          
          <p style={{
            fontSize: '1.1rem',
            color: '#8892b0',
            maxWidth: '600px',
            marginBottom: '3rem',
            lineHeight: '1.8',
          }}>
            I build exceptional digital experiences that combine beautiful design with powerful functionality. 
            Passionate about clean code and user focused solutions.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={(e) => {
                handleButtonClick(e);
                scrollToSection('projects', e);
              }}
              style={{
                padding: '1rem 2.5rem',
                background: '#64ffda',
                color: '#0a192f',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 10px 30px rgba(100, 255, 218, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              My Work
            </button>
            
            <button
              onClick={(e) => {
                handleButtonClick(e);
                scrollToSection('contact', e);
              }}
              style={{
                padding: '1rem 2.5rem',
                background: 'transparent',
                color: '#64ffda',
                border: '2px solid #64ffda',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(100, 255, 218, 0.1)';
                e.target.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Get In Touch
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{
        padding: '8rem 2rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '4rem' }}>
            <span style={{
              fontSize: '0.9rem',
              color: '#64ffda',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              fontWeight: '600',
            }}>
              About Me
            </span>
            <h2 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              marginTop: '1rem',
            }}>
              Who I Am
            </h2>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '4rem',
            alignItems: 'center',
          }}>
            <div>
              <p style={{
                color: '#8892b0',
                fontSize: '1.1rem',
                lineHeight: '1.8',
                marginBottom: '1.5rem',
              }}>
                Hello! I'm a developer who is very passionate about creating things that live on the internet. 
                My journey in the code space started from curiosity which led to me building a simple McDonald's Kiosk. 
                I then wanted to learn more and more in the sense of different languages and their respective purposes. 
              </p>
              <p style={{
                color: '#8892b0',
                fontSize: '1.1rem',
                lineHeight: '1.8',
                marginBottom: '1.5rem',
              }}>
                Fast-forward to today, I am graduate from Carleton University with a Major Degree in Computer Science
                and have had the privilege of working on diverse projects ranging from responsive websites to complex applications. 
                My focus is on building accessible, performant digital experiences. 
              </p>
              <p style={{
                color: '#8892b0',
                fontSize: '1.1rem',
                lineHeight: '1.8',
              }}>
                When I'm not coding, I'm exploring new technologies, contributing to open-source, 
                or working on personal projects to sharpen my skills. I am always looking to get better and learn more!
              </p>
            </div>
            
              <div style={{
                width: '100%',         // Takes full container width
                maxWidth: '450px',     // ← Max size limit
                aspectRatio: '1',      // Keeps it square
                borderRadius: '1rem',
                overflow: 'hidden',
                animation: 'float 4s ease-in-out infinite',
                boxShadow: '0 20px 60px rgba(100, 255, 218, 0.2)',
                border: '3px solid #ffffffff',
                margin: '0 auto',      // Centers it
              }}>
                <img 
                  src="photo/me.jpg" 
                  alt="Saagar Gahlot"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                  }}
                />
              </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" style={{
        padding: '8rem 2rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '4rem' }}>
            <span style={{
              fontSize: '0.9rem',
              color: '#64ffda',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              fontWeight: '600',
            }}>
              My Expertise
            </span>
            <h2 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              marginTop: '1rem',
            }}>
              Skills
            </h2>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}>
            {[
              {
                title: 'Frontend',
                icon: '🎨',
                skills: ['HTML & CSS', 'JavaScript', 'React', 'TypeScript', 'Tailwind CSS']
              },
              {
                title: 'Backend',
                icon: '⚙️',
                skills: ['Node.js', 'Python', 'Java', 'C', 'C++']
              },
              {
                title: 'Database, Tools and More',
                icon: '🗄️',
                skills: ['MongoDB', 'SQL', 'Git & GitHub', 'Docker', 'AWS', 'AI/ML', 'Reinforcement Learning']
              }
            ].map((category, index) => (
              <div
                key={index}
                onClick={createRipple}
                style={{
                  background: 'rgba(17, 34, 64, 0.6)',
                  border: '1px solid rgba(100, 255, 218, 0.2)',
                  borderRadius: '1rem',
                  padding: '2.5rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.borderColor = '#64ffda';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(100, 255, 218, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(100, 255, 218, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{category.icon}</div>
                <h3 style={{
                  fontSize: '1.5rem',
                  color: '#64ffda',
                  marginBottom: '1.5rem',
                  fontWeight: '700',
                }}>
                  {category.title}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {category.skills.map((skill, i) => (
                    <li key={i} style={{
                      color: '#8892b0',
                      padding: '0.5rem 0',
                      fontSize: '1rem',
                    }}>
                      <span style={{ color: '#64ffda', marginRight: '0.5rem' }}>▹</span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" style={{
        padding: '8rem 2rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '4rem' }}>
            <span style={{
              fontSize: '0.9rem',
              color: '#64ffda',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              fontWeight: '600',
            }}>
              My Work
            </span>
            <h2 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              marginTop: '1rem',
            }}>
              Featured Projects
            </h2>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '2rem',
          }}>
            {[
              {
                icon: '🚀',
                title: 'TODO',
                description: 'TODO',
                tags: ['TODO'],
              },
              {
                icon: '💡',
                title: 'TODO',
                description: 'TODO',
                tags: ['TODO'],
              },
              {
                icon: '🎨',
                title: 'TODO',
                description: 'TODO',
                tags: ['TODO'],
              },
            ].map((project, index) => (
              <div
                key={index}
                onClick={createRipple}
                style={{
                  background: 'rgba(17, 34, 64, 0.6)',
                  border: '1px solid rgba(100, 255, 218, 0.2)',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 25px 70px rgba(100, 255, 218, 0.2)';
                  const topBar = e.currentTarget.querySelector('.top-bar');
                  if (topBar) topBar.style.transform = 'scaleX(1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  const topBar = e.currentTarget.querySelector('.top-bar');
                  if (topBar) topBar.style.transform = 'scaleX(0)';
                }}
              >
                <div
                  className="top-bar"
                  style={{
                    height: '4px',
                    background: 'linear-gradient(90deg, #64ffda, #2dd4bf)',
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.3s ease',
                  }}
                />
                
                <div style={{
                  height: '200px',
                  background: 'linear-gradient(135deg, rgba(100, 255, 218, 0.1) 0%, rgba(45, 212, 191, 0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem',
                }}>
                  {project.icon}
                </div>
                
                <div style={{ padding: '2rem' }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    marginBottom: '1rem',
                    fontWeight: '700',
                  }}>
                    {project.title}
                  </h3>
                  
                  <p style={{
                    color: '#8892b0',
                    marginBottom: '1.5rem',
                    fontSize: '1rem',
                    lineHeight: '1.7',
                  }}>
                    {project.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                  }}>
                    {project.tags.map((tag, i) => (
                      <span key={i} style={{
                        background: 'rgba(100, 255, 218, 0.1)',
                        color: '#64ffda',
                        padding: '0.4rem 1rem',
                        borderRadius: '0.3rem',
                        fontSize: '0.85rem',
                        border: '1px solid rgba(100, 255, 218, 0.3)',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleButtonClick(e);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64ffda',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        transition: 'opacity 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      → View Live
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleButtonClick(e);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64ffda',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        transition: 'opacity 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      → View Code
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{
        padding: '8rem 2rem',
        position: 'relative',
        zIndex: 1,
      }}>

        <div
          style={{
            position: 'absolute',
            right: '15%',
            top: '24%',
            fontSize: '80px',
            filter: 'drop-shadow(0 5px 15px rgba(100, 255, 218, 0.4))',
            zIndex: 10,
            opacity: islandVisible ? 1 : 0,
            transform: islandVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.8)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
            //animation: islandVisible ? 'floatIsland 3s ease-in-out infinite' : 'none',
          }}
        >
          🏝️
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{
            fontSize: '0.9rem',
            color: '#64ffda',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontWeight: '600',
          }}>
            Get In Touch WIth Me!
          </span>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            marginTop: '1rem',
            marginBottom: '2rem',
          }}>
            Let's Work Together!
          </h2>
          <p style={{
            color: '#8892b0',
            fontSize: '1.1rem',
            lineHeight: '1.8',
            marginBottom: '3rem',
          }}>
            I am always interested in hearing about new projects and opportunities. 
            Whether you have a question or just want to say hi, please feel free to reach out!
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
          }}>
            {[
              { title: 'Email', value: 'saagargahlot@gmail.com', link: 'mailto:saagargahlot@gmail.com' },
              { title: 'GitHub', value: '@saagargahlot', link: 'https://github.com/saagargahlot' },
              { title: 'LinkedIn', value: '/in/yourprofile', link: 'https://ca.linkedin.com/in/saagar-gahlot' },
            ].map((contact, index) => (
              <a
                key={index}
                href={contact.link}
                onClick={createRipple}
                style={{
                  background: 'rgba(17, 34, 64, 0.6)',
                  border: '1px solid rgba(100, 255, 218, 0.2)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  minWidth: '220px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  display: 'block',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = '#64ffda';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(100, 255, 218, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(100, 255, 218, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h3 style={{
                  fontSize: '1.2rem',
                  color: '#64ffda',
                  marginBottom: '0.5rem',
                  fontWeight: '700',
                }}>
                  {contact.title}
                </h3>
                <p style={{ color: '#8892b0', fontSize: '0.95rem' }}>
                  {contact.value}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(100, 255, 218, 0.1)',
        padding: '3rem 2rem',
        textAlign: 'center',
        color: '#8892b0',
        position: 'relative',
        zIndex: 1,
      }}>
        <p style={{ fontSize: '0.95rem' }}>
          © 2025 Saagar Gahlot. Built with React and Pure Passion 💙 
        </p>
      </footer>
    </div>
  );
};

export default Portfolio;