import { useState } from 'react';
import { Phone, Mail, MessageCircle, Clock, DollarSign, Car, ArrowRight, ChevronDown, Calendar, MapPin, FileText, TrendingUp, Heart, Target, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Timeline } from '@/components/ui/timeline';
import { WorkPlanProgress } from '@/components/WorkPlanProgress';
import { cn } from '@/lib/utils';

export interface WorkPlanStep {
  id: string;
  label: string;
  type: 'call' | 'email' | 'text' | 'appointment' | 'follow-up';
  dueDate?: string;
  completedDate?: string;
  status: 'pending' | 'completed' | 'overdue' | 'skipped';
  attempts?: number;
  maxAttempts: number;
  notes?: string;
}

export interface JourneyStageData {
  stage: string;
  startDate: string;
  completedDate?: string;
  workPlan: WorkPlanStep[];
  currentStep: number; // Index of current step
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
  journeyStage: 'inquiry' | 'engaged' | 'visit' | 'test-drive' | 'proposal' | 'financing' | 'sold' | 'delivered';
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
  // Work plan and timeline data
  journeyTimeline?: JourneyStageData[];
  currentWorkPlan?: WorkPlanStep[];
  currentStepIndex?: number;
}

interface LeadCardProps {
  lead: Lead;
  onContact: (leadId: string, method: 'phone' | 'email' | 'text') => void;
  onViewDetails: (leadId: string) => void;
  onExecuteStep?: (leadId: string, stepId: string, type: WorkPlanStep['type']) => void;
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
  inquiry: { label: 'Inquiry', icon: '💬', color: 'bg-blue-500' },
  engaged: { label: 'Engaged', icon: '🎯', color: 'bg-teal-500' },
  visit: { label: 'Visit', icon: '🏢', color: 'bg-purple-500' },
  'test-drive': { label: 'Test Drive', icon: '🚗', color: 'bg-orange-500' },
  proposal: { label: 'Proposal', icon: '📄', color: 'bg-yellow-500' },
  financing: { label: 'Financing', icon: '🏦', color: 'bg-indigo-500' },
  sold: { label: 'Sold', icon: '✅', color: 'bg-green-500' },
  delivered: { label: 'Delivered', icon: '🎉', color: 'bg-emerald-500' }
};

