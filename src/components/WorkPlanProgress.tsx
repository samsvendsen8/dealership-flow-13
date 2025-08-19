import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, Phone, Mail, MessageCircle, Calendar } from 'lucide-react';

interface WorkPlanTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'missed' | 'scheduled' | 'customer_replied' | 'not_needed';
  attemptNumber: number;
  contactMethod: 'phone' | 'email' | 'text';
  customerResponse?: boolean;
  journeyStage: string;
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
  not_needed: Clock,
};

const statusColors = {
  completed: 'text-success bg-success/10 border-success/20',
  pending: 'text-primary bg-primary/10 border-primary/20 ring-2 ring-primary/20',
  missed: 'text-destructive bg-destructive/10 border-destructive/20',
  scheduled: 'text-muted-foreground bg-muted/10 border-muted/20',
  customer_replied: 'text-success bg-gradient-to-r from-success/10 to-success/5 border-success/30',
  not_needed: 'text-muted-foreground/60 bg-muted/5 border-muted/10',
};

const contactIcons = {
  phone: Phone,
  email: Mail,
  text: MessageCircle,
};

export function WorkPlanProgress({ tasks, journeyStage, className }: WorkPlanProgressProps) {
  if (!tasks || tasks.length === 0) return null;

  // Filter tasks for current journey stage (case insensitive)
  const currentStageTasks = tasks.filter(t => t.journeyStage.toLowerCase() === journeyStage.toLowerCase());
  const completedCount = currentStageTasks.filter(t => t.status === 'completed' || t.status === 'customer_replied').length;
  const missedCount = currentStageTasks.filter(t => t.status === 'missed').length;
  const customerReplied = currentStageTasks.some(t => t.status === 'customer_replied');
  const currentTask = currentStageTasks.find(t => t.status === 'pending');
  
  // If customer replied, mark tasks after the replied task as not needed (greyed out)
  let customerRepliedIndex = -1;
  if (customerReplied) {
    customerRepliedIndex = currentStageTasks.findIndex(t => t.status === 'customer_replied');
  }
  
  const displayTasks = customerReplied 
    ? currentStageTasks.map((task, index) => {
        if (task.status === 'customer_replied') return task;
        if (index > customerRepliedIndex) return { ...task, status: 'not_needed' as const };
        return task;
      })
    : currentStageTasks;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Work Plan ({journeyStage})</span>
          {customerReplied ? (
            <Badge className="text-xs bg-success text-white">
              ✅ Customer Responded - Stage Complete!
            </Badge>
          ) : currentTask ? (
            <Badge variant="outline" className="text-xs text-primary border-primary">
              → Attempt #{currentTask.attemptNumber}/3 pending
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              {completedCount}/{currentStageTasks.length} completed
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
        {displayTasks.map((task) => {
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
                     task.status === 'pending' ? `🎯 ${journeyStage.charAt(0).toUpperCase() + journeyStage.slice(1)} - Attempt ${task.attemptNumber}/3` :
                     task.status === 'not_needed' ? `⚫ Attempt ${task.attemptNumber}/3 (not needed)` :
                     `Attempt ${task.attemptNumber}/3: ${task.contactMethod} contact`}
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    {task.dueDate}
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {task.status === 'customer_replied' ? 'Goal achieved! Customer responded - stage complete, moving to next journey step.' :
                   task.status === 'pending' ? `Next: ${task.description}` :
                   task.status === 'not_needed' ? 'Customer responded on earlier attempt - this step was not needed.' :
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

      {currentStageTasks.length === 3 && !customerReplied && (
        <div className="text-xs text-muted-foreground text-center">
          3 attempts planned for {journeyStage} stage - goal is customer response
        </div>
      )}
      
      {customerReplied && (
        <div className="text-xs text-center p-2 bg-success/5 border border-success/20 rounded-md">
          <span className="text-success font-medium">🎉 {journeyStage.charAt(0).toUpperCase() + journeyStage.slice(1)} Stage Complete!</span>
          <span className="text-muted-foreground ml-1">Customer responded - moving to next stage</span>
        </div>
      )}
    </div>
  );
}