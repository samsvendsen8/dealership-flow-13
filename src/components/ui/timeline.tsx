import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

interface TimelineDotProps {
  stage: string;
  date: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isOverdue?: boolean;
  workPlanProgress?: {
    completed: number;
    total: number;
    overdue: number;
  };
}

export function TimelineDot({ stage, date, isCompleted, isCurrent, isOverdue, workPlanProgress }: TimelineDotProps) {
  const getDotIcon = () => {
    if (isCompleted) return <CheckCircle className="h-3 w-3" />;
    if (isOverdue) return <AlertCircle className="h-3 w-3" />;
    if (isCurrent) return <Clock className="h-3 w-3" />;
    return <div className="h-3 w-3 rounded-full border-2 border-muted" />;
  };

  const getDotColor = () => {
    if (isCompleted) return 'bg-success text-white';
    if (isOverdue) return 'bg-destructive text-white';
    if (isCurrent) return 'bg-primary text-white';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className={cn(
          'relative w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110',
          getDotColor()
        )}>
          {getDotIcon()}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm">{stage}</h4>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
          
          {workPlanProgress && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground">Work Plan Progress</h5>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {workPlanProgress.completed}/{workPlanProgress.total} completed
                </Badge>
                {workPlanProgress.overdue > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {workPlanProgress.overdue} overdue
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-xs">
            {isCompleted && <span className="text-success">✅ Completed</span>}
            {isCurrent && <span className="text-primary">🔄 Current Stage</span>}
            {isOverdue && <span className="text-destructive">⚠️ Overdue</span>}
            {!isCompleted && !isCurrent && !isOverdue && <span className="text-muted-foreground">⏳ Upcoming</span>}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

interface TimelineProps {
  journeyData: Array<{
    stage: string;
    date: string;
    isCompleted: boolean;
    isCurrent: boolean;
    isOverdue?: boolean;
    workPlanProgress?: {
      completed: number;
      total: number;
      overdue: number;
    };
  }>;
  className?: string;
}

export function Timeline({ journeyData, className }: TimelineProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {journeyData.map((item, index) => (
        <React.Fragment key={index}>
          <TimelineDot {...item} />
          {index < journeyData.length - 1 && (
            <div className="flex-1 h-px bg-border min-w-4" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}