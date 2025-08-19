import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface WorkItemSlideOutProps {
  isTriggered: boolean;
  onComplete: () => void;
  children: React.ReactNode;
  className?: string;
}

export function WorkItemSlideOut({ isTriggered, onComplete, children, className }: WorkItemSlideOutProps) {
  const [stage, setStage] = useState<'normal' | 'sliding' | 'gone'>('normal');

  useEffect(() => {
    if (isTriggered) {
      // Start sliding out after celebration shows for a bit
      const slideTimeout = setTimeout(() => {
        setStage('sliding');
        
        // Complete after slide animation
        const completeTimeout = setTimeout(() => {
          setStage('gone');
          onComplete();
        }, 600); // Slide animation duration
        
        return () => clearTimeout(completeTimeout);
      }, 3800); // Start sliding just before celebration ends
      
      return () => clearTimeout(slideTimeout);
    }
  }, [isTriggered, onComplete]);

  if (stage === 'gone') return null;

  return (
    <div 
      className={cn(
        "transition-all duration-500 ease-in-out",
        stage === 'sliding' && "transform translate-x-full opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}