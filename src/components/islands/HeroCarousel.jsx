import React, { useEffect, useRef, useState } from 'react';

const baseImages = [
  '/assets/cover.webp',
  '/assets/plate-01.webp',
  '/assets/plate-02.webp',
  '/assets/plate-03.webp',
  '/assets/plate-04.webp',
  '/assets/plate-05.webp',
  '/assets/master.webp',
  '/assets/cover.png'
];
const images = [...baseImages, ...baseImages];

export default function HeroCarousel() {
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const requestRef = useRef();
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    const animate = (time) => {
      const delta = time - lastTimeRef.current;
      if (!isHovered) {
        setRotation(prev => (prev - (delta * 0.003)) % 360);
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isHovered]);

  const theta = 360 / images.length;
  // Concave curve (viewer inside). Radius 650 spreads the cards out safely.
  const radius = 650;

  return (
    <div className="hero-carousel__scene" 
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
         onTouchStart={() => setIsHovered(true)}
         onTouchEnd={() => setIsHovered(false)}>
      <div 
        className="hero-carousel__spinner"
        style={{ transform: `translateZ(${radius}px) rotateY(${rotation}deg)` }}
      >
        {images.map((src, i) => {
          let worldAngle = (rotation + (i * theta)) % 360;
          if (worldAngle < -180) worldAngle += 360;
          if (worldAngle > 180) worldAngle -= 360;
          
          // Cull cards only when completely out of view to avoid popping or delayed fades
          const isVisible = Math.abs(worldAngle) < 100;

          return (
            <div 
              key={i} 
              className="hero-carousel__card"
              style={{ 
                transform: `rotateY(${i * theta}deg) translateZ(${-radius}px)`,
                visibility: isVisible ? 'visible' : 'hidden'
              }}
            >
              <img src={src} alt="Exposition Artwork" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
