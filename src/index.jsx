import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Particles } from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, OrbitControls, Sky, Stars, Sparkles, MeshWobbleMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Glitch, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';

// Import all 4 view components
import HomeView from './home.jsx';
import ProjectsView from './projects.jsx';
import EditorView from './editor.jsx';
import CurrencyView from './currency.jsx';

// Import custom UI components (we'll create these as separate files in src/)
import NeonButton from './components/NeonButton.jsx';
import HolographicCard from './components/HolographicCard.jsx';
import CodeEditor3D from './components/CodeEditor3D.jsx';

export default function VirtualMark() {
  const [view, setView] = useState('home');
  const [particlesInit, setParticlesInit] = useState(null);
  const [hoverState, setHoverState] = useState({});
  const [audioContext, setAudioContext] = useState(null);
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const [vrMode, setVrMode] = useState(false);
  const canvasRef = useRef();

  // Initialize particles with advanced effects
  const initParticles = async (engine) => {
    await loadFull(engine);
    setParticlesInit(true);
  };

  // Parallax effect for VR-like immersion
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setParallaxOffset({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Initialize Web Audio with spatial audio
  useEffect(() => {
    const initAudio = () => {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        setAudioContext(ctx);
      }
    };
    initAudio();
  }, []);

  // Spatial hover sounds
  const playHoverSound = (freq = 440, pan = 0) => {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const panner = audioContext.createStereoPanner ? audioContext.createStereoPanner() : null;
    
    if (panner) {
      panner.pan.value = pan;
      oscillator.connect(panner);
      panner.connect(gainNode);
    } else {
      oscillator.connect(gainNode);
    }
    
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    oscillator.type = 'sine';
    
    // ADSR envelope
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    oscillator.start();
    oscillator.stop(now + 0.3);
  };

  // Advanced 3D Logo with animations
  const VirtualMarkLogo = () => {
    const logoRef = useRef();
    const groupRef = useRef();
    
    useFrame((state) => {
      if (logoRef.current) {
        logoRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
        logoRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.05;
      }
      if (groupRef.current) {
        groupRef.current.position.x = parallaxOffset.x * 0.1;
        groupRef.current.position.y = parallaxOffset.y * 0.1;
      }
    });

    return (
      <group ref={groupRef} position={[0, 0, -5]}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <group ref={logoRef}>
            {/* Main V letter */}
            <mesh position={[-1.5, 0, 0]}>
              <boxGeometry args={[0.8, 2, 0.8]} />
              <MeshWobbleMaterial
                color="#00ff88"
                emissive="#00ff88"
                emissiveIntensity={0.8}
                roughness={0.1}
                metalness={0.9}
                factor={0.5}
                speed={2}
              />
            </mesh>
            
            {/* Main M letter */}
            <mesh position={[1.5, 0, 0]}>
              <boxGeometry args={[0.8, 2, 0.8]} />
              <MeshWobbleMaterial
                color="#0088ff"
                emissive="#0088ff"
                emissiveIntensity={0.8}
                roughness={0.1}
                metalness={0.9}
                factor={0.5}
                speed={1.5}
              />
            </mesh>
            
            {/* Connecting particle beam */}
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
              <meshBasicMaterial color="#ff00ff" transparent opacity={0.7} />
            </mesh>
            
            {/* Orbiting particles */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2 + Math.PI / 4;
              const radius = 2.5;
              return (
                <mesh
                  key={i}
                  position={[
                    Math.cos(angle + Date.now() * 0.001) * radius,
                    Math.sin(angle + Date.now() * 0.002) * radius * 0.5,
                    0
                  ]}
                >
                  <sphereGeometry args={[0.1, 16, 16]} />
                  <meshBasicMaterial color={i % 2 === 0 ? "#00ff88" : "#0088ff"} />
                </mesh>
              );
            })}
          </group>
        </Float>
      </group>
    );
  };

  // Advanced particle options
  const particlesOptions = {
    background: { color: "#000000" },
    fpsLimit: 144,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "trail",
          parallax: {
            enable: true,
            force: 60,
            smooth: 10
          }
        },
        onClick: {
          enable: true,
          mode: "repulse"
        }
      },
      modes: {
        trail: {
          delay: 0.005,
          quantity: 5
        },
        repulse: {
          distance: 200,
          duration: 0.4
        }
      }
    },
    particles: {
      color: {
        value: ["#00ff88", "#0088ff", "#ff0088", "#ffff00"]
      },
      links: {
        color: "#ffffff",
        distance: 150,
        enable: true,
        opacity: 0.4,
        width: 1,
        triangles: {
          enable: true,
          opacity: 0.1
        }
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "out"
        },
        random: true,
        speed: 1,
        straight: false,
        trail: {
          enable: true,
          length: 10,
          fillColor: "#000000"
        }
      },
      number: {
        density: {
          enable: true,
          area: 800
        },
        value: 120
      },
      opacity: {
        value: {
          min: 0.1,
          max: 0.5
        },
        animation: {
          enable: true,
          speed: 3,
          sync: false
        }
      },
      shape: {
        type: ["circle", "triangle", "star"]
      },
      size: {
        value: {
          min: 1,
          max: 5
        },
        animation: {
          enable: true,
          speed: 5,
          sync: false
        }
      },
      wobble: {
        enable: true,
        speed: 2,
        distance: 10
      }
    },
    detectRetina: true,
    smooth: true
  };

  return (
    <div 
      className="virtual-mark-app" 
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: 'radial-gradient(ellipse at center, #0a0a2a 0%, #000000 70%, #001122 100%)',
        cursor: vrMode ? 'none' : 'auto'
      }}
    >
      {/* Animated Background Particles with Parallax */}
      <div style={{ 
        position: 'absolute', 
        width: '100%', 
        height: '100%',
        transform: `translate(${parallaxOffset.x * 0.2}px, ${parallaxOffset.y * 0.2}px)`,
        transition: 'transform 0.1s linear'
      }}>
        <Particles 
          id="tsparticles" 
          init={initParticles} 
          options={particlesOptions} 
          style={{ position: 'absolute' }}
        />
      </div>

      {/* 3D Background Canvas with VR-like Depth */}
      <div style={{ 
        position: 'absolute', 
        width: '100%', 
        height: '100%',
        perspective: vrMode ? '1000px' : '2000px',
        transformStyle: 'preserve-3d'
      }}>
        <Canvas 
          camera={{ 
            position: [0, 0, 15], 
            fov: vrMode ? 110 : 75,
            near: 0.1,
            far: 1000 
          }}
          style={{ transform: `translateZ(${vrMode ? '50' : '0'}px)` }}
        >
          <color attach="background" args={['#000000']} />
          <fog attach="fog" args={['#000000', 10, 50]} />
          
          {/* Ambient lighting with color cycling */}
          <ambientLight intensity={0.3} color="#ffffff" />
          <pointLight 
            position={[10, 10, 10]} 
            intensity={2} 
            color="#00ff88" 
            distance={100}
            decay={2}
          />
          <pointLight 
            position={[-10, -10, -10]} 
            intensity={1.5} 
            color="#0088ff" 
            distance={100}
            decay={2}
          />
          <pointLight 
            position={[0, 20, 0]} 
            intensity={0.8} 
            color="#ff0088" 
            distance={50}
            decay={1}
          />
          
          {/* VR Depth Layers */}
          <group position={[0, 0, -20]}>
            <VirtualMarkLogo />
          </group>
          
          <group position={[0, 0, -10]}>
            {/* Additional depth elements */}
            {[...Array(5)].map((_, i) => (
              <mesh 
                key={i} 
                position={[
                  Math.sin(Date.now() * 0.0001 + i) * 30,
                  Math.cos(Date.now() * 0.0001 + i) * 20,
                  -i * 5
                ]}
              >
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial 
                  color={i % 3 === 0 ? '#00ff88' : i % 3 === 1 ? '#0088ff' : '#ff0088'}
                  emissive={i % 3 === 0 ? '#00ff88' : i % 3 === 1 ? '#0088ff' : '#ff0088'}
                  emissiveIntensity={0.3}
                  transparent
                  opacity={0.2}
                  wireframe={true}
                />
              </mesh>
            ))}
          </group>
          
          {/* Post-processing Effects Stack */}
          <EffectComposer multisampling={8}>
            <Bloom
              intensity={1.0}
              kernelSize={KernelSize.LARGE}
              luminanceThreshold={0.9}
              luminanceSmoothing={0.025}
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={[0.002, 0.002]}
            />
            <Noise
              premultiply
              blendFunction={BlendFunction.SOFT_LIGHT}
              opacity={0.05}
            />
            <Vignette
              darkness={0.4}
              offset={0.3}
            />
            <Glitch
              delay={[1.5, 3.5]}
              duration={[0.1, 0.3]}
              strength={[0.1, 0.3]}
              mode={GlitchMode.SPORADIC}
            />
          </EffectComposer>
          
          <OrbitControls 
            enableZoom={!vrMode}
            enablePan={!vrMode}
            autoRotate={!vrMode}
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI}
            minPolarAngle={0}
          />
          <Stars 
            radius={300}
            depth={100}
            count={10000}
            factor={6}
            saturation={0}
            fade
            speed={0.5}
          />
          <Sky 
            distance={450000}
            sunPosition={[100, 20, 100]}
            inclination={0}
            azimuth={0.25}
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
            rayleigh={2}
            turbidity={10}
          />
        </Canvas>
      </div>

      {/* Main UI Overlay with Glass Morphism and Parallax */}
      <motion.div 
        className="content-overlay"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translate(${parallaxOffset.x * 0.5}px, ${parallaxOffset.y * 0.5}px)`,
          width: '90%',
          maxWidth: '1400px',
          height: '85%',
          background: 'linear-gradient(135deg, rgba(10, 10, 30, 0.85) 0%, rgba(5, 5, 15, 0.9) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '32px',
          border: '2px solid',
          borderImage: 'linear-gradient(45deg, #00ff88, #0088ff, #ff0088) 1',
          boxShadow: `
            0 0 100px rgba(0, 255, 136, 0.15),
            inset 0 0 40px rgba(0, 136, 255, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.05)
          `,
          overflow: 'hidden',
          zIndex: 10,
          transition: 'transform 0.1s linear, backdrop-filter 0.3s ease'
        }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, type: 'spring', bounce: 0.3 }}
        whileHover={{ 
          backdropFilter: 'blur(25px) saturate(200%)',
          boxShadow: '0 0 120px rgba(0, 255, 136, 0.25), inset 0 0 50px rgba(0, 136, 255, 0.15)'
        }}
      >
        {/* VR Mode Toggle */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 100
        }}>
          <button
            onClick={() => setVrMode(!vrMode)}
            style={{
              background: vrMode 
                ? 'linear-gradient(45deg, #00ff88, #0088ff)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: '2px solid',
              borderColor: vrMode ? '#00ff88' : 'rgba(255, 255, 255, 0.2)',
              color: vrMode ? '#000' : '#fff',
              padding: '10px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontFamily: '"Orbitron", sans-serif',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={() => playHoverSound(660, 0.5)}
          >
            {vrMode ? '🔓 Exit VR Mode' : '🥽 Enter VR Mode'}
          </button>
        </div>

        {/* Navigation - Advanced Holographic */}
        <motion.nav 
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '3rem',
            padding: '2rem',
            borderBottom: '2px solid rgba(0, 255, 136, 0.2)',
            background: 'linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.05), transparent)',
            position: 'relative',
            overflow: 'hidden'
          }}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
        >
          {/* Animated underline */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #00ff88, #0088ff)',
              width: '100px'
            }}
            animate={{
              x: ['0%', '100%', '0%']
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
          
          {['home', 'projects', 'editor', 'currency'].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ 
                scale: 1.1,
                y: -5
              }}
              style={{
                position: 'relative',
                filter: view === item ? 'drop-shadow(0 0 15px rgba(0, 255, 136, 0.7))' : 'none'
              }}
            >
              <NeonButton
                onClick={() => {
                  setView(item);
                  playHoverSound(550 + index * 100, index % 2 === 0 ? -0.5 : 0.5);
                }}
                onMouseEnter={() => {
                  setHoverState(prev => ({ ...prev, [item]: true }));
                  playHoverSound(440 + index * 50, index % 2 === 0 ? -0.3 : 0.3);
                }}
                onMouseLeave={() => setHoverState(prev => ({ ...prev, [item]: false }))}
                isActive={view === item}
                isHovered={hoverState[item]}
                glowIntensity={view === item ? 1 : 0.3}
              >
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}>
                  {view === item && (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      style={{ display: 'inline-block' }}
                    >
                      ⚡
                    </motion.span>
                  )}
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </span>
              </NeonButton>
            </motion.div>
          ))}
        </motion.nav>

        {/* Main View Area with 3D Depth */}
        <div style={{ 
          padding: '3rem', 
          height: 'calc(100% - 100px)', 
          overflow: 'auto',
          position: 'relative',
          transformStyle: 'preserve-3d'
        }}>
          {/* Parallax layers behind content */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at ${50 + parallaxOffset.x * 0.1}% ${50 + parallaxOffset.y * 0.1}%, 
                  rgba(${i === 0 ? '0,255,136' : i === 1 ? '0,136,255' : '255,0,136'}, 0.0${i + 1}) 0%, 
                  transparent 70%)`,
                transform: `translateZ(${-i * 10}px)`,
                zIndex: -i - 1,
                pointerEvents: 'none'
              }}
            />
          ))}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ 
                opacity: 0, 
                x: 100,
                rotateY: 10,
                scale: 0.95
              }}
              animate={{ 
                opacity: 1, 
                x: 0,
                rotateY: 0,
                scale: 1
              }}
              exit={{ 
                opacity: 0, 
                x: -100,
                rotateY: -10,
                scale: 0.95
              }}
              transition={{ 
                duration: 0.5,
                type: 'spring',
                stiffness: 100,
                damping: 15
              }}
              style={{ 
                height: '100%',
                position: 'relative',
                transformStyle: 'preserve-3d'
              }}
            >
              {view === 'home' && <HomeView parallaxOffset={parallaxOffset} />}
              {view === 'projects' && <ProjectsView parallaxOffset={parallaxOffset} />}
              {view === 'editor' && <EditorView parallaxOffset={parallaxOffset} />}
              {view === 'currency' && <CurrencyView parallaxOffset={parallaxOffset} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Advanced Audio Visualizer */}
      {audioContext && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: '30px',
            right: '30px',
            width: '250px',
            height: '80px',
            background: 'linear-gradient(135deg, rgba(0, 20, 40, 0.8), rgba(0, 40, 80, 0.6))',
            backdropFilter: 'blur(15px)',
            borderRadius: '20px',
            border: '2px solid rgba(0, 255, 136, 0.3)',
            padding: '15px',
            zIndex: 20,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0, 255, 136, 0.2)'
          }}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1, type: 'spring' }}
        >
          <canvas 
            ref={canvasRef} 
            width="250" 
            height="80" 
            style={{ 
              width: '100%', 
              height: '100%',
              filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.5))'
            }} 
          />
          <div style={{
            position: 'absolute',
            top: '5px',
            left: '15px',
            color: '#00ff88',
            fontFamily: '"Courier New", monospace',
            fontSize: '0.7rem',
            fontWeight: 'bold'
          }}>
            AUDIO PROCESSOR
          </div>
        </motion.div>
      )}

      {/* Cyberpunk Terminal Footer */}
      <motion.div 
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          background: 'linear-gradient(180deg, transparent, rgba(0, 20, 40, 0.9))',
          borderTop: '2px solid',
          borderImage: 'linear-gradient(90deg, #00ff88, #0088ff, #ff0088) 1',
          padding: '1rem 2rem',
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: '0.9rem',
          color: '#00ff88',
          zIndex: 15,
          backdropFilter: 'blur(10px)',
          overflow: 'hidden'
        }}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.8, type: 'spring' }}
      >
        {/* Scanning line */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #00ff88, transparent)',
            boxShadow: '0 0 10px #00ff88'
          }}
          animate={{
            y: ['0%', '100%', '0%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#0088ff' }}>
              <span style={{ opacity: 0.7 }}>user@virtual-mark</span>:<span style={{ color: '#00ff88' }}>~</span>$
            </span>
            <TypewriterText 
              texts={[
                "INITIALIZING NEXUS... ∇²Ψ = 0",
                "QUANTUM STATE: |Ψ⟩ = α|0⟩ + β|1⟩",
                "METAVERSE CONNECTION: 99.7% STABLE",
                "NEURAL LINK: PRIMED FOR IMMERSION",
                "WELCOME TO THE NEXT REALITY"
              ]}
              speed={30}
              loop={true}
              glitch={true}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#00ff88',
                  boxShadow: '0 0 10px #00ff88'
                }}
              />
              <span style={{ color: '#ff0088' }}>
                SYSTEM STATUS: <span style={{ color: '#00ff88' }}>NOMINAL</span>
              </span>
            </div>
            
            <span style={{ color: '#aaa', fontFamily: '"Orbitron", sans-serif' }}>
              <span style={{ color: '#0088ff' }}>{new Date().toLocaleTimeString([], {hour12: false})}</span> | 
              USERS ONLINE: <span style={{ color: '#ff0088' }}>1,847</span> | 
              VR ACTIVE: <span style={{ color: vrMode ? '#00ff88' : '#ff5555' }}>{vrMode ? 'YES' : 'NO'}</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* VR Headset Overlay Effect */}
      {vrMode && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 5,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at center, transparent 60%, rgba(0, 0, 0, 0.9) 100%)',
          mixBlendMode: 'overlay'
        }}>
          {/* VR lens distortion */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            right: '10%',
            bottom: '10%',
            border: '3px solid rgba(0, 255, 136, 0.3)',
            borderRadius: '50%',
            boxShadow: 'inset 0 0 100px rgba(0, 255, 136, 0.1)'
          }} />
          
          {/* Reticle */}
          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '20px'
            }}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              border: '2px solid #00ff88',
              borderRadius: '50%',
              boxShadow: '0 0 20px #00ff88'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '4px',
                height: '4px',
                background: '#00ff88',
                borderRadius: '50%'
              }} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Enhanced Typewriter with Glitch Effects
