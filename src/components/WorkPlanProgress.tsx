import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Phone, Mail, MessageCircle, Calendar, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import type { WorkPlanStep } from './LeadCard';

interface WorkPlanProgressProps {
  currentStage: string;
  currentStep: number;
  workPlan: WorkPlanStep[];
  onExecuteStep: (stepId: string, type: WorkPlanStep['type']) => void;
  className?: string;
}

export function WorkPlanProgress({ currentStage, currentStep, workPlan, onExecuteStep, className }: WorkPlanProgressProps) {
  const getStepIcon = (type: WorkPlanStep['type']) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'text': return MessageCircle;
      case 'appointment': return Calendar;
      default: return Clock;
    }
  };

  const getStatusIcon = (status: WorkPlanStep['status']) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'overdue': return AlertTriangle;
      case 'skipped': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: WorkPlanStep['status']) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'overdue': return 'text-destructive';
      case 'skipped': return 'text-muted-foreground';
      default: return 'text-primary';
    }
  };

  const completedSteps = workPlan.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / workPlan.length) * 100;

  const currentStepData = workPlan[currentStep];
  const futureSteps = workPlan.slice(currentStep + 1);
  const overdueSteps = workPlan.filter(step => step.status === 'overdue');

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Work Plan Progress</CardTitle>
          <Badge variant="outline" className="text-xs">
            {currentStage}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>{completedSteps}/{workPlan.length} steps completed</span>
            <span>{progressPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Step */}
        {currentStepData && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-primary/10 rounded-full">
                  {React.createElement(getStepIcon(currentStepData.type), { 
                    className: "h-3 w-3 text-primary" 
                  })}
                </div>
                <span className="text-sm font-medium">Current Step</span>
                {currentStepData.status === 'overdue' && (
                  <Badge variant="destructive" className="text-xs">Overdue</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {React.createElement(getStatusIcon(currentStepData.status), { 
                  className: cn("h-3 w-3", getStatusColor(currentStepData.status))
                })}
                <span>{currentStepData.attempts || 0}/{currentStepData.maxAttempts}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm">{currentStepData.label}</p>
              {currentStepData.dueDate && (
                <p className="text-xs text-muted-foreground">Due: {currentStepData.dueDate}</p>
              )}
              
              {currentStepData.status === 'pending' && (
                <Button 
                  size="sm" 
                  onClick={() => onExecuteStep(currentStepData.id, currentStepData.type)}
                  className="w-full mt-2"
                >
                  Execute Step
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Overdue Steps Warning */}
        {overdueSteps.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                {overdueSteps.length} Overdue Steps
              </span>
            </div>
            <div className="space-y-1">
              {overdueSteps.map((step) => (
                <div key={step.id} className="flex items-center justify-between text-xs">
                  <span className="truncate">{step.label}</span>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="h-6 px-2 ml-2"
                    onClick={() => onExecuteStep(step.id, step.type)}
                  >
                    Act Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Future Steps Preview */}
        {futureSteps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Upcoming Steps</h4>
            <div className="space-y-1">
              {futureSteps.slice(0, 3).map((step, index) => (
                <div key={step.id} className="flex items-center gap-2 text-xs p-2 bg-muted/20 rounded">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span className="w-4 text-center">{currentStep + index + 2}</span>
                    {React.createElement(getStepIcon(step.type), { className: "h-3 w-3" })}
                  </div>
                  <span className="flex-1 truncate">{step.label}</span>
                  {step.dueDate && (
                    <span className="text-muted-foreground">{step.dueDate}</span>
                  )}
                </div>
              ))}
              {futureSteps.length > 3 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  +{futureSteps.length - 3} more steps
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}