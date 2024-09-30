import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import ReactConfetti from 'react-confetti';

const Confetti = forwardRef(({ duration = 5000 }, ref) => {
  const [isActive, setIsActive] = useState(false);
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setIsActive(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration]);

  useImperativeHandle(ref, () => ({
    triggerConfetti: () => {
      setIsActive(true);
    }
  }));

  return (
    <>
      {isActive && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5000000 }}>
          <ReactConfetti
            width={size.width}
            height={size.height}
            recycle={false}
            numberOfPieces={200}
          />
        </div>
      )}
    </>
  );
});

export default Confetti;