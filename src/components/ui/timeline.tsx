import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, Clock, AlertCircle, Phone, Mail, MessageCircle, Calendar } from 'lucide-react';

interface TimelineEvent {
  date: string;
  action: string;
  details: string;
  type: 'contact' | 'visit' | 'milestone' | 'missed';
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const timelineIcons = {
  contact: Phone,
  visit: Calendar,
  milestone: CheckCircle,
  missed: AlertCircle,
};

const timelineColors = {
  contact: 'bg-primary border-primary/20',
  visit: 'bg-success border-success/20', 
  milestone: 'bg-warning border-warning/20',
  missed: 'bg-destructive border-destructive/20',
};

export function Timeline({ events, className }: TimelineProps) {
  if (!events || events.length === 0) return null;

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-1', className)}>
        {events.slice(-6).map((event, index) => {
          const Icon = timelineIcons[event.type];
          // Calculate position along the progress bar (0-100%)
          const position = ((index + 1) / 6) * 100;
          
          return (
            <Tooltip key={index}>
              <TooltipTrigger>
                <div 
                  className={cn(
                    'absolute w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-125 cursor-pointer z-10',
                    timelineColors[event.type]
                  )}
                  style={{ 
                    left: `${position}%`, 
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <Icon className="h-2 w-2 text-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="text-xs">
                  <div className="font-medium">{event.action}</div>
                  <div className="text-muted-foreground">{event.date}</div>
                  <div className="mt-1">{event.details}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}