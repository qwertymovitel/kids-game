import React, { useEffect, useState } from 'react';

const Confetti: React.FC = () => {
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    // Create 50 particles
    setParticles(Array.from({ length: 50 }, (_, i) => i));
    
    const timer = setTimeout(() => {
        setParticles([]);
    }, 3000); // Stop after 3s

    return () => clearTimeout(timer);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((i) => {
        const left = Math.random() * 100;
        const animationDuration = 2 + Math.random() * 3;
        const bg = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)];
        
        return (
          <div
            key={i}
            className="confetti rounded-full"
            style={{
              left: `${left}%`,
              top: '-20px',
              backgroundColor: bg,
              animationDuration: `${animationDuration}s`,
              animationDelay: `${Math.random()}s`
            }}
          />
        );
      })}
    </div>
  );
};

export default Confetti;