export function LeadCard({ lead, onContact, onViewDetails, onExecuteStep, isCondensed = false, isFocused = false }: LeadCardProps) {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  
  // Get recommended quick actions based on journey stage and contact history
  const getQuickActions = () => {
    const isRecentlyContacted = lead.lastActivity.includes('contact sent') || 
                               lead.lastActivity.includes('contact made') || 
                               lead.lastActivity.includes('Just replied');
    const hasNewActivity = lead.lastActivity.includes('Just now') || 
                          lead.lastActivity.includes('min ago');

    switch (lead.journeyStage) {
      case 'inquiry':
        if (isRecentlyContacted) {
          return [
            { label: 'Try different method', icon: MessageCircle, action: () => onContact(lead.id, 'text'), context: 'No response to last contact' },
            { label: 'Check voicemail', icon: Phone, action: () => onContact(lead.id, 'phone'), context: 'Follow up on initial inquiry' }
          ];
        }
        return [
          { label: 'Initial contact', icon: Phone, action: () => onContact(lead.id, 'phone'), context: 'First outreach - establish connection' },
          { label: 'Send brochure', icon: Mail, action: () => onContact(lead.id, 'email'), context: 'Share vehicle information' }
        ];
      
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
      
      case 'test-drive':
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
                  <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-xs text-white", journeyStages[lead.journeyStage].color)}>
                    {journeyStages[lead.journeyStage].icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{journeyStages[lead.journeyStage].label}</span>
                    {lead.currentWorkPlan && lead.currentStepIndex !== undefined && (
                      <span className="text-muted-foreground truncate">
                        Step {lead.currentStepIndex + 1}: {lead.currentWorkPlan[lead.currentStepIndex]?.label}
                      </span>
                    )}
                  </div>
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
                {quickActions.slice(0, 2).map((action, idx) => (
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
        'relative border-l-4 transition-all duration-300 cursor-pointer shadow-soft hover:shadow-medium',
        priorityStyles[lead.priority],
        isFocused && 'ring-2 ring-primary shadow-lg scale-[1.02]'
      )}
      onClick={() => onViewDetails(lead.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className={cn("font-semibold text-foreground", isFocused ? "text-xl" : "text-lg")}>{lead.name}</h3>
                {lead.sentiment && (
                  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", sentimentConfig[lead.sentiment].bg, sentimentConfig[lead.sentiment].color)}>
                    {sentimentConfig[lead.sentiment].icon} {lead.sentiment}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{lead.email}</p>
              <p className="text-sm text-muted-foreground">{lead.phone}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
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
        
        {/* Enhanced Metrics Row */}
        <div className="grid grid-cols-3 gap-4 mt-4 p-3 bg-muted/20 rounded-lg">
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
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Journey Progress</span>
            {lead.currentWorkPlan && lead.currentStepIndex !== undefined && (
              <Badge variant="outline" className="text-xs">
                Step {lead.currentStepIndex + 1}/{lead.currentWorkPlan.length}
              </Badge>
            )}
          </div>
          
          {/* Timeline Dots */}
          {lead.journeyTimeline && (
            <Timeline 
              journeyData={lead.journeyTimeline.map(stage => ({
                stage: stage.stage,
                date: stage.startDate,
                isCompleted: !!stage.completedDate,
                isCurrent: stage.stage === journeyStages[lead.journeyStage].label,
                isOverdue: stage.workPlan.some(step => step.status === 'overdue'),
                workPlanProgress: {
                  completed: stage.workPlan.filter(step => step.status === 'completed').length,
                  total: stage.workPlan.length,
                  overdue: stage.workPlan.filter(step => step.status === 'overdue').length
                }
              }))}
              className="px-2"
            />
          )}
          
          {/* Current Stage Info */}
          <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-md">
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs text-white", journeyStages[lead.journeyStage].color)}>
              {journeyStages[lead.journeyStage].icon}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">{journeyStages[lead.journeyStage].label}</span>
              {lead.currentWorkPlan && lead.currentStepIndex !== undefined && (
                <p className="text-xs text-muted-foreground">
                  Current: {lead.currentWorkPlan[lead.currentStepIndex]?.label}
                </p>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{lead.stageProgress}%</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Insight Section */}
        {lead.keyInsight && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-primary text-sm">Key Insight</h4>
            </div>
            <p className="text-sm text-foreground">{lead.keyInsight}</p>
          </div>
        )}

        {/* Vehicle & Trade-in Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Interested Vehicle</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{lead.vehicle}</p>
          </div>
          {lead.tradeInVehicle && (
            <div className="bg-muted/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Trade-in Vehicle</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{lead.tradeInVehicle}</p>
            </div>
          )}
        </div>

        {/* Contact Preferences & History */}
        <div className="bg-muted/10 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">Contact Information</h4>
            {lead.preferredContact && (
              <Badge variant="outline" className="text-xs">
                Prefers {lead.preferredContact}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{lead.lastActivity}</span>
            </div>
            {lead.lastAppointment && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Last: {lead.lastAppointment}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Source:</span>
              <span className="text-xs font-medium">{lead.source}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-muted/20 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-muted-foreground">Recommended Actions</div>
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              {quickActions.map((action, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs gap-1"
                  onClick={action.action}
                >
                  <action.icon className="h-3 w-3" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            <strong>Context:</strong> {quickActions[0]?.context}
          </div>
        </div>

        {/* AI Journey Analysis */}
        <Collapsible open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
          <div className="bg-gradient-to-r from-primary/5 to-hot-lead/5 border border-primary/20 rounded-lg p-3 space-y-2">
            <CollapsibleTrigger 
              className="flex items-center justify-between w-full hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-full bg-gradient-primary text-white">
                  <MessageCircle className="h-3 w-3" />
                </div>
                <h4 className="font-medium text-primary text-sm">AI Journey Analysis</h4>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-primary transition-transform duration-200", isAnalysisOpen && "rotate-180")} />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-2 text-xs">
              <p className="text-foreground">
                <strong>Overview:</strong> {lead.name} has progressed {
                  lead.journeyStage === 'inquiry' ? 'through initial inquiry stage' :
                  lead.journeyStage === 'engaged' ? 'to active engagement with positive responses' :
                  lead.journeyStage === 'visit' ? 'to showroom visit with strong buying signals' :
                  lead.journeyStage === 'test-drive' ? 'to test drive completion with purchase intent' :
                  'through the sales pipeline'
                }.
              </p>
              
              {/* Notable Patterns */}
              {lead.journeyStage === 'engaged' && (
                <div className="bg-success/10 border border-success/20 rounded-md p-2">
                  <p className="text-success text-xs font-medium">✓ Notable: Quick response shows high engagement</p>
                </div>
              )}
              
              {lead.journeyStage === 'visit' && (
                <div className="bg-hot-lead/10 border border-hot-lead/20 rounded-md p-2">
                  <p className="text-hot-lead text-xs font-medium">🔥 Hot Signal: Extended visit with financing questions</p>
                </div>
              )}
              
              {lead.journeyStage === 'test-drive' && (
                <div className="bg-success/10 border border-success/20 rounded-md p-2">
                  <p className="text-success text-xs font-medium">🎯 Purchase Ready: Asked about trade-in - strong buying intent</p>
                </div>
              )}
              
              {lead.priority === 'hot' && (
                <div className="bg-warning/10 border border-warning/20 rounded-md p-2">
                  <p className="text-warning text-xs font-medium">⚠️ Irregular: High-value lead with rapid progression - prioritize follow-up</p>
                </div>
              )}
              
              <p className="text-muted-foreground text-xs">
                <strong>Next action:</strong> {
                  lead.journeyStage === 'inquiry' ? 'Follow up with alternative contact method' :
                  lead.journeyStage === 'engaged' ? 'Confirm weekend appointment details' :
                  lead.journeyStage === 'visit' ? 'Schedule test drive immediately' :
                  lead.journeyStage === 'test-drive' ? 'Present purchase proposal with trade-in evaluation' :
                  'Continue nurturing relationship'
                }
              </p>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {lead.timeOnLot && (
          <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
            <p className="text-sm font-medium text-warning flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Customer on lot: {lead.timeOnLot}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => onContact(lead.id, 'phone')}
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => onContact(lead.id, 'text')}
          >
            <MessageCircle className="h-4 w-4" />
            Text
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => onContact(lead.id, 'email')}
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}