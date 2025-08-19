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
      <div className={cn('flex items-center gap-2 py-2', className)}>
        <span className="text-xs text-muted-foreground font-medium">Timeline:</span>
        <div className="flex items-center gap-1">
          {events.slice(-6).map((event, index) => {
            const Icon = timelineIcons[event.type];
            return (
              <Tooltip key={index}>
                <TooltipTrigger>
                  <div 
                    className={cn(
                      'w-3 h-3 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-125 cursor-pointer',
                      timelineColors[event.type]
                    )}
                  >
                    <Icon className="h-1.5 w-1.5 text-white" />
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
          {events.length > 6 && (
            <span className="text-xs text-muted-foreground ml-1">+{events.length - 6}</span>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}