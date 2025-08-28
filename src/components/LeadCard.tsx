import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, Eye, Calendar, Clock, TrendingUp, MapPin, DollarSign, User, Zap, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { WorkPlanProgress } from './WorkPlanProgress';
import { CustomerHistoryTimeline } from './CustomerHistoryTimeline';
import { QuickHistoryToggle } from './QuickHistoryToggle';
import { JourneyAdvanceButton } from './JourneyAdvanceButton';
import { InlineActionForm } from './InlineActionForm';
import { cn } from '@/lib/utils';

interface Budget {
  min: number;
  max: number;
}

interface TimelineEvent {
  date: string;
  action: string;
  details: string;
  type: 'contact' | 'visit' | 'milestone';
}

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

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  priority: 'hot' | 'warm' | 'cold';
  lastActivity: string;
  value: number;
  source: string;
  timeOnLot?: string;
  notes?: string;
  journeyStage: 'engaged' | 'visit' | 'proposal' | 'sold' | 'delivered';
  stageProgress: number;
  contactAttempts: number;
  responseRate: number;
  daysSinceLastContact: number;
  nextFollowUp: string;
  dealProbability: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  lastAppointment: string;
  keyInsight?: string;
  preferredContact: 'phone' | 'email' | 'text';
  budget: Budget;
  timeline?: TimelineEvent[];
  workPlan?: WorkPlanTask[];
  tradeInVehicle?: string;
}

interface LeadCardProps {
  lead: Lead;
  onContact: (leadId: string, method: 'phone' | 'email' | 'text') => void;
  onViewDetails: (leadId: string) => void;
  onOpenNotificationPanel?: (leadId: string, method: 'phone' | 'email' | 'text') => void;
  onTaskCompleted?: (leadId: string) => void;
  onCommunicationSent?: (leadId: string, method: 'phone' | 'email' | 'text') => void;
  isCondensed?: boolean;
  isFocused?: boolean;
  showRedBackground?: boolean; // New prop to control red background
}

