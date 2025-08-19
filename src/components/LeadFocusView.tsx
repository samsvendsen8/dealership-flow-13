import { useState } from 'react';
import { ArrowLeft, ChevronUp, ChevronDown, Calendar, Phone, Mail, MessageCircle, CheckCircle, Clock, AlertCircle, Target, Car, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { LeadCard, type Lead } from './LeadCard';
import { cn } from '@/lib/utils';

interface LeadFocusViewProps {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (leadId: string) => void;
  onContact: (leadId: string, method: 'phone' | 'email' | 'text') => void;
  onViewDetails: (leadId: string) => void;
  onBack: () => void;
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

export function LeadFocusView({ 
  leads, 
  selectedLeadId, 
  onSelectLead, 
  onContact, 
  onViewDetails, 
  onBack 
}: LeadFocusViewProps) {
  const selectedLead = leads.find(lead => lead.id === selectedLeadId);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [selectedJourneyStage, setSelectedJourneyStage] = useState<string | null>(null);

  const getLeadPriorityColor = (lead: Lead) => {
    switch (lead.priority) {
      case 'hot': return 'border-l-hot-lead';
      case 'warm': return 'border-l-warm-lead';
      case 'cold': return 'border-l-cold-lead';
      default: return 'border-l-muted';
    }
  };

  const currentIndex = leads.findIndex(lead => lead.id === selectedLeadId);
  const nextLead = currentIndex < leads.length - 1 ? leads[currentIndex + 1] : null;
  const prevLead = currentIndex > 0 ? leads[currentIndex - 1] : null;

  const allStages = Object.keys(journeyStages) as (keyof typeof journeyStages)[];
  const currentStageIndex = selectedLead ? allStages.indexOf(selectedLead.journeyStage) : 0;

  const getStageWorkPlan = (stageKey: string) => {
    // Mock work plan data for each stage - in real app this would come from the lead data
    const mockWorkPlans: Record<string, Array<{
      id: string;
      title: string;
      description: string;
      dueDate: string;
      status: 'pending' | 'completed' | 'missed' | 'scheduled';
      attemptNumber: number;
      contactMethod: 'phone' | 'email' | 'text';
    }>> = {
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
    <div className="h-screen flex bg-background">
      {/* Navigation Sidebar */}
      <div className={cn(
        "border-r border-border bg-muted/30 transition-all duration-300",
        isNavCollapsed ? "w-16" : "w-80"
      )}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!isNavCollapsed && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to List
                </Button>
                <Badge variant="secondary" className="ml-2">
                  {leads.length} leads
                </Badge>
              </>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsNavCollapsed(!isNavCollapsed)}
              className="h-8 w-8 p-0"
            >
              {isNavCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {!isNavCollapsed && (
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {leads.map((lead, index) => (
                <div 
                  key={lead.id}
                  className={cn(
                    "p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:bg-background/50",
                    getLeadPriorityColor(lead),
                    selectedLeadId === lead.id 
                      ? "bg-primary/10 border-primary ring-1 ring-primary/20" 
                      : "bg-background/30 hover:bg-background/60"
                  )}
                  onClick={() => onSelectLead(lead.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={cn(
                          "font-medium truncate text-sm",
                          selectedLeadId === lead.id ? "text-primary" : "text-foreground"
                        )}>
                          {lead.name}
                        </h4>
                        {lead.sentiment && (
                          <span className="text-xs">
                            {lead.sentiment === 'positive' ? '😊' : lead.sentiment === 'negative' ? '😟' : '😐'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{lead.vehicle}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-success">
                          ${lead.value.toLocaleString()}
                        </span>
                        {lead.dealProbability && (
                          <span className="text-xs text-primary">
                            {lead.dealProbability}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", {
                          'bg-hot-lead/20 text-hot-lead': lead.priority === 'hot',
                          'bg-warm-lead/20 text-warm-lead': lead.priority === 'warm',
                          'bg-cold-lead/20 text-cold-lead': lead.priority === 'cold',
                        })}
                      >
                        {lead.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  {lead.timeOnLot && (
                    <div className="mt-2 text-xs text-warning font-medium">
                      🚗 On lot: {lead.timeOnLot}
                    </div>
                  )}
                  
                  {lead.nextFollowUp && (
                    <div className="mt-1 text-xs text-primary">
                      📅 Next: {lead.nextFollowUp}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {isNavCollapsed && selectedLead && (
          <div className="p-2">
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                {currentIndex + 1}/{leads.length}
              </div>
              <div className="space-y-1">
                {prevLead && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSelectLead(prevLead.id)}
                    className="h-8 w-8 p-0"
                    title={prevLead.name}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                )}
                {nextLead && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSelectLead(nextLead.id)}
                    className="h-8 w-8 p-0"
                    title={nextLead.name}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Focus Area */}
      <div className="flex-1 p-6 overflow-auto">
        {selectedLead ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Lead Focus View
                </h1>
                <p className="text-muted-foreground">
                  Lead {currentIndex + 1} of {leads.length} • {selectedLead.name}
                </p>
              </div>
              <div className="flex gap-2">
                {prevLead && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onSelectLead(prevLead.id)}
                    className="gap-2"
                  >
                    <ChevronUp className="h-4 w-4" />
                    Previous
                  </Button>
                )}
                {nextLead && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onSelectLead(nextLead.id)}
                    className="gap-2"
                  >
                    Next
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <Tabs defaultValue="customer-info" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="customer-info">Customer Info</TabsTrigger>
                <TabsTrigger value="journey">Journey</TabsTrigger>
              </TabsList>

              <TabsContent value="customer-info" className="mt-4">
                <LeadCard
                  lead={selectedLead}
                  onContact={onContact}
                  onViewDetails={onViewDetails}
                  isCondensed={false}
                  isFocused={true}
                />
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
        ) : (
          <div className="flex items-center justify-center h-full">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle className="text-center">Select a Lead</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Choose a lead from the navigation panel to view detailed information and take action.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}