function TypewriterText({ texts, speed = 30, loop = true, glitch = false }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  
  // Glitch effect
  useEffect(() => {
    if (glitch) {
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          setGlitchActive(true);
          setTimeout(() => setGlitchActive(false), 100);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [glitch]);

  // Typewriter effect
  useEffect(() => {
    if (charIndex <= texts[currentIndex].length) {
      const timeout = setTimeout(() => {
        setDisplayText(texts[currentIndex].substring(0, charIndex));
        setCharIndex(charIndex + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    } else if (loop) {
      const timeout = setTimeout(() => {
        setCurrentIndex((currentIndex + 1) % texts.length);
        setCharIndex(0);
        setDisplayText('');
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [charIndex, currentIndex, texts, speed, loop]);

  return (
    <span style={{ 
      display: 'inline-block', 
      minWidth: '500px',
      position: 'relative',
      filter: glitchActive ? 'url(#glitchFilter)' : 'none'
    }}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        style={{ 
          marginLeft: '2px',
          color: '#00ff88',
          textShadow: '0 0 10px #00ff88'
        }}
      >
        █
      </motion.span>
      
      {/* SVG filter for glitch effect */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="glitchFilter" x="0" y="0">
            <feOffset in="SourceGraphic" dx="2" dy="0" result="offset1">
              <animate attributeName="dx" values="0;2;0" dur="0.1s" repeatCount="1" />
            </feOffset>
            <feOffset in="SourceGraphic" dx="-2" dy="0" result="offset2">
              <animate attributeName="dx" values="0;-2;0" dur="0.1s" repeatCount="1" />
            </feOffset>
            <feBlend in="offset1" in2="offset2" mode="screen" />
          </filter>
        </defs>
      </svg>
    </span>
  );
}
