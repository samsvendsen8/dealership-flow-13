import React, { useEffect, useState } from 'react';
import { CheckCircle, Star, Zap, Sparkles, Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScreenCelebrationProps {
  isVisible: boolean;
  onComplete: () => void;
  message?: string;
  type?: 'communication' | 'task' | 'achievement';
}

export function ScreenCelebration({ 
  isVisible, 
  onComplete, 
  message = "Great job!", 
  type = 'communication' 
}: ScreenCelebrationProps) {
  const [stage, setStage] = useState<'hidden' | 'entering' | 'celebrating' | 'exiting'>('hidden');

  useEffect(() => {
    if (isVisible) {
      setStage('entering');
      
      // Progress through animation stages
      const timeouts = [
        setTimeout(() => setStage('celebrating'), 150),
        setTimeout(() => setStage('exiting'), 2500), // Show for 2.35 seconds
        setTimeout(() => {
          setStage('hidden');
          onComplete();
        }, 3000) // Total 3 seconds
      ];

      return () => timeouts.forEach(clearTimeout);
    }
  }, [isVisible, onComplete]);

  if (!isVisible && stage === 'hidden') return null;

  const getIcon = () => {
    switch (type) {
      case 'task':
        return <Trophy className="w-20 h-20 text-primary" />;
      case 'achievement':
        return <Target className="w-20 h-20 text-success" />;
      default:
        return <CheckCircle className="w-20 h-20 text-success" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'task':
        return {
          bg: 'from-primary/20 via-primary/10 to-primary/20',
          particles: 'bg-primary',
          border: 'border-primary/30'
        };
      case 'achievement':
        return {
          bg: 'from-success/20 via-success/10 to-success/20',
          particles: 'bg-success',
          border: 'border-success/30'
        };
      default:
        return {
          bg: 'from-success/20 via-primary/10 to-success/20',
          particles: 'bg-success',
          border: 'border-success/30'
        };
    }
  };

  const colors = getColors();

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none",
        `bg-gradient-to-r ${colors.bg}`,
        stage === 'entering' && "animate-fade-in",
        stage === 'exiting' && "animate-fade-out"
      )}
    >
      {/* Celebration particles - more spread out */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={cn(
              `absolute w-3 h-3 ${colors.particles} rounded-full`,
              stage === 'celebrating' && "animate-bounce"
            )}
            style={{
              left: `${10 + (i * 7)}%`,
              top: `${20 + (i % 4) * 20}%`,
              animationDelay: `${i * 150}ms`,
              animationDuration: '1.5s'
            }}
          />
        ))}
        
        {/* Sparkles */}
        {[...Array(8)].map((_, i) => (
          <Sparkles
            key={`sparkle-${i}`}
            className={cn(
              "absolute w-5 h-5 text-primary/70",
              stage === 'celebrating' && "animate-pulse"
            )}
            style={{
              left: `${15 + (i * 10)}%`,
              top: `${25 + (i % 3) * 20}%`,
              animationDelay: `${i * 200}ms`,
              animationDuration: '2s'
            }}
          />
        ))}
        
        {/* Stars */}
        {[...Array(6)].map((_, i) => (
          <Star
            key={`star-${i}`}
            className={cn(
              "absolute w-6 h-6 text-warning fill-warning/20",
              stage === 'celebrating' && "animate-spin"
            )}
            style={{
              left: `${20 + (i * 12)}%`,
              top: `${30 + (i % 2) * 25}%`,
              animationDelay: `${i * 300}ms`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

      {/* Main celebration content */}
      <div 
        className={cn(
          "text-center space-y-6 p-10 rounded-2xl bg-background/95 backdrop-blur-md shadow-2xl",
          `border-2 ${colors.border}`,
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
            {getIcon()}
            <Zap className="absolute -top-3 -right-3 w-8 h-8 text-warning animate-pulse" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-primary/20 rounded-full animate-ping" />
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent mb-3">
            {type === 'task' ? '🎯 Task Complete!' : 
             type === 'achievement' ? '🏆 Achievement!' : 
             '🚀 Communication Sent!'}
          </h2>
          <p className="text-xl text-foreground font-medium">{message}</p>
          <p className="text-base text-muted-foreground mt-3">
            {stage === 'celebrating' ? 'Keep up the momentum! 💪' : 'Moving to next priority...'}
          </p>
        </div>
        
        {/* Animated progress indication */}
        <div className="flex justify-center">
          <div className="w-32 h-2 bg-muted/30 rounded-full overflow-hidden">
            <div 
              className={cn(
                `h-full bg-gradient-to-r from-success to-primary rounded-full transition-all ease-out`,
                stage === 'celebrating' ? "w-full duration-[2200ms]" : "w-0 duration-300"
              )}
            />
          </div>
        </div>
      </div>

      {/* Extra floating elements for more pizzazz */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={`float-${i}`}
            className={cn(
              "absolute opacity-60",
              stage === 'celebrating' && "animate-bounce"
            )}
            style={{
              left: `${25 + i * 20}%`,
              top: `${15 + i * 15}%`,
              animationDelay: `${i * 400}ms`,
              animationDuration: '2s'
            }}
          >
            <div className="text-4xl">
              {['🎉', '⚡', '🔥', '💫'][i]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}