export default function LeadCard({ 
  lead, 
  onContact, 
  onViewDetails, 
  onOpenNotificationPanel,
  onTaskCompleted,
  onCommunicationSent,
  isCondensed = false,
  isFocused = false,
  showRedBackground = false // Default to false
}: LeadCardProps) {
  const [isExpanded, setIsExpanded] = useState(!isCondensed);
  const [showInlineAction, setShowInlineAction] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hot': return 'text-hot-lead border-hot-lead';
      case 'warm': return 'text-warm-lead border-warm-lead';
      case 'cold': return 'text-cold-lead border-cold-lead';
      default: return 'text-muted-foreground border-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-500 border-blue-500';
      case 'contacted': return 'text-purple-500 border-purple-500';
      case 'qualified': return 'text-green-500 border-green-500';
      case 'closed': return 'text-gray-500 border-gray-500';
      default: return 'text-muted-foreground border-muted';
    }
  };

  // Check if customer has reached out recently
  const hasCustomerReachOut = lead.lastActivity.includes('Just replied') || 
                             lead.lastActivity.includes('Customer replied') ||
                             lead.lastActivity.includes('replied with questions') ||
                             lead.workPlan?.some(task => task.status === 'customer_replied');

  // Check if work plan is complete
  const isWorkPlanComplete = lead.workPlan?.every(task => 
    task.status === 'completed' || 
    task.status === 'customer_replied' || 
    task.status === 'not_needed'
  );

  // Get current work plan task
  const currentWorkPlanTask = lead.workPlan?.find(task => task.status === 'pending');

  // Get upcoming work plan tasks
  const upcomingWorkPlanTasks = lead.workPlan?.filter(task => 
    task.status === 'scheduled' || 
    (task.status === 'pending' && task !== currentWorkPlanTask)
  ).slice(0, 2);

  return (
    <Card 
      className={cn(
        'transition-all duration-300 hover:shadow-lg border-2',
        isFocused && 'ring-2 ring-primary ring-offset-2',
        showRedBackground && lead.priority === 'hot' && 'bg-hot-lead/5 border-hot-lead/30',
        isCondensed ? 'mb-2' : 'mb-6'
      )}
      data-lead-id={lead.id}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            {lead.name}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {lead.vehicle}
            </span>
            <Badge variant="secondary" className="text-xs">
              {lead.source}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor(lead.status)}>
            {lead.status}
          </Badge>
          <Badge variant="outline" className={getPriorityColor(lead.priority)}>
            {lead.priority}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Journey Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Journey Progress</span>
            <Badge variant="outline" className="text-xs">
              {lead.journeyStage} • {lead.stageProgress}%
            </Badge>
          </div>
          <Progress value={lead.stageProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Engaged</span>
            <span>Visit</span>
            <span>Proposal</span>
            <span>Sold</span>
            <span>Delivered</span>
          </div>
        </div>

        {/* Customer Reach Out Section - Always Priority at Top */}
        {hasCustomerReachOut && (
          <div className="bg-success/5 border border-success/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-success mb-1">
                  🔥 Customer Reached Out - Priority Action Required!
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Customer has responded and is waiting for your follow-up. This takes priority over current work plan.
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="h-7 text-xs bg-success hover:bg-success/90"
                    onClick={() => onContact(lead.id, 'phone')}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call Now
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={() => onContact(lead.id, 'email')}
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Step (Work Plan) Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Current Step</h4>
            {isWorkPlanComplete && (
              <Badge className="text-xs bg-success text-white">
                ✅ Complete
              </Badge>
            )}
          </div>

          {isWorkPlanComplete ? (
            <div className="bg-muted/30 border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">Current Work Plan Finished</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                All planned tasks for the {lead.journeyStage} stage have been completed successfully.
              </p>
              
              {upcomingWorkPlanTasks && upcomingWorkPlanTasks.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-muted-foreground">Upcoming Work Plan:</h5>
                  {upcomingWorkPlanTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{task.title}</span>
                      <Badge variant="outline" className="text-xs">{task.dueDate}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : currentWorkPlanTask ? (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-primary mt-0.5" />
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-primary mb-1">
                    {currentWorkPlanTask.title}
                  </h5>
                  <p className="text-xs text-muted-foreground mb-2">
                    {currentWorkPlanTask.description}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      Due: {currentWorkPlanTask.dueDate}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Attempt {currentWorkPlanTask.attemptNumber}/3
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => onContact(lead.id, currentWorkPlanTask.contactMethod)}
                    >
                      {currentWorkPlanTask.contactMethod === 'phone' && <Phone className="h-3 w-3 mr-1" />}
                      {currentWorkPlanTask.contactMethod === 'email' && <Mail className="h-3 w-3 mr-1" />}
                      {currentWorkPlanTask.contactMethod === 'text' && <MessageCircle className="h-3 w-3 mr-1" />}
                      Execute Task
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs"
                      onClick={() => onTaskCompleted?.(lead.id)}
                    >
                      Mark Complete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 border border-border rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">
                No active work plan tasks for current stage
              </p>
            </div>
          )}
        </div>

        {!isCondensed && (
          <>
            <Separator />
            
            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{lead.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{lead.phone}</p>
              </div>
            </div>

            {/* Vehicle & Value */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Vehicle Interest</p>
                <p className="font-medium">{lead.vehicle}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Est. Value</p>
                <p className="font-medium">${lead.value?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>

            {/* Key Insights */}
            {lead.keyInsight && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-primary mb-1">Key Insight</p>
                    <p className="text-xs text-muted-foreground">{lead.keyInsight}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Toggle */}
            <QuickHistoryToggle 
              isExpanded={showHistory}
              onToggle={() => setShowHistory(!showHistory)}
            />

            {/* Expandable Sections */}
            {showHistory && (
              <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="workplan">Work Plan</TabsTrigger>
                </TabsList>
                
                <TabsContent value="timeline" className="space-y-3">
                  {lead.timeline && lead.timeline.length > 0 ? (
                    <CustomerHistoryTimeline timeline={lead.timeline} />
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No timeline data available
                    </p>
                  )}
                </TabsContent>
                
                <TabsContent value="workplan" className="space-y-3">
                  {lead.workPlan && lead.workPlan.length > 0 ? (
                    <WorkPlanProgress 
                      tasks={lead.workPlan}
                      journeyStage={lead.journeyStage}
                      onContactMethodClick={(method, task) => onContact(lead.id, method)}
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No work plan available
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-2">
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onContact(lead.id, 'phone')}
                        className="gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Call {lead.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onContact(lead.id, 'email')}
                        className="gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Send email to {lead.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onContact(lead.id, 'text')}
                        className="gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Text
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Send text to {lead.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(lead.id)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                View Details
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export type { Lead };
