import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, Phone, Mail, MessageCircle, Calendar } from 'lucide-react';

interface WorkPlanTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'missed' | 'scheduled';
  attemptNumber: number;
  contactMethod: 'phone' | 'email' | 'text';
}

interface WorkPlanProgressProps {
  tasks: WorkPlanTask[];
  journeyStage: string;
  className?: string;
}

const statusIcons = {
  completed: CheckCircle,
  pending: Clock,
  missed: AlertTriangle,
  scheduled: Calendar,
};

const statusColors = {
  completed: 'text-success bg-success/10 border-success/20',
  pending: 'text-warning bg-warning/10 border-warning/20',
  missed: 'text-destructive bg-destructive/10 border-destructive/20',
  scheduled: 'text-primary bg-primary/10 border-primary/20',
};

const contactIcons = {
  phone: Phone,
  email: Mail,
  text: MessageCircle,
};

export function WorkPlanProgress({ tasks, journeyStage, className }: WorkPlanProgressProps) {
  if (!tasks || tasks.length === 0) return null;

  const currentTasks = tasks.slice(0, 3); // Show next 3 tasks
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const missedCount = tasks.filter(t => t.status === 'missed').length;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Work Plan ({journeyStage})</span>
          <Badge variant="outline" className="text-xs">
            {completedCount}/{tasks.length} completed
          </Badge>
        </div>
        {missedCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            {missedCount} missed
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {currentTasks.map((task) => {
          const StatusIcon = statusIcons[task.status];
          const ContactIcon = contactIcons[task.contactMethod];
          
          return (
            <div 
              key={task.id} 
              className={cn(
                'flex items-start gap-3 p-2 rounded-lg border text-xs transition-all duration-200',
                statusColors[task.status],
                task.status === 'pending' && 'ring-1 ring-primary/30'
              )}
            >
              <div className="flex items-center gap-1 mt-0.5">
                <StatusIcon className="h-3 w-3" />
                <ContactIcon className="h-2.5 w-2.5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">
                    Attempt #{task.attemptNumber}: {task.title}
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    {task.dueDate}
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {task.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length > 3 && (
        <div className="text-xs text-muted-foreground text-center">
          +{tasks.length - 3} more tasks in this stage
        </div>
      )}
    </div>
  );
}