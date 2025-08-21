import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, Phone, Mail, MessageCircle, Calendar } from 'lucide-react';

interface WorkPlanTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'missed' | 'scheduled' | 'customer_replied' | 'not_needed' | 'reached_out';
  attemptNumber: number;
  contactMethod: 'phone' | 'email' | 'text';
  customerResponse?: boolean;
  journeyStage: string;
}

interface WorkPlanProgressProps {
  tasks: WorkPlanTask[];
  journeyStage: string;
  currentLeadStage?: string;
  className?: string;
  showCurrentOnly?: boolean;
  onContactMethodClick?: (method: 'phone' | 'email' | 'text', task: WorkPlanTask) => void;
  onExpandToggle?: () => void;
  isExpanded?: boolean;
}

const statusIcons = {
  completed: CheckCircle,
  pending: Clock,
  missed: AlertTriangle,
  scheduled: Calendar,
  customer_replied: CheckCircle,
  not_needed: Clock,
  reached_out: MessageCircle,
};

const statusColors = {
  completed: 'text-success bg-success/10 border-success/20',
  pending: 'text-primary bg-primary/10 border-primary/20 ring-2 ring-primary/20',
  missed: 'text-destructive bg-destructive/10 border-destructive/20',
  scheduled: 'text-muted-foreground bg-muted/10 border-muted/20',
  customer_replied: 'text-success bg-gradient-to-r from-success/10 to-success/5 border-success/30',
  not_needed: 'text-muted-foreground/60 bg-muted/5 border-muted/10',
  reached_out: 'text-warning bg-warning/10 border-warning/20',
};

const contactIcons = {
  phone: Phone,
  email: Mail,
  text: MessageCircle,
};

