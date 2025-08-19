import { useState } from 'react';
import { X, Calendar, Phone, Mail, MessageCircle, CheckCircle, Clock, AlertCircle, Target, Car, DollarSign } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type Lead } from './LeadCard';

interface LeadDetailsSlideOverProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContact: (leadId: string, method: 'phone' | 'email' | 'text') => void;
}

const journeyStages = {
  inquiry: { label: 'Inquiry', icon: '💬', color: 'bg-blue-500', description: 'Initial customer interest' },
  engaged: { label: 'Engaged', icon: '🎯', color: 'bg-teal-500', description: 'Active communication established' },
  visit: { label: 'Visit Scheduled', icon: '🏢', color: 'bg-purple-500', description: 'Customer visit arranged' },
  'test-drive': { label: 'Test Drive', icon: '🚗', color: 'bg-orange-500', description: 'Vehicle demonstration completed' },
  proposal: { label: 'Proposal Sent', icon: '📄', color: 'bg-yellow-500', description: 'Formal offer presented' },
  financing: { label: 'Financing', icon: '🏦', color: 'bg-indigo-500', description: 'Financial arrangements in progress' },
  sold: { label: 'Sold', icon: '✅', color: 'bg-green-500', description: 'Deal closed successfully' },
  delivered: { label: 'Delivered', icon: '🎉', color: 'bg-emerald-500', description: 'Vehicle delivered to customer' }
};

const statusIcons = {
  completed: CheckCircle,
  pending: Clock,
  missed: AlertCircle,
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

export function LeadDetailsSlideOver({ lead, open, onOpenChange, onContact }: LeadDetailsSlideOverProps) {
  const [selectedJourneyStage, setSelectedJourneyStage] = useState<string | null>(null);
  
  const allStages = Object.keys(journeyStages) as (keyof typeof journeyStages)[];
  const currentStageIndex = allStages.indexOf(lead.journeyStage);

  const getStageWorkPlan = (stageKey: string) => {
    // Mock work plan data for each stage - in real app this would come from the lead data
    const mockWorkPlans: Record<string, typeof lead.workPlan> = {
      inquiry: [
        {
          id: '1',
          title: 'Initial Contact',
          description: 'Make first contact within 15 minutes',
          dueDate: '2024-01-15',
          status: 'completed',
          attemptNumber: 1,
          contactMethod: 'phone'
        },
        {
          id: '2',
          title: 'Follow-up Call',
          description: 'Follow up if no response to initial contact',
          dueDate: '2024-01-16',
          status: 'completed',
          attemptNumber: 2,
          contactMethod: 'email'
        }
      ],
      engaged: [
        {
          id: '3',
          title: 'Schedule Appointment',
          description: 'Book showroom visit or test drive',
          dueDate: '2024-01-17',
          status: 'pending',
          attemptNumber: 1,
          contactMethod: 'phone'
        }
      ]
    };
    return mockWorkPlans[stageKey] || [];
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{lead.name} - Lead Details</SheetTitle>
          <SheetDescription>
            Comprehensive view of lead information and journey progress
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="customer-info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer-info">Customer Info</TabsTrigger>
              <TabsTrigger value="journey">Journey</TabsTrigger>
            </TabsList>

            <TabsContent value="customer-info" className="mt-4 space-y-4">
              {/* Customer Information Tab - Current Card Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Lead Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{lead.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-sm">{lead.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vehicle Interest</label>
                      <p className="text-sm font-semibold">{lead.vehicle}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Deal Value</label>
                      <p className="text-sm font-semibold text-success">${lead.value.toLocaleString()}</p>
                    </div>
                  </div>

                  {lead.budget && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Budget Range</label>
                      <p className="text-sm">${lead.budget.min.toLocaleString()} - ${lead.budget.max.toLocaleString()}</p>
                    </div>
                  )}

                  {lead.keyInsight && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Key Insight</label>
                      <p className="text-sm bg-primary/5 border border-primary/20 rounded p-2">{lead.keyInsight}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={() => onContact(lead.id, 'phone')}
                      className="flex-1"
                      variant="outline"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button 
                      onClick={() => onContact(lead.id, 'email')}
                      className="flex-1"
                      variant="outline"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button 
                      onClick={() => onContact(lead.id, 'text')}
                      className="flex-1"
                      variant="outline"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Text
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="journey" className="mt-4 space-y-4">
              {/* Journey Progress Tab */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Journey Progress
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Progress value={(currentStageIndex + 1) / allStages.length * 100} className="flex-1" />
                    <span className="text-sm text-muted-foreground">
                      {currentStageIndex + 1}/{allStages.length}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allStages.map((stageKey, index) => {
                      const stage = journeyStages[stageKey];
                      const isCompleted = index < currentStageIndex;
                      const isCurrent = index === currentStageIndex;
                      const isFuture = index > currentStageIndex;
                      const workPlan = getStageWorkPlan(stageKey);

                      return (
                        <div key={stageKey} className="space-y-2">
                          <div 
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                              isCompleted && "bg-success/10 border-success/20",
                              isCurrent && "bg-primary/10 border-primary/20 ring-1 ring-primary/30",
                              isFuture && "bg-muted/30 border-muted opacity-60"
                            )}
                            onClick={() => setSelectedJourneyStage(selectedJourneyStage === stageKey ? null : stageKey)}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm text-white font-medium",
                              isCompleted && "bg-success",
                              isCurrent && stage.color,
                              isFuture && "bg-muted-foreground"
                            )}>
                              {isCompleted ? <CheckCircle className="h-4 w-4" /> : stage.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{stage.label}</h4>
                                {isCurrent && (
                                  <Badge variant="secondary" className="text-xs">Current</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{stage.description}</p>
                            </div>
                            {workPlan.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {workPlan.length} tasks
                              </Badge>
                            )}
                          </div>

                          {selectedJourneyStage === stageKey && workPlan.length > 0 && (
                            <div className="ml-11 space-y-2 border-l-2 border-muted pl-4">
                              <h5 className="text-sm font-medium text-muted-foreground">Work Plan Tasks</h5>
                              {workPlan.map((task) => {
                                const StatusIcon = statusIcons[task.status];
                                const ContactIcon = contactIcons[task.contactMethod];
                                
                                return (
                                  <div 
                                    key={task.id}
                                    className={cn(
                                      'flex items-start gap-3 p-2 rounded-lg border text-xs',
                                      statusColors[task.status]
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
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}