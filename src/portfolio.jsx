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
          d="M 0,8
             Q 12,24 18 35
             Q 30,15 55,34
             Q 50,40 50,50
             Q 0,25 15,50
             Q 13,88 10,88
             Q 10,25 10,8
             Q 10,15 10,40"
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="0.3"
          strokeDasharray="1,3"
          opacity="0"
        />
      </svg>

      {/* Boat following the path */}
      <img
        src="/photo/boat.png"
        alt="Sailing boat"
        loading="eager"
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
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
    </>

  );
};

      

const WaterRippleBackground = ({ ripples, scrollDirection, scrollPosition, isMobile = false }) => {
  const maxScroll = typeof document !== 'undefined'
    ? document.documentElement.scrollHeight - window.innerHeight
    : 1000;
  const scrollPercentage = Math.min(scrollPosition / maxScroll, 1);
  const deepWaterVisible = scrollPercentage > 0.4; // Show after 40% scroll
  const coralVisible = scrollPercentage > 0.95; // Show coral after 95% scroll

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
      willChange: isMobile ? 'auto' : 'transform',
    }}>

      {!isMobile && <div
        style={{
          position: 'absolute',
          left: '70%',
          top: '65%',
          animation: 'swim2 55s ease-in-out infinite',
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: '25px',
            animation: 'flipAndBob2 55s ease-in-out infinite',
            filter: 'drop-shadow(0 2px 8px rgba(45, 212, 191, 0.3))',
          }}
        >
          🐠
        </div>
      </div>}

      {!isMobile && <div
        style={{
          position: 'absolute',
          left: '40%',
          top: '75%',
          animation: 'swim3 20s ease-in-out infinite',
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: '28px',
            animation: 'flipAndBob3 20s ease-in-out infinite',
            filter: 'drop-shadow(0 2px 8px rgba(56, 189, 248, 0.3))',
          }}
        >
          🐡
        </div>
      </div>}

      {!isMobile && <div
        style={{
          position: 'absolute',
          left: '85%',
          top: '68%',
          animation: 'swim2 50s ease-in-out infinite',
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: '22px',
            animation: 'flipAndBob2 50s ease-in-out infinite',
            filter: 'drop-shadow(0 2px 8px rgba(45, 212, 191, 0.3))',
          }}
        >
          🐟
        </div>
      </div>}

      {/* Jellyfish - appears in deeper water */}
      {!isMobile && <div
        style={{
          position: 'absolute',
          left: '5%',
          top: '40%',
          fontSize: '35px',
          animation: 'jellyfishFloat 8s ease-in-out infinite',
          filter: 'drop-shadow(0 4px 12px rgba(147, 51, 234, 0.4))',
          opacity: deepWaterVisible ? 1 : 0,
          transition: deepWaterVisible ? 'opacity 0.7s ease-in-out' : 'opacity 0.3s ease-out',
          zIndex: 1,
        }}
      >
        🪼
      </div>}

      {/* Jellyfish 2 */}
      {!isMobile && <div
        style={{
          position: 'absolute',
          left: '92%',
          top: '70%',
          fontSize: '30px',
          animation: 'jellyfishFloat 10s ease-in-out infinite 2s',
          filter: 'drop-shadow(0 4px 12px rgba(147, 51, 234, 0.4))',
          opacity: deepWaterVisible ? 1 : 0,
          transition: deepWaterVisible ? 'opacity 0.7s ease-in-out' : 'opacity 0.3s ease-out',
          zIndex: 1,
        }}
      >
        🪼
      </div>}


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
        animation: isMobile ? 'none' : 'waterFlow 25s ease-in-out infinite',
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
          fill="rgba(100, 255, 218, 0.08)"
          d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,176C672,181,768,139,864,128C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          style={{ animation: 'wave1 12s ease-in-out infinite' }}
        />
        {/* Wave 2 - Middle layer */}
        <path
          fill="rgba(45, 212, 191, 0.1)"
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          style={{ animation: 'wave2 10s ease-in-out infinite' }}
        />
        {/* Wave 3 - Top layer */}
        <path
          fill="rgba(56, 189, 248, 0.07)"
          d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,117.3C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          style={{ animation: 'wave3 15s ease-in-out infinite' }}
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
          fill="rgba(100, 255, 218, 0.06)"
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          style={{ animation: 'wave1 18s ease-in-out infinite' }}
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
          }
          50% {
            left: 110%;
          }
          100% {
            left: -10%;
          }
        }

        @keyframes swim2 {
          0% {
            left: 110%;
          }
          50% {
            left: -10%;
          }
          100% {
            left: 110%;
          }
        }

        @keyframes swim3 {
          0%, 100% {
            left: 40%;
          }
          25% {
            left: 20%;
          }
          75% {
            left: 60%;
          }
        }

        @keyframes flipAndBob1 {
          0% {
            transform: scaleX(-1) translateY(0);
          }
          12.5% {
            transform: scaleX(-1) translateY(-30px);
          }
          25% {
            transform: scaleX(-1) translateY(-10px);
          }
          37.5% {
            transform: scaleX(-1) translateY(-40px);
          }
          49% {
            transform: scaleX(-1) translateY(0);
          }
          50% {
            transform: scaleX(1) translateY(0);
          }
          62.5% {
            transform: scaleX(1) translateY(-30px);
          }
          75% {
            transform: scaleX(1) translateY(-10px);
          }
          87.5% {
            transform: scaleX(1) translateY(-40px);
          }
          100% {
            transform: scaleX(1) translateY(0);
          }
        }

        @keyframes flipAndBob2 {
          0% {
            transform: scaleX(1) translateY(0);
          }
          12.5% {
            transform: scaleX(1) translateY(-30px);
          }
          25% {
            transform: scaleX(1) translateY(-10px);
          }
          37.5% {
            transform: scaleX(1) translateY(-40px);
          }
          49% {
            transform: scaleX(1) translateY(0);
          }
          50% {
            transform: scaleX(-1) translateY(0);
          }
          62.5% {
            transform: scaleX(-1) translateY(-30px);
          }
          75% {
            transform: scaleX(-1) translateY(-10px);
          }
          87.5% {
            transform: scaleX(-1) translateY(-40px);
          }
          100% {
            transform: scaleX(-1) translateY(0);
          }
        }

        @keyframes flipAndBob3 {
          0% {
            transform: scaleX(1) translateY(0);
          }
          6.25% {
            transform: scaleX(1) translateY(-30px);
          }
          12.5% {
            transform: scaleX(1) translateY(-10px);
          }
          18.75% {
            transform: scaleX(1) translateY(-40px);
          }
          24% {
            transform: scaleX(1) translateY(0);
          }
          25% {
            transform: scaleX(-1) translateY(0);
          }
          31.25% {
            transform: scaleX(-1) translateY(-30px);
          }
          37.5% {
            transform: scaleX(-1) translateY(-10px);
          }
          43.75% {
            transform: scaleX(-1) translateY(-40px);
          }
          50% {
            transform: scaleX(-1) translateY(0);
          }
          56.25% {
            transform: scaleX(-1) translateY(-30px);
          }
          62.5% {
            transform: scaleX(-1) translateY(-10px);
          }
          68.75% {
            transform: scaleX(-1) translateY(-40px);
          }
          74% {
            transform: scaleX(-1) translateY(0);
          }
          75% {
            transform: scaleX(1) translateY(0);
          }
          81.25% {
            transform: scaleX(1) translateY(-30px);
          }
          87.5% {
            transform: scaleX(1) translateY(-10px);
          }
          93.75% {
            transform: scaleX(1) translateY(-40px);
          }
          100% {
            transform: scaleX(1) translateY(0);
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

        @keyframes jellyfishFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-80px) rotate(-5deg);
          }
          50% {
            transform: translateY(-120px) rotate(0deg);
          }
          75% {
            transform: translateY(-80px) rotate(5deg);
          }
        }

        @keyframes crabWalk1 {
          0%, 100% {
            left: 10%;
          }
          50% {
            left: 15%;
          }
        }

        @keyframes crabWalk2 {
          0%, 100% {
            left: 85%;
          }
          50% {
            left: 80%;
          }
        }

        @keyframes crabFlip1 {
          0%, 100% {
            transform: translateY(0);
          }
          12.5% {
            transform: translateY(-8px);
          }
          25% {
            transform: translateY(-15px);
          }
          37.5% {
            transform: translateY(-8px);
          }
          50% {
            transform: translateY(0);
          }
          62.5% {
            transform: translateY(-8px);
          }
          75% {
            transform: translateY(-15px);
          }
          87.5% {
            transform: translateY(-8px);
          }
        }

        @keyframes crabFlip2 {
          0%, 100% {
            transform: translateY(0);
          }
          12.5% {
            transform: translateY(-8px);
          }
          25% {
            transform: translateY(-15px);
          }
          37.5% {
            transform: translateY(-8px);
          }
          50% {
            transform: translateY(0);
          }
          62.5% {
            transform: translateY(-8px);
          }
          75% {
            transform: translateY(-15px);
          }
          87.5% {
            transform: translateY(-8px);
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
          25% {
            d: path("M0,192L48,176C96,160,192,128,288,128C384,128,480,160,576,176C672,192,768,192,864,181.3C960,171,1056,149,1152,154.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
          }
          50% {
            d: path("M0,128L48,149.3C96,171,192,213,288,218.7C384,224,480,192,576,165.3C672,139,768,117,864,133.3C960,149,1056,203,1152,213.3C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
          }
          75% {
            d: path("M0,224L48,202.7C96,181,192,139,288,138.7C384,139,480,181,576,202.7C672,224,768,224,864,213.3C960,203,1056,181,1152,170.7C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
          }
        }

        @keyframes wave2 {
          0%, 100% {
            d: path("M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
          }
          33% {
            d: path("M0,256L48,234.7C96,213,192,171,288,165.3C384,160,480,192,576,197.3C672,203,768,181,864,186.7C960,192,1056,224,1152,229.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
          }
          66% {
            d: path("M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,218.7C672,224,768,192,864,165.3C960,139,1056,117,1152,128C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
          }
        }

        @keyframes wave3 {
          0%, 100% {
            d: path("M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,117.3C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
          }
          40% {
            d: path("M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,138.7C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
          }
          80% {
            d: path("M0,160L48,154.7C96,149,192,139,288,149.3C384,160,480,192,576,192C672,192,768,160,864,138.7C960,117,1056,107,1152,117.3C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
          }
        }

        /* Respect user's reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
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
  const [contentLoaded, setContentLoaded] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Handle content loading (images, fonts, etc.)
  useEffect(() => {
    const handleLoad = () => {
      // Add a small delay to ensure fonts and images are fully rendered
      setTimeout(() => {
        setContentLoaded(true);
        // Trigger a scroll event to recalculate positions
        window.dispatchEvent(new Event('scroll'));
      }, 100);
    };

    const handleResize = () => {
      // Recalculate on window resize
      window.dispatchEvent(new Event('scroll'));
    };

    // Wait for all content to load
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    window.addEventListener('resize', handleResize);

    // Also recalculate after a delay to catch late-loading content
    const timeoutId = setTimeout(() => {
      window.dispatchEvent(new Event('scroll'));
    }, 1000);

    return () => {
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

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

      // Check if user has scrolled to around 85%
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = currentScroll / maxScroll;
      const at85Percent = scrollPercentage >= 0.85;
      setIslandVisible(at85Percent);

      // Update active section
      const sections = ['home', 'about', 'skills', 'projects', 'contact'];

      // Check if user is at the bottom of the page
      const isAtBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50;

      if (isAtBottom) {
        setActiveSection('contact');
      } else {
        // Use middle of viewport for better accuracy
        const viewportMiddle = window.scrollY + (window.innerHeight / 2);

        let currentSection = 'home';
        let minDistance = Infinity;

        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            const sectionMiddle = offsetTop + (offsetHeight / 2);
            const distance = Math.abs(viewportMiddle - sectionMiddle);

            // Find the section whose middle is closest to viewport middle
            if (distance < minDistance) {
              minDistance = distance;
              currentSection = section;
            }
          }
        }

        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Detect mobile devices for performance optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToSection = (sectionId, e) => {
    e.preventDefault();
    createRipple(e);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // All projects data
  const allProjects = [
    {
      image: '/photo/2048-game.png',
      title: '2048 Game',
      description: 'Classic 2048 puzzle game implementation with smooth animations and responsive design. Built to practice game logic and state management.',
      tags: ['JavaScript', 'HTML', 'CSS', 'Typescript', 'Zustand', 'Game Development'],
      link: 'https://github.com/saagargahlot/2048-game'
    },
    {
      image: '/photo/moviezilla.png',
      title: 'Moviezilla',
      description: 'A comprehensive movie discovery platform that allows users to browse, search, and explore movies with detailed information and ratings.',
      tags: ['Node.js', 'API Integration', 'JavaScript', 'MongoDB', 'Pug template system', 'Mongoose'],
      link: 'https://github.com/saagargahlot/proj-moviezilla'
    },
    {
      image: '/photo/ecommerce.png',
      title: 'E-Commerce Platform',
      description: 'Full-stack e-commerce application with user authentication, product management, shopping cart, and secure payment processing.',
      tags: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe API'],
      link: 'https://github.com/saagargahlot/ecommerce-platform'
    },
    {
      image: '/photo/weather-app.png',
      title: 'Weather Dashboard',
      description: 'Real-time weather application with location-based forecasts, interactive maps, and weather alerts using external APIs.',
      tags: ['React', 'OpenWeather API', 'Geolocation', 'Chart.js'],
      link: 'https://github.com/saagargahlot/weather-dashboard'
    },
    {
      image: '/photo/task-manager.png',
      title: 'Task Management App',
      description: 'Productivity application for managing tasks, projects, and deadlines with drag-and-drop functionality and team collaboration features.',
      tags: ['React', 'TypeScript', 'Firebase', 'Drag & Drop'],
      link: 'https://github.com/saagargahlot/task-manager'
    },
    {
      image: '/photo/portfolio-builder.png',
      title: 'Portfolio Builder',
      description: 'No-code portfolio website builder that allows users to create professional portfolios using customizable templates and themes.',
      tags: ['React', 'Redux', 'HTML/CSS Generator', 'Export Features'],
      link: 'https://github.com/saagargahlot/portfolio-builder'
    }
  ];

  const displayedProjects = showAllProjects ? allProjects : allProjects.slice(0, 3);

  return (
    <>
      <WaterRippleBackground ripples={ripples} scrollDirection={scrollDirection} scrollPosition={scrollPosition} isMobile={isMobile} />
      {!isMobile && <ScrollingBoat scrollPosition={scrollPosition} scrollDirection={scrollDirection} />}

      <div style={{ fontFamily: "'Inter', sans-serif", color: '#e6f1ff', position: 'relative' }}>

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '1rem 0',
        backdropFilter: 'blur(10px)',
        background: 'rgba(10, 25, 47, 0.85)',
        borderBottom: '1px solid rgba(100, 255, 218, 0.1)',
        zIndex: 1000,
        animation: 'slideDown 0.6s ease',
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');

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
          @keyframes slideInFromLeft {
            from {
              opacity: 0;
              transform: translateX(-100px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 clamp(1rem, 4vw, 2rem)' }}>
          <div style={{
            fontSize: 'clamp(1.1rem, 3vw, 1.35rem)',
            fontWeight: '800',
            fontFamily: 'Caslon',
            background: 'linear-gradient(135deg, #e6f1ff 0%, #64ffda 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Saagar Gahlot
          </div>

          {/* Desktop Navigation */}
          <div style={{
            display: isMobile ? 'none' : 'flex',
            gap: '1.5rem'
          }}>
            {['home', 'about', 'skills', 'projects', 'contact'].map((section) => (
              <a
                key={section}
                href={`#${section}`}
                onClick={(e) => scrollToSection(section, e)}
                style={{
                  color: activeSection === section ? '#64ffda' : '#8892b0',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  position: 'relative',
                  transition: 'color 0.3s ease',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
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

          {/* Mobile Hamburger Menu */}
          {isMobile && (
            <button
              onClick={(e) => {
                handleButtonClick(e);
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#64ffda',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 1001,
              }}
              aria-label="Toggle menu"
            >
              <div style={{
                width: '25px',
                height: '2px',
                background: '#64ffda',
                transition: 'all 0.3s ease',
                transform: mobileMenuOpen ? 'rotate(45deg) translateY(6px)' : 'none',
              }} />
              <div style={{
                width: '25px',
                height: '2px',
                background: '#64ffda',
                transition: 'all 0.3s ease',
                opacity: mobileMenuOpen ? 0 : 1,
              }} />
              <div style={{
                width: '25px',
                height: '2px',
                background: '#64ffda',
                transition: 'all 0.3s ease',
                transform: mobileMenuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none',
              }} />
            </button>
          )}
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobile && mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(10, 25, 47, 0.98)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(100, 255, 218, 0.1)',
            padding: '1rem 0',
            animation: 'slideDown 0.3s ease',
          }}>
            {['home', 'about', 'skills', 'projects', 'contact'].map((section) => (
              <a
                key={section}
                href={`#${section}`}
                onClick={(e) => {
                  scrollToSection(section, e);
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'block',
                  color: activeSection === section ? '#64ffda' : '#8892b0',
                  textDecoration: 'none',
                  fontSize: '1.1rem',
                  fontWeight: '500',
                  padding: '1rem 2rem',
                  transition: 'all 0.3s ease',
                  textTransform: 'capitalize',
                  borderLeft: activeSection === section ? '3px solid #64ffda' : '3px solid transparent',
                }}
                onTouchStart={(e) => e.currentTarget.style.background = 'rgba(100, 255, 218, 0.1)'}
                onTouchEnd={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {section}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(5rem, 10vh, 6rem) clamp(1rem, 4vw, 2rem) 2rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
          animation: 'fadeInUp 0.8s ease',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'flex',
            gap: 'clamp(0.5rem, 2vw, 1rem)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'clamp(1.5rem, 3vh, 2rem)',
            flexWrap: 'wrap',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: 'clamp(0.6rem, 2vw, 0.76rem) clamp(1rem, 3vw, 2rem)',
              background: '#64ffda',
              color: '#0a192f',
              border: 'none',
              borderRadius: '2rem',
              fontSize: 'clamp(0.85rem, 2vw, 1rem)',
              fontWeight: '600',
              animation: isMobile ? 'none' : 'float 3s ease-in-out infinite',
            }}>
              Available for opportunities!
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: 'clamp(0.5rem, 1.5vw, 0.5rem) clamp(1rem, 2.5vw, 1.5rem)',
              border: '2px solid #64ffda',
              borderRadius: '2rem',
              color: '#64ffda',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              animation: isMobile ? 'none' : 'float 3s ease-in-out infinite',
            }}>
              <span style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>📍</span>
              <span>Based in Alberta</span>
            </div>
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
            fontWeight: '250',
            lineHeight: '1.1',
            background: 'linear-gradient(135deg, #e6f1ff 0%, #64ffda 75%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Computer Science Graduate from Carleton University
          </p>
          
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
            color: '#c0cae9ff',
            maxWidth: '600px',
            margin: '0 auto clamp(2rem, 4vh, 3rem)',
            lineHeight: '1.8',
          }}>
            I build exceptional digital experiences that combine beautiful design with powerful functionality.
            Passionate about clean code and user focused solutions.
          </p>

          <div style={{
            display: 'flex',
            gap: 'clamp(0.75rem, 2vw, 1rem)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <button
              onClick={(e) => {
                handleButtonClick(e);
                scrollToSection('projects', e);
              }}
              style={{
                padding: 'clamp(0.85rem, 2.5vw, 1rem) clamp(1.5rem, 4vw, 2.5rem)',
                background: '#64ffda',
                color: '#0a192f',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
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
              My Projects
            </button>

            <button
              onClick={(e) => {
                handleButtonClick(e);
                scrollToSection('contact', e);
              }}
              style={{
                padding: 'clamp(0.85rem, 2.5vw, 1rem) clamp(1.5rem, 4vw, 2.5rem)',
                background: 'transparent',
                color: '#64ffda',
                border: '2px solid #64ffda',
                borderRadius: '0.5rem',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
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
              Contact Me
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{
        padding: 'clamp(4rem, 10vh, 8rem) clamp(1rem, 4vw, 2rem)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: 'clamp(1rem, 3vh, 2rem)' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontFamily: 'Caslon',
              fontWeight: '800',
              marginTop: 'clamp(0.5rem, 2vh, 1rem)',
              color: '#ffffff',
              animation: isMobile ? 'none' : 'slideInFromLeft 0.8s ease-out',
            }}>
              ABOUT ME
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(2rem, 5vw, 4rem)',
            alignItems: 'center',
          }}>
            <div style={{ maxWidth: '600px' }}>
              <p style={{
                color: '#c0cae9ff',
                fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                lineHeight: '1.8',
                marginBottom: 'clamp(1rem, 3vh, 1.5rem)',
              }}>
                Hello. I'm a developer who is passionate about creating things that live on the internet.
                My journey in the coding space began with curiosity, which led me to build a simple McDonald's kiosk.
                I then wanted to learn more and more about different languages and their respective purposes.
              </p>
              <p style={{
                color: '#c0cae9ff',
                fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                lineHeight: '1.8',
                marginBottom: 'clamp(1rem, 3vh, 1.5rem)',
              }}>
                Fast-forward to today, I am a graduate of Carleton University with a Major Degree in Computer Science and
                have had the privilege of working on diverse projects ranging from responsive websites to complex applications.
                My focus is on building accessible, performant digital experiences.
              </p>
              <p style={{
                color: '#c0cae9ff',
                fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                lineHeight: '1.8',
              }}>
                When I'm not coding, I'm exploring new technologies, contributing to open-source projects, or working on personal projects to sharpen my skills.
                I am always looking to get better and learn more.
              </p>
            </div>
            
              <div style={{
                width: '100%',
                maxWidth: isMobile ? '300px' : '450px',
                aspectRatio: '1',
                borderRadius: '1rem',
                overflow: 'hidden',
                animation: isMobile ? 'none' : 'float 4s ease-in-out infinite',
                boxShadow: '0 20px 60px rgba(100, 255, 218, 0.2)',
                border: '3px solid #ffffffff',
                margin: '0 auto',
              }}>
                <img
                  src="/photo/me.jpg"
                  alt="Saagar Gahlot"
                  loading="eager"
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
        padding: 'clamp(3rem, 8vh, 5rem) clamp(1rem, 4vw, 2rem)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{ marginBottom: 'clamp(1.5rem, 4vh, 2.5rem)' }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 5vw, 3rem)',
              fontWeight: '800',
              fontFamily: 'Caslon',
              marginTop: 'clamp(0.5rem, 2vh, 0.75rem)',
              color: '#ffffff',
            }}>
              MY SKILLS
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'clamp(1rem, 3vw, 1.5rem)',
          }}>
            {[
              {
                title: 'Frontend',
                icon: '',
                skills: ['HTML & CSS', 'JavaScript', 'React', 'TypeScript', 'Tailwind CSS', 'GUI']
              },
              {
                title: 'Backend',
                icon: '',
                skills: ['Node.js', 'Python', 'Java', 'C', 'C++']
              },
              {
                title: 'Database, AI Development Tools and Others',
                icon: '',
                skills: ['MongoDB', 'SQL', 'Claude Code', 'Cursor', 'Copilot', 'Git & GitHub', 'Docker', 'AWS', 'AI/ML', 'Reinforcement Learning', 'CLI']
              }
            ].map((category, index) => (
              <div
                key={index}
                onClick={createRipple}
                style={{
                  background: 'rgba(17, 34, 64, 0.6)',
                  border: '1px solid rgba(100, 255, 218, 0.2)',
                  borderRadius: '1rem',
                  padding: '1.25rem',
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
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{category.icon}</div>
                <h3 style={{
                  fontSize: '1.3rem',
                  color: '#64ffda',
                  marginBottom: '0.75rem',
                  fontWeight: '700',
                }}>
                  {category.title}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {category.skills.map((skill, i) => (
                    <li key={i} style={{
                      color: '#c0cae9ff',
                      padding: '0.3rem 0',
                      fontSize: '0.95rem',
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
        padding: 'clamp(3rem, 8vh, 5rem) clamp(1rem, 4vw, 2rem)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{ marginBottom: 'clamp(1.5rem, 4vh, 2.5rem)' }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 5vw, 3rem)',
              fontWeight: '800',
              fontFamily: 'Caslon',
              marginTop: 'clamp(0.5rem, 2vh, 0.75rem)',
              color: '#ffffff',
            }}>
              MY PROJECTS
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(1rem, 3vw, 1.5rem)',
            marginBottom: 'clamp(1.5rem, 3vh, 2rem)',
          }}>
            {displayedProjects.map((project, index) => (
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
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(100, 255, 218, 0.1) 0%, rgba(45, 212, 191, 0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img
                    src={project.image}
                    alt={project.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                </div>

                <div style={{ padding: '1rem' }}>
                  <h3 style={{
                    fontSize: '1.2rem',
                    marginBottom: '0.4rem',
                    fontWeight: '700',
                  }}>
                    {project.title}
                  </h3>

                  <p style={{
                    color: '#c0cae9ff',
                    marginBottom: '0.65rem',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                  }}>
                    {project.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                    marginBottom: '0.65rem',
                  }}>
                    {project.tags.map((tag, i) => (
                      <span key={i} style={{
                        background: 'rgba(100, 255, 218, 0.1)',
                        color: '#64ffda',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '0.3rem',
                        fontSize: '0.8rem',
                        border: '1px solid rgba(100, 255, 218, 0.3)',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {project.link && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleButtonClick(e);
                          window.open(project.link, '_blank');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ffffffff',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          transition: 'opacity 0.3s ease',
                          textDecorationLine: 'underline'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                      >
                        <strong>View Code</strong>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View More/Less Button */}
          {allProjects.length > 3 && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                onClick={(e) => {
                  handleButtonClick(e);
                  setShowAllProjects(!showAllProjects);
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
                {showAllProjects ? 'Show Less' : `View More Projects (${allProjects.length - 3} more)`}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{
        padding: 'clamp(4rem, 10vh, 8rem) clamp(1rem, 4vw, 2rem)',
        position: 'relative',
        zIndex: 1,
      }}>

        {!isMobile && <div
          style={{
            position: 'absolute',
            left: '10%',
            top: '24%',
            fontSize: 'clamp(50px, 10vw, 80px)',
            filter: 'drop-shadow(0 5px 15px rgba(100, 255, 218, 0.4))',
            zIndex: 10,
            opacity: islandVisible ? 1 : 0,
            transform: islandVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.8)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          }}
        >
          🏝️
        </div>}

        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
          <span style={{
            fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
            color: '#64ffda',
            textTransform: 'uppercase',
            letterSpacing: 'clamp(2px, 0.5vw, 3px)',
            fontWeight: '600',
            display: 'block',
          }}>
            CONTACT ME!
          </span>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 8vw, 4rem)',
            fontWeight: '800',
            fontFamily: 'Caslon',
            marginTop: 'clamp(0.75rem, 2vh, 1rem)',
            marginBottom: 'clamp(1.5rem, 3vh, 2rem)',
            animation: isMobile ? 'none' : 'slideInFromLeft 0.8s ease-out',
          }}>
            Let's Work Together!
          </h2>
          <p style={{
            color: '#c0cae9ff',
            fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
            lineHeight: '1.8',
            marginBottom: 'clamp(2rem, 4vh, 3rem)',
            maxWidth: '600px',
            margin: '0 auto clamp(2rem, 4vh, 3rem)',
          }}>
            I am always interested in hearing about new projects and opportunities.
            Whether you have a question or just want to say hi, please feel free to reach out!
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
            justifyContent: 'center',
            gap: 'clamp(1rem, 3vw, 2rem)',
            maxWidth: isMobile ? '100%' : '800px',
            margin: '0 auto',
          }}>
            {[
              { title: 'Email', value: 'saagargahlot@gmail.com', link: 'mailto:saagargahlot@gmail.com' },
              { title: 'GitHub', value: '@saagargahlot', link: 'https://github.com/saagargahlot' },
              { title: 'LinkedIn', value: '/in/saagargahlot', link: 'https://ca.linkedin.com/in/saagar-gahlot' },
            ].map((contact, index) => (
              <a
                key={index}
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={createRipple}
                style={{
                  background: 'rgba(17, 34, 64, 0.6)',
                  border: '1px solid rgba(100, 255, 218, 0.2)',
                  borderRadius: '1rem',
                  padding: 'clamp(1.5rem, 4vw, 2rem)',
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
                  fontSize: 'clamp(1.1rem, 3vw, 1.2rem)',
                  color: '#64ffda',
                  marginBottom: '0.5rem',
                  fontWeight: '700',
                }}>
                  {contact.title}
                </h3>
                <p style={{ color: '#8892b0', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
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
        padding: 'clamp(2rem, 5vh, 3rem) clamp(1rem, 4vw, 2rem)',
        textAlign: 'center',
        color: '#c0cae9ff',
        position: 'relative',
        zIndex: 1,
      }}>
        <p style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', marginBottom: '0.5rem' }}>
          © 2025 Saagar Gahlot
        </p>
        <p style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
          Built with React and Pure Passion 💙
        </p>
      </footer>
      </div>
    </>
  );
};

export default Portfolio;