export function WorkPlanProgress({ 
  tasks, 
  journeyStage, 
  currentLeadStage, 
  className, 
  showCurrentOnly = false,
  onContactMethodClick,
  onExpandToggle,
  isExpanded = false 
}: WorkPlanProgressProps) {
  const isViewingCurrentStage = !currentLeadStage || journeyStage.toLowerCase() === currentLeadStage.toLowerCase();
  const stageOrder = ['engaged', 'visit', 'proposal', 'sold', 'delivered'];
  const currentStageIndex = stageOrder.indexOf(currentLeadStage?.toLowerCase() || '');
  const viewingStageIndex = stageOrder.indexOf(journeyStage.toLowerCase());
  const isViewingCompletedStage = currentStageIndex !== -1 && viewingStageIndex !== -1 && viewingStageIndex < currentStageIndex;

  // Generate mock historical data for completed stages
  const getHistoricalTasks = (stage: string): WorkPlanTask[] => {
    const baseId = `${stage}_task`;
    const mockTasks: WorkPlanTask[] = [
      {
        id: `${baseId}_1`,
        title: `${stage.charAt(0).toUpperCase() + stage.slice(1)} Attempt 1`,
        description: stage === 'engaged' 
          ? 'Initial contact to gauge interest and schedule visit'
          : stage === 'visit'
          ? 'Call to discuss budget and payment options'  
          : 'Follow up on proposal details',
        dueDate: 'Today',
        status: 'customer_replied', // First attempt succeeded
        attemptNumber: 1,
        contactMethod: 'phone' as const,
        customerResponse: true,
        journeyStage: stage
      },
      {
        id: `${baseId}_2`,
        title: `${stage.charAt(0).toUpperCase() + stage.slice(1)} Attempt 2`, 
        description: stage === 'engaged'
          ? 'Email current inventory and pricing'
          : stage === 'visit'
          ? 'Email current inventory and pricing'
          : 'Send detailed proposal document',
        dueDate: 'Tomorrow',
        status: 'not_needed', // Not needed since customer replied on attempt 1
        attemptNumber: 2,
        contactMethod: 'email' as const,
        journeyStage: stage
      },
      {
        id: `${baseId}_3`,
        title: `${stage.charAt(0).toUpperCase() + stage.slice(1)} Attempt 3`,
        description: stage === 'engaged'
          ? 'Text to schedule viewing appointment' 
          : stage === 'visit'
          ? 'Text to schedule viewing appointment'
          : 'Final follow-up call',
        dueDate: 'Day 3',
        status: 'not_needed', // Not needed since customer replied on attempt 1
        attemptNumber: 3,
        contactMethod: 'text' as const,
        journeyStage: stage
      }
    ];
    
    return mockTasks;
  };

  // Use historical tasks for completed stages, otherwise filter current tasks
  const displayTasks = isViewingCompletedStage 
    ? getHistoricalTasks(journeyStage)
    : tasks.filter(t => t.journeyStage.toLowerCase() === journeyStage.toLowerCase());

  if (!displayTasks || displayTasks.length === 0) return null;

  const completedCount = displayTasks.filter(t => t.status === 'completed' || t.status === 'customer_replied').length;
  const reachedOutCount = displayTasks.filter(t => t.status === 'reached_out').length;
  const missedCount = displayTasks.filter(t => t.status === 'missed').length;
  const customerReplied = displayTasks.some(t => t.status === 'customer_replied');
  const currentTask = displayTasks.find(t => t.status === 'pending');
  
  // If customer replied, mark tasks after the replied task as not needed (greyed out)
  let customerRepliedIndex = -1;
  if (customerReplied) {
    customerRepliedIndex = displayTasks.findIndex(t => t.status === 'customer_replied');
  }
  
  const finalDisplayTasks = customerReplied 
    ? displayTasks.map((task, index) => {
        if (task.status === 'customer_replied') return task;
        if (index > customerRepliedIndex) return { ...task, status: 'not_needed' as const };
        return task;
      })
    : displayTasks;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Work Plan ({journeyStage}) 
            {!isViewingCurrentStage && (
              <span className="ml-1 text-xs">
                {isViewingCompletedStage ? '✅ Completed' : '⏳ Future'}
              </span>
            )}
          </span>
          {customerReplied ? (
            <Badge className="text-xs bg-success text-white">
              ✅ Customer Responded - Stage Complete!
            </Badge>
          ) : reachedOutCount > 0 ? (
            <Badge variant="outline" className="text-xs text-warning border-warning">
              📤 Reached Out - Waiting Response ({reachedOutCount})
            </Badge>
          ) : currentTask ? (
            <Badge variant="outline" className="text-xs text-primary border-primary">
              → Attempt #{currentTask.attemptNumber}/3 pending
            </Badge>
          ) : isViewingCompletedStage ? (
            <Badge className="text-xs bg-success text-white">
              ✅ Completed Successfully
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              {completedCount}/{displayTasks.length} completed
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
        {finalDisplayTasks.map((task) => {
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
                     task.status === 'reached_out' ? `📤 Reached Out - Attempt ${task.attemptNumber}/3 (Waiting Response)` :
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
                   task.status === 'reached_out' ? 'Message sent successfully - waiting for customer response (~15 seconds)' :
                   task.status === 'pending' ? `Next: ${task.description}` :
                   task.status === 'not_needed' ? 'Customer responded on earlier attempt - this step was not needed.' :
                   task.description}
                </p>
                
                {/* Contact Method Icons */}
                <div className="flex items-center gap-1 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onContactMethodClick?.('phone', task);
                    }}
                    title="Make phone call"
                  >
                    <Phone className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onContactMethodClick?.('email', task);
                    }}
                    title="Send email"
                  >
                    <Mail className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onContactMethodClick?.('text', task);
                    }}
                    title="Send text message"
                  >
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                </div>
                
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

      {displayTasks.length === 3 && !customerReplied && !isViewingCompletedStage && (
        <div className="text-xs text-muted-foreground text-center">
          3 attempts planned for {journeyStage} stage - goal is customer response
        </div>
      )}
      
      {customerReplied && !isViewingCompletedStage && (
        <div className="text-xs text-center p-2 bg-success/5 border border-success/20 rounded-md">
          <span className="text-success font-medium">🎉 {journeyStage.charAt(0).toUpperCase() + journeyStage.slice(1)} Stage Complete!</span>
          <span className="text-muted-foreground ml-1">Customer responded - moving to next stage</span>
        </div>
      )}
    </div>
  );
}