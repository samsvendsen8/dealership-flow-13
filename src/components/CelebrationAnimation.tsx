import React, { useEffect, useState } from 'react';
import { CheckCircle, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CelebrationAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
  message?: string;
}

export function CelebrationAnimation({ isVisible, onComplete, message = "Great work!" }: CelebrationAnimationProps) {
  const [stage, setStage] = useState<'hidden' | 'entering' | 'celebrating' | 'exiting'>('hidden');

  useEffect(() => {
    if (isVisible) {
      setStage('entering');
      
      // Progress through animation stages
      const timeouts = [
        setTimeout(() => setStage('celebrating'), 100),
        setTimeout(() => setStage('exiting'), 1500),
        setTimeout(() => {
          setStage('hidden');
          onComplete();
        }, 2000)
      ];

      return () => timeouts.forEach(clearTimeout);
    }
  }, [isVisible, onComplete]);

  if (!isVisible && stage === 'hidden') return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none",
        "bg-gradient-to-r from-success/10 via-primary/10 to-success/10",
        stage === 'entering' && "animate-fade-in",
        stage === 'exiting' && "animate-fade-out"
      )}
    >
      {/* Celebration particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-2 h-2 bg-success rounded-full",
              stage === 'celebrating' && "animate-bounce"
            )}
            style={{
              left: `${20 + (i * 10)}%`,
              top: `${30 + (i % 2) * 20}%`,
              animationDelay: `${i * 100}ms`,
              animationDuration: '1s'
            }}
          />
        ))}
        
        {/* Stars */}
        {[...Array(5)].map((_, i) => (
          <Star
            key={`star-${i}`}
            className={cn(
              "absolute w-6 h-6 text-primary/60",
              stage === 'celebrating' && "animate-pulse"
            )}
            style={{
              left: `${15 + (i * 15)}%`,
              top: `${25 + (i % 3) * 15}%`,
              animationDelay: `${i * 150}ms`
            }}
          />
        ))}
      </div>

      {/* Main celebration content */}
      <div 
        className={cn(
          "text-center space-y-4 p-8 rounded-xl bg-card/95 backdrop-blur-sm border border-success/20 shadow-2xl",
          stage === 'celebrating' && "animate-scale-in"
        )}
      >
        <div 
          className={cn(
            "flex justify-center",
            stage === 'celebrating' && "animate-bounce"
          )}
        >
          <div className="relative">
            <CheckCircle className="w-16 h-16 text-success" />
            <Zap className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-pulse" />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-success mb-2">Task Complete! 🎉</h2>
          <p className="text-lg text-foreground">{message}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Moving to next priority lead...
          </p>
        </div>
        
        {/* Progress indication */}
        <div className="flex justify-center">
          <div className={cn(
            "w-20 h-1 bg-success/20 rounded-full overflow-hidden",
          )}>
            <div 
              className={cn(
                "h-full bg-gradient-to-r from-success to-primary rounded-full transition-all duration-1000",
                stage === 'celebrating' ? "w-full" : "w-0"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}