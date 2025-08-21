import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Star, 
  TrendingUp, 
  Calendar,
  Eye,
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  DollarSign,
  Clock,
  Target,
  Zap,
  Car,
  Building,
  CheckCircle,
  AlertTriangle,
  Activity,
  BarChart3,
  Send,
  ArrowRight,
  FileText,
  RefreshCw,
  Heart,
  AlertCircle,
  Expand,
  Minimize
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkPlanProgress } from './WorkPlanProgress';
import JourneyAdvanceButton from './JourneyAdvanceButton';
import { CallSimulationModal } from './CallSimulationModal';
import { CelebrationAnimation } from './CelebrationAnimation';
import { WorkItemSlideOut } from './WorkItemSlideOut';
import { InlineActionForm } from './InlineActionForm';
import { CustomerResponsePreview } from './CustomerResponsePreview';
import { useMessaging } from '@/hooks/useMessaging';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Timeline } from '@/components/ui/timeline';

interface TimelineEvent {
  date: string;
  action: string;
  details: string;
  type: 'contact' | 'visit' | 'milestone' | 'missed';
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
  stageProgress: number; // 0-100 percentage
  // Enhanced data fields
  contactAttempts?: number;
  responseRate?: number;
  daysSinceLastContact?: number;
  nextFollowUp?: string;
  dealProbability?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  lastAppointment?: string;
  keyInsight?: string;
  preferredContact?: 'phone' | 'email' | 'text';
  budget?: { min: number; max: number };
  tradeInVehicle?: string;
  // Timeline and work plan data
  timeline?: TimelineEvent[];
  workPlan?: WorkPlanTask[];
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
}

const priorityStyles = {
  hot: 'border-l-hot-lead bg-gradient-to-r from-hot-lead/5 to-transparent',
  warm: 'border-l-warm-lead bg-gradient-to-r from-warm-lead/5 to-transparent',
  cold: 'border-l-cold-lead bg-gradient-to-r from-cold-lead/5 to-transparent'
};

const statusStyles = {
  new: 'bg-status-new text-white',
  contacted: 'bg-status-contacted text-white',
  qualified: 'bg-status-qualified text-white',
  closed: 'bg-status-closed text-white'
};

const priorityLabels = {
  hot: '🔥 Hot Lead',
  warm: '⚡ Warm Lead',
  cold: '❄️ Cold Lead'
};

const journeyStages = {
  engaged: { label: 'Engaged', icon: '💬', color: 'bg-teal-500' },
  visit: { label: 'Visit', icon: '📍', color: 'bg-purple-500' },
  proposal: { label: 'Proposal', icon: '📄', color: 'bg-yellow-500' },
  sold: { label: 'Sold', icon: '👍', color: 'bg-green-500' },
  delivered: { label: 'Delivered', icon: '🚚', color: 'bg-emerald-500' }
};

function LeadCard({ lead, onContact, onViewDetails, onOpenNotificationPanel, onTaskCompleted, onCommunicationSent, isCondensed = false, isFocused = false }: LeadCardProps) {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [showQuickResponse, setShowQuickResponse] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [selectedJourneyStage, setSelectedJourneyStage] = useState(lead.journeyStage);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completingWorkItem, setCompletingWorkItem] = useState(false);
  const [showInlineAction, setShowInlineAction] = useState(false);
  const [inlineActionType, setInlineActionType] = useState<'call' | 'text' | 'email'>('text');
  const [workPlanExpanded, setWorkPlanExpanded] = useState(false);
  const { sendMessage, advanceJourneyStage, isLoading } = useMessaging();
  const { toast } = useToast();
  
  // Reset selectedJourneyStage when lead changes to current stage
  useEffect(() => {
    setSelectedJourneyStage(lead.journeyStage);
  }, [lead.id, lead.journeyStage]);

  const handleQuickMessage = async (method: 'phone' | 'email' | 'text') => {
    if (!responseText.trim()) {
      // Generate default message if empty
      const defaultMessages = {
        phone: `Hi ${lead.name}, this is [Your Name] from [Dealership]. I wanted to follow up on your interest in the ${lead.vehicle}. When would be a good time to chat?`,
        email: `Hi ${lead.name}, I wanted to follow up on your interest in the ${lead.vehicle}. I'd be happy to answer any questions and schedule a convenient time to connect.`,
        text: `Hi ${lead.name}! Following up on your interest in the ${lead.vehicle}. I'm here to help with any questions. What's the best time to call?`
      };
      setResponseText(defaultMessages[method]);
      return;
    }

    try {
      // Update work plan task status to "reached_out" (mock update)
      if (lead.workPlan) {
        const currentStageTask = lead.workPlan.find(
          task => task.journeyStage.toLowerCase() === lead.journeyStage.toLowerCase() && 
                 task.status === 'pending'
        );
        if (currentStageTask) {
          currentStageTask.status = 'reached_out';
        }
      }

      await sendMessage(lead.id, responseText, method === 'phone' ? 'call' : method, lead.journeyStage);
      
      // Trigger celebration toast and confetti
      onCommunicationSent?.(lead.id, method);
      
      // Show celebration animation and trigger work item slide-out
      setShowCelebration(true);
      setCompletingWorkItem(true);
      
      // Notify parent to advance to next lead after celebration completes fully
      setTimeout(() => {
        onTaskCompleted?.(lead.id);
      }, 4500); // Wait for full celebration (4s) + extra buffer (0.5s)
      
      toast({
        title: "Message Sent",
        description: `Your ${method} has been sent. Customer will auto-respond in 15 seconds.`,
      });
      
      setResponseText('');
      setShowQuickResponse(false);
      onContact(lead.id, method);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleContactMethodClick = (method: 'phone' | 'email' | 'text') => {
    const actionType = method === 'phone' ? 'call' : method;
    setInlineActionType(actionType as 'call' | 'text' | 'email');
    setShowInlineAction(true);
    // No longer auto-send, just open inline form
  };

  const handleInlineActionComplete = async (notes: string, moveToNext: boolean) => {
    try {
      // Here you would typically save the notes and complete the work plan item
      // For now, we'll simulate this
      
      if (moveToNext) {
        await handleAdvanceJourney();
      }
      
      setShowInlineAction(false);
      toast({
        title: "Work Item Completed",
        description: `${inlineActionType} interaction logged for ${lead.name}`,
      });
      
      // Trigger any necessary updates
      onTaskCompleted?.(lead.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete work item",
        variant: "destructive"
      });
    }
  };

  const handleAdvanceJourney = async () => {
    try {
      const nextStage = await advanceJourneyStage(lead.id, lead.journeyStage);
      if (nextStage) {
        toast({
          title: "Journey Stage Advanced",
          description: `${lead.name} moved to ${nextStage.replace('_', ' ')} stage`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to advance journey stage",
        variant: "destructive"
      });
    }
  };

  // Mock customer response (in a real app, this would come from API)
  const mockCustomerResponse = lead.status === 'qualified' ? {
    id: 'resp-1',
    content: `Hi! Thanks for following up on the ${lead.vehicle}. I'm really interested but had a few questions about the financing options. Could we schedule a time to discuss? Also, what's your best price on this model?`,
    type: 'text' as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    status: 'new' as const
  } : null;

  // Get current work plan task
  const getCurrentWorkPlanTask = () => {
    if (!lead.workPlan) return null;
    return lead.workPlan.find(task => 
      task.journeyStage === lead.journeyStage && 
      task.status === 'pending'
    ) || lead.workPlan.filter(task => task.journeyStage === lead.journeyStage)[0];
  };

  const currentWorkPlanTask = getCurrentWorkPlanTask();
  const getQuickActions = () => {
    const isRecentlyContacted = lead.lastActivity.includes('contact sent') || 
                               lead.lastActivity.includes('contact made') || 
                               lead.lastActivity.includes('Just replied');
    const hasNewActivity = lead.lastActivity.includes('Just now') || 
                          lead.lastActivity.includes('min ago');

    switch (lead.journeyStage) {
      case 'engaged':
        if (hasNewActivity) {
          return [
            { label: 'Schedule visit now', icon: Calendar, action: () => onViewDetails(lead.id), context: 'Customer is active - strike while hot' },
            { label: 'Answer questions', icon: MessageCircle, action: () => onContact(lead.id, 'text'), context: 'Respond to recent engagement' }
          ];
        }
        return [
          { label: 'Confirm appointment', icon: Calendar, action: () => onViewDetails(lead.id), context: 'Previous positive responses' },
          { label: 'Send directions', icon: MapPin, action: () => onContact(lead.id, 'text'), context: 'Help them find showroom' }
        ];
      
      case 'visit':
        if (lead.timeOnLot) {
          return [
            { label: 'Immediate assistance', icon: Phone, action: () => onContact(lead.id, 'phone'), context: 'Customer currently on lot!' },
            { label: 'Test drive ready', icon: Car, action: () => onViewDetails(lead.id), context: 'Convert visit to test drive' }
          ];
        }
        return [
          { label: 'Schedule test drive', icon: Car, action: () => onViewDetails(lead.id), context: 'Post-visit follow up with strong buying signals' },
          { label: 'Address concerns', icon: Phone, action: () => onContact(lead.id, 'phone'), context: 'Extended visit shows serious interest' }
        ];
      
      case 'proposal':
        return [
          { label: 'Present offer', icon: FileText, action: () => onContact(lead.id, 'email'), context: 'High purchase intent after test drive' },
          { label: 'Trade-in discussion', icon: Phone, action: () => onContact(lead.id, 'phone'), context: 'Customer asked about trade-in value' }
        ];
      
      default:
        return [
          { label: 'Status check', icon: Phone, action: () => onContact(lead.id, 'phone'), context: 'Regular follow-up' },
          { label: 'Send update', icon: Mail, action: () => onContact(lead.id, 'email'), context: 'Keep relationship warm' }
        ];
    }
  };

  const quickActions = getQuickActions();
  
  // Sentiment colors and icons
  const sentimentConfig = {
    positive: { color: 'text-success', icon: '😊', bg: 'bg-success/10' },
    neutral: { color: 'text-muted-foreground', icon: '😐', bg: 'bg-muted/10' },
    negative: { color: 'text-destructive', icon: '😟', bg: 'bg-destructive/10' }
  };

  if (isCondensed) {
    return (
      <Card 
        className={cn(
          'relative border-l-4 transition-all duration-300 cursor-pointer shadow-soft hover:shadow-medium',
          priorityStyles[lead.priority]
        )}
        onClick={() => onViewDetails(lead.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{lead.name}</h3>
                    {lead.sentiment && (
                      <span className={cn("text-xs", sentimentConfig[lead.sentiment].color)}>
                        {sentimentConfig[lead.sentiment].icon}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {journeyStages[lead.journeyStage] && (
                    <>
                      <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-xs text-white", journeyStages[lead.journeyStage].color)}>
                        {journeyStages[lead.journeyStage].icon}
                      </div>
                      <span className="font-medium">{journeyStages[lead.journeyStage].label}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Car className="h-3 w-3" />
                  {lead.vehicle}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-success" />
                  ${lead.value.toLocaleString()}
                </span>
                {lead.dealProbability && (
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-primary" />
                    {lead.dealProbability}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs">
                <span>{lead.lastActivity}</span>
                {lead.contactAttempts && (
                  <span className="text-muted-foreground">
                    📞 {lead.contactAttempts} attempts
                  </span>
                )}
                {lead.nextFollowUp && (
                  <span className="text-primary">
                    📅 Next: {lead.nextFollowUp}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={cn(statusStyles[lead.status], "text-xs")} variant="secondary">
                {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
              </Badge>
              
              {/* Quick Actions */}
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => setShowQuickResponse(!showQuickResponse)}
                  title="Quick Message"
                >
                  <Send className="h-3 w-3" />
                </Button>
                {quickActions.slice(0, 1).map((action, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={action.action}
                    title={action.label}
                  >
                    <action.icon className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Quick Response in Condensed View */}
          {showQuickResponse && (
            <div className="mt-2 bg-muted/20 border rounded-lg p-2 space-y-2" onClick={(e) => e.stopPropagation()}>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="w-full h-16 p-2 border border-input rounded text-xs resize-none"
                placeholder="Quick message..."
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => handleQuickMessage('text')}
                  disabled={isLoading}
                  className="flex-1 h-6 text-xs"
                >
                  {isLoading ? "..." : "Send"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowQuickResponse(false)}
                  className="h-6 px-2 text-xs"
                >
                  ×
                </Button>
              </div>
            </div>
          )}
          
          {lead.timeOnLot && (
            <div className="mt-2 text-xs text-warning font-medium">
              🚗 On lot: {lead.timeOnLot}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card 
      className={cn(
        'relative border-l-4 transition-all duration-300',
        priorityStyles[lead.priority],
        isFocused && 'ring-2 ring-primary shadow-lg scale-[1.02]'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-muted/20 -m-2 p-2 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(lead.id);
            }}
            title="View lead details"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className={cn("font-semibold text-foreground", isFocused ? "text-xl" : "text-lg")}>{lead.name}</h3>
                {lead.sentiment && (
                  <span 
                    className={cn("px-2 py-1 rounded-full text-xs font-medium", sentimentConfig[lead.sentiment].bg, sentimentConfig[lead.sentiment].color)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {sentimentConfig[lead.sentiment].icon} {lead.sentiment}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{lead.email}</p>
              <p className="text-sm text-muted-foreground">{lead.phone}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
            <Badge className={statusStyles[lead.status]} variant="secondary">
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              {priorityLabels[lead.priority]}
            </span>
            {lead.dealProbability && (
              <div className="flex items-center gap-1 text-xs">
                <Target className="h-3 w-3 text-primary" />
                <span className="font-medium text-primary">{lead.dealProbability}% likely</span>
              </div>
            )}
          </div>
        </div>
        
        {/* AI Analysis & Insights - Moved to top */}
        <Collapsible open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen} className="mt-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                AI Analysis & Insights
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", isAnalysisOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              {/* Recommended Actions */}
              <div>
                <h5 className="font-medium text-sm flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-primary" />
                  Recommended Actions
                </h5>
                <div className="space-y-2">
                  {quickActions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{action.label}</p>
                        <p className="text-muted-foreground text-xs">{action.context}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Indicators */}
              <div className="border-t border-primary/20 pt-3">
                <h5 className="font-medium text-sm flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  Risk Assessment
                </h5>
                <div className="space-y-2 text-sm">
                  {lead.daysSinceLastContact && lead.daysSinceLastContact > 3 && (
                    <div className="flex items-center gap-2 text-warning">
                      <Clock className="h-3 w-3" />
                      <span>Extended silence - follow up urgently</span>
                    </div>
                  )}
                  {lead.sentiment === 'negative' && (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      <span>Negative sentiment detected - address concerns</span>
                    </div>
                  )}
                  {lead.contactAttempts && lead.contactAttempts > 2 && !lead.responseRate && (
                    <div className="flex items-center gap-2 text-warning">
                      <MessageCircle className="h-3 w-3" />
                      <span>Multiple attempts, no response - try different approach</span>
                    </div>
                  )}
                  {(!lead.daysSinceLastContact || lead.daysSinceLastContact <= 1) && lead.sentiment !== 'negative' && (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="h-3 w-3" />
                      <span>Lead is actively engaged</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Opportunity Score */}
              {lead.dealProbability && (
                <div className="border-t border-primary/20 pt-3">
                  <h5 className="font-medium text-sm flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-success" />
                    Opportunity Score
                  </h5>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-destructive via-warning to-success h-2 rounded-full transition-all"
                        style={{ width: `${lead.dealProbability}%` }}
                      />
                    </div>
                    <span className="font-bold text-sm">{lead.dealProbability}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on engagement level, response rate, and journey progress
                  </p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Vehicle of Interest - Less Prominent */}
        <div 
          className="bg-muted/10 border rounded-lg p-3 mt-4 cursor-pointer hover:bg-muted/20 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(lead.id);
          }}
          title="View vehicle details"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{lead.vehicle}</p>
                <p className="text-xs text-muted-foreground">Vehicle of Interest</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-sm">${lead.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Target Value</p>
            </div>
          </div>
          {lead.tradeInVehicle && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Trade-in: </span>
                <span className="text-xs font-medium">{lead.tradeInVehicle}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Metrics Row */}
        <div 
          className="grid grid-cols-3 gap-4 mt-4 p-3 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(lead.id);
          }}
          title="View detailed metrics"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-success">
              <DollarSign className="h-4 w-4" />
              ${lead.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Deal Value</p>
            {lead.budget && (
              <p className="text-xs text-muted-foreground">Budget: ${lead.budget.min.toLocaleString()}-${lead.budget.max.toLocaleString()}</p>
            )}
          </div>
          <div className="text-center border-x border-border px-2">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-primary">
              {lead.contactAttempts || 0}
            </div>
            <p className="text-xs text-muted-foreground">Contact Attempts</p>
            {lead.responseRate && (
              <p className="text-xs text-success">{lead.responseRate}% response rate</p>
            )}
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-foreground">
              {lead.daysSinceLastContact || 0}
            </div>
            <p className="text-xs text-muted-foreground">Days Since Contact</p>
            {lead.nextFollowUp && (
              <p className="text-xs text-primary">Next: {lead.nextFollowUp}</p>
            )}
          </div>
        </div>
        
        {/* Journey Stage Progress with Timeline */}
        <div className="mt-3 p-3 bg-muted/30 rounded-md space-y-3 relative z-50" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs font-medium text-muted-foreground">Journey Progress</span>
            {journeyStages[lead.journeyStage] && (
              <span className="text-xs font-medium text-primary">
                Step {Object.keys(journeyStages).indexOf(lead.journeyStage) + 1} of {Object.keys(journeyStages).length}: {journeyStages[lead.journeyStage].label}
              </span>
            )}
          </div>
          
          {/* Current Stage Info - Moved above progress bar */}
          {journeyStages[lead.journeyStage] && (
            <div 
              className="flex items-center gap-2 cursor-pointer hover:bg-muted/20 p-2 -m-2 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(lead.id);
              }}
              title="Click to view detailed journey progress"
            >
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs text-white", journeyStages[lead.journeyStage].color)}>
                {journeyStages[lead.journeyStage].icon}
              </div>
              <span className="text-sm font-medium">Current: {journeyStages[lead.journeyStage].label}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
          
          {/* Journey Timeline Progress Bar */}
          <TooltipProvider>
            <div className="relative z-50 px-3">
              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 relative">
                <div 
                  className="h-2 bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-500"
                  style={{ width: `${(Object.keys(journeyStages).indexOf(lead.journeyStage) + 1) * 20}%` }}
                />
                
                {/* Journey Stage Icons - Overlapping the progress bar */}
                {Object.entries(journeyStages).map(([stage, config], index, array) => {
                  const position = (index / (array.length - 1)) * 100;
                  const isCompleted = Object.keys(journeyStages).indexOf(lead.journeyStage) >= index;
                  const isCurrentStep = lead.journeyStage === stage;
                  
                  // Mock completion dates for demonstration
                  const mockDates = {
                    engaged: '2024-01-15 10:30 AM',
                    visit: '2024-01-16 2:15 PM',
                    proposal: '2024-01-17 11:45 AM',
                    sold: '2024-01-18 4:20 PM',
                    delivered: null
                  };
                  
                  return (
                    <Tooltip key={stage}>
                      <TooltipTrigger asChild>
                         <div 
                           className={cn(
                             'absolute w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-125 cursor-pointer z-50',
                             selectedJourneyStage === stage
                               ? 'bg-primary border-white text-white shadow-lg ring-2 ring-primary/50'
                               : isCompleted 
                               ? 'bg-primary/70 border-white text-white shadow-md' 
                               : isCurrentStep
                               ? 'bg-primary/20 border-primary text-primary animate-pulse'
                               : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                           )}
                           style={{ 
                             left: `${position}%`, 
                             top: '50%',
                             transform: 'translate(-50%, -50%)'
                           }}
                           onClick={(e) => {
                             e.stopPropagation();
                             setSelectedJourneyStage(stage as Lead['journeyStage']);
                           }}
                         >
                           <span className="text-xs">{config.icon}</span>
                         </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs z-[9999] bg-popover border shadow-md">
                        <div className="text-xs">
                          <div className="font-medium">{config.label}</div>
                          {isCompleted && mockDates[stage as keyof typeof mockDates] ? (
                            <div className="text-success">
                              ✓ Completed: {mockDates[stage as keyof typeof mockDates]}
                            </div>
                          ) : isCurrentStep ? (
                            <div className="text-primary">📍 Current Step</div>
                          ) : (
                            <div className="text-muted-foreground">⏳ Pending</div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </TooltipProvider>
          
          {/* Current Step in Journey Progress - Customer Response Takes Priority */}
          {journeyStages[selectedJourneyStage] && (
            <div className="mt-3 p-3 bg-muted/10 border rounded-lg">
              {/* Customer Response Section (Higher Priority) */}
              {mockCustomerResponse ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-xs flex items-center gap-2">
                      <Activity className="h-3 w-3 text-success" />
                      Customer Reached Out
                    </h5>
                    <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                      15 min ago
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Customer replied with questions</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {mockCustomerResponse.content.substring(0, 100)}...
                    </p>
                    
                    {/* Customer Response Action Buttons - Separate from workplan */}
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Direct customer response handling - not workplan related
                          onContact(lead.id, 'phone');
                        }}
                        className="h-6 text-xs flex-1"
                      >
                        <Phone className="h-2 w-2 mr-1" />
                        Call Back
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Direct customer response handling - not workplan related
                          onContact(lead.id, 'text');
                        }}
                        className="h-6 text-xs flex-1"
                      >
                        <MessageCircle className="h-2 w-2 mr-1" />
                        Reply
                      </Button>
                    </div>
                    
                    <p className="text-xs text-success">
                      Priority: Respond to customer inquiry
                    </p>
                  </div>
                </>
              ) : (
                /* Workplan Item Section (When no customer response) */
                currentWorkPlanTask && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-xs flex items-center gap-2">
                        <Clock className="h-3 w-3 text-primary" />
                        Current Step
                      </h5>
                      <Badge variant="outline" className="text-xs">
                        {currentWorkPlanTask.dueDate}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium">{currentWorkPlanTask.title}</p>
                      <p className="text-xs text-muted-foreground">{currentWorkPlanTask.description}</p>
                      
                      {/* Workplan Action Buttons */}
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContactMethodClick('phone');
                          }}
                          className="h-6 text-xs flex-1"
                        >
                          <Phone className="h-2 w-2 mr-1" />
                          Call
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContactMethodClick('text');
                          }}
                          className="h-6 text-xs flex-1"
                        >
                          <MessageCircle className="h-2 w-2 mr-1" />
                          Text
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContactMethodClick('email');
                          }}
                          className="h-6 text-xs flex-1"
                        >
                          <Mail className="h-2 w-2 mr-1" />
                          Email
                        </Button>
                      </div>
                      
                      {/* Context */}
                      {lead.workPlan && lead.workPlan.filter(t => t.journeyStage === lead.journeyStage).length > 1 && (
                        <p className="text-xs text-muted-foreground">
                          {lead.workPlan.filter(t => t.journeyStage === lead.journeyStage).length} attempts planned today
                        </p>
                      )}
                    </div>
                  </>
                )
              )}
            </div>
          )}
          
          {/* Journey Advance Button for customer replies */}
          <JourneyAdvanceButton
            leadId={lead.id}
            leadName={lead.name}
            currentStage={lead.journeyStage}
            leadStatus={lead.status}
            hasCustomerReplied={lead.status === 'qualified'}
            onStageAdvanced={() => {
              // Could trigger a refresh here if needed
            }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Customer Response Preview - Top Priority */}
        {mockCustomerResponse && (
          <CustomerResponsePreview
            response={mockCustomerResponse}
            leadName={lead.name}
            onViewFull={() => onViewDetails(lead.id)}
            onRespond={(method) => handleContactMethodClick(method)}
          />
        )}

        {/* Inline Action Form */}
        {showInlineAction && (
          <InlineActionForm
            actionType={inlineActionType}
            leadName={lead.name}
            leadId={lead.id}
            workPlanItem={currentWorkPlanTask ? {
              id: currentWorkPlanTask.id,
              title: currentWorkPlanTask.title,
              description: currentWorkPlanTask.description,
              dueDate: currentWorkPlanTask.dueDate
            } : undefined}
            onComplete={handleInlineActionComplete}
            onCancel={() => setShowInlineAction(false)}
          />
        )}



        {/* Contact Preferences & History */}
        <div 
          className="bg-muted/10 rounded-lg p-3 cursor-pointer hover:bg-muted/20 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(lead.id);
          }}
          title="View contact history"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">Contact Information</h4>
            {lead.preferredContact && (
              <Badge variant="outline" className="text-xs">
                Prefers: {lead.preferredContact}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Last Activity</p>
              <p className="font-medium">{lead.lastActivity}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Source</p>
              <p className="font-medium">{lead.source}</p>
            </div>
          </div>
          {lead.lastAppointment && (
            <div className="mt-2">
              <p className="text-muted-foreground text-xs">Last Appointment: {lead.lastAppointment}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Quick Response Section */}
          {showQuickResponse && (
            <div className="bg-muted/20 border rounded-lg p-3 space-y-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-sm">Quick Message</h5>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickResponse(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="w-full h-20 p-2 border border-input rounded text-sm resize-none"
                placeholder="Type your message here..."
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleQuickMessage('text')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {isLoading ? "Sending..." : "Send Text"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickMessage('phone')}
                  disabled={isLoading}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickMessage('email')}
                  disabled={isLoading}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
              </div>
            </div>
          )}
          
          {/* Quick Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickResponse(!showQuickResponse);
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              Quick Message
            </Button>
            {quickActions.slice(0, 2).map((action, idx) => (
              <Button
                key={idx}
                size="sm"
                variant={idx === 0 ? "default" : "outline"}
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  action.action();
                }}
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>


        {/* Customer on Lot Alert */}
        {lead.timeOnLot && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warning">
              <Car className="h-4 w-4" />
              <span className="font-medium text-sm">Customer on lot: {lead.timeOnLot}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Immediate action recommended</p>
          </div>
        )}
      </CardContent>
      
      {/* Call Simulation Modal */}
      <CallSimulationModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        leadName={lead.name}
        phoneNumber={lead.phone}
      />
      
      {/* Celebration Animation */}
      <CelebrationAnimation
        isVisible={showCelebration}
        onComplete={() => setShowCelebration(false)}
        message="Work plan item completed! 🚀"
      />
    </Card>
  );
}

export default LeadCard;