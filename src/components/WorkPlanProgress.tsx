import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, Phone, Mail, MessageCircle, Calendar } from 'lucide-react';

interface WorkPlanTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'missed' | 'scheduled' | 'customer_replied';
  attemptNumber: number;
  contactMethod: 'phone' | 'email' | 'text';
  customerResponse?: boolean;
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
  customer_replied: CheckCircle,
};

const statusColors = {
  completed: 'text-success bg-success/10 border-success/20',
  pending: 'text-primary bg-primary/10 border-primary/20 ring-2 ring-primary/20',
  missed: 'text-destructive bg-destructive/10 border-destructive/20',
  scheduled: 'text-muted-foreground bg-muted/10 border-muted/20',
  customer_replied: 'text-success bg-gradient-to-r from-success/10 to-success/5 border-success/30',
};

const contactIcons = {
  phone: Phone,
  email: Mail,
  text: MessageCircle,
};

export function WorkPlanProgress({ tasks, journeyStage, className }: WorkPlanProgressProps) {
  if (!tasks || tasks.length === 0) return null;

  const currentTasks = tasks.slice(0, 3); // Show next 3 tasks
  const completedCount = tasks.filter(t => t.status === 'completed' || t.status === 'customer_replied').length;
  const missedCount = tasks.filter(t => t.status === 'missed').length;
  const customerReplied = tasks.some(t => t.status === 'customer_replied');
  const currentTask = tasks.find(t => t.status === 'pending');

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Work Plan ({journeyStage})</span>
          {customerReplied ? (
            <Badge className="text-xs bg-success text-white">
              ✅ Customer Responded!
            </Badge>
          ) : currentTask ? (
            <Badge variant="outline" className="text-xs text-primary border-primary">
              → Attempt #{currentTask.attemptNumber} pending
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              {completedCount}/{tasks.length} completed
            </Badge>
          )}
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
                    {task.status === 'customer_replied' ? '✅ Customer Replied!' : 
                     task.status === 'pending' ? `🎯 Attempt #${task.attemptNumber}: ${task.title}` :
                     `Attempt #${task.attemptNumber}: ${task.title}`}
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    {task.dueDate}
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {task.status === 'customer_replied' ? 'Goal achieved! Customer responded to outreach.' :
                   task.status === 'pending' ? `Next action: ${task.description} - Keep trying until customer responds` :
                   task.description}
                </p>
                {task.status === 'customer_replied' && (
                  <Badge className="mt-1 text-xs bg-success/20 text-success border-success/30">
                    Journey continues to next stage
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length > 3 && !customerReplied && (
        <div className="text-xs text-muted-foreground text-center">
          +{tasks.length - 3} more attempts planned until customer responds
        </div>
      )}
      
      {customerReplied && (
        <div className="text-xs text-center p-2 bg-success/5 border border-success/20 rounded-md">
          <span className="text-success font-medium">🎉 Stage Complete!</span>
          <span className="text-muted-foreground ml-1">Customer responded - ready for next journey stage</span>
        </div>
      )}
    </div>
  );
}