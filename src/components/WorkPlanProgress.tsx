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
  completed: 'text-white bg-success border-success shadow-md',
  pending: 'text-white bg-primary border-primary shadow-md ring-2 ring-primary/30',
  missed: 'text-white bg-destructive border-destructive shadow-md',
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
        {currentTasks.map((task, index) => {
          const StatusIcon = statusIcons[task.status];
          const ContactIcon = contactIcons[task.contactMethod];
          
          // Mock response data for completed tasks
          const getCompletedStatus = () => {
            if (task.status === 'completed' && index === 0) {
              return { hasResponse: true, responseType: 'positive', message: 'Customer responded: "Interested! Can we meet Saturday?"' };
            } else if (task.status === 'completed') {
              return { hasResponse: false, responseType: 'no-response', message: 'No response received' };
            }
            return null;
          };
          
          const completedStatus = getCompletedStatus();
          
          return (
            <div 
              key={task.id} 
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border text-xs transition-all duration-200',
                statusColors[task.status]
              )}
            >
              <div className="flex items-center gap-1 mt-0.5 flex-shrink-0">
                <StatusIcon className="h-3 w-3" />
                <ContactIcon className="h-2.5 w-2.5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("font-medium truncate", task.status === 'pending' ? 'text-white' : '')}>
                    {task.status === 'pending' && '→ '} Attempt #{task.attemptNumber}: {task.title}
                  </span>
                  <span className={cn("whitespace-nowrap text-xs", 
                    task.status === 'pending' ? 'text-white/80' : 'text-muted-foreground'
                  )}>
                    {task.dueDate}
                  </span>
                </div>
                <p className={cn("mt-0.5 text-xs", 
                  task.status === 'pending' ? 'text-white/90' : 'text-muted-foreground'
                )}>
                  {task.description}
                </p>
                
                {/* Status badges for completed tasks */}
                {completedStatus && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge 
                      variant={completedStatus.hasResponse ? "default" : "secondary"}
                      className={cn("text-xs", 
                        completedStatus.hasResponse 
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      )}
                    >
                      {completedStatus.hasResponse ? '✓ Contact Made' : '○ No Response'}
                    </Badge>
                  </div>
                )}
                
                {/* Show customer message for positive responses */}
                {completedStatus?.hasResponse && (
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs">
                    <span className="text-emerald-700 font-medium">Customer Response:</span>
                    <p className="text-emerald-600 mt-1">{completedStatus.message}</p>
                  </div>
                )}
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