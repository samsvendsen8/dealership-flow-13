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
      <div className={cn('relative flex items-center', className)}>
        {events.map((event, index) => {
          const Icon = timelineIcons[event.type];
          // Evenly distribute dots across the timeline
          const position = events.length > 1 ? (index / (events.length - 1)) * 100 : 50;
          
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div 
                  className={cn(
                    'absolute w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer z-10',
                    timelineColors[event.type]
                  )}
                  style={{ 
                    left: `${Math.min(Math.max(position, 3), 97)}%`, 
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <Icon className="h-3 w-3 text-white" />
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