import { useState, useCallback, useEffect } from 'react';

export const useShake = () => {
  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
    }, 400); // 400ms duration
  }, []);

  return { isShaking, triggerShake, shakeClass: isShaking ? 'animate-shake' : '' };
};
