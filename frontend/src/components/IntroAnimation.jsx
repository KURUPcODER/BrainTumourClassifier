import React, { useEffect, useState, useRef } from 'react';
import '../index.css';

const IntroAnimation = ({ onComplete }) => {
    const [animationStep, setAnimationStep] = useState(0);
    const canvasRef = useRef(null);

    // Neuron Background Animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Resize canvas to window size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Neuron Particles
        const particles = [];
        const particleCount = 100;
        const connectionDistance = 150;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                radius: Math.random() * 2 + 1,
            });
        }

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#4ade80'; // Neon green dots
            ctx.lineWidth = 0.5;

            // Update positions
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off walls
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw connections (synapses)
            particles.forEach((p1, i) => {
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(59, 130, 246, ${1 - distance / connectionDistance})`; // Electric blue lines
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(drawParticles);
        };

        drawParticles();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Text Animation Sequence
    useEffect(() => {
        // Show 'NEUROSCAN'
        const step1 = setTimeout(() => setAnimationStep(1), 500);
        // Show subtitle
        const step2 = setTimeout(() => setAnimationStep(2), 2000);
        // Fade out and transition
        const step3 = setTimeout(() => {
            setAnimationStep(3);
            setTimeout(() => onComplete(), 1000); // Wait for fade out
        }, 4500);

        return () => {
            clearTimeout(step1);
            clearTimeout(step2);
            clearTimeout(step3);
        };
    }, [onComplete]);

    return (
        <div style={styles.container}>
            <canvas ref={canvasRef} style={styles.canvas}></canvas>

            <div style={{ ...styles.content, opacity: animationStep === 3 ? 0 : 1 }}>
                <h1 style={{
                    ...styles.title,
                    transform: animationStep >= 1 ? 'translateY(0)' : 'translateY(50px)',
                    opacity: animationStep >= 1 ? 1 : 0
                }}>
                    NEUROSCAN
                </h1>
                <p style={{
                    ...styles.subtitle,
                    transform: animationStep >= 2 ? 'translateY(0)' : 'translateY(20px)',
                    opacity: animationStep >= 2 ? 1 : 0
                }}>
                    Advanced Cyber-Medical AI MRI Scanner
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--bg-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden'
    },
    canvas: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        opacity: 0.6
    },
    content: {
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        transition: 'opacity 1s ease-in-out'
    },
    title: {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '5rem',
        fontWeight: 800,
        letterSpacing: '4px',
        background: 'linear-gradient(135deg, #4ade80, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        transition: 'all 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
        textShadow: '0 0 30px rgba(59, 130, 246, 0.3)'
    },
    subtitle: {
        color: 'var(--text-muted)',
        fontSize: '1.2rem',
        marginTop: '1rem',
        transition: 'all 1s ease-out',
        letterSpacing: '1px'
    }
};

export default IntroAnimation;
