import { useState } from 'react';
import { Phone, Mail, MessageCircle, Clock, DollarSign, Car, ArrowRight, ChevronDown, Calendar, MapPin, FileText, TrendingUp, Heart, Target, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Timeline } from '@/components/ui/timeline';
import { WorkPlanProgress } from '@/components/WorkPlanProgress';

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
  status: 'pending' | 'completed' | 'missed' | 'scheduled';
  attemptNumber: number;
  contactMethod: 'phone' | 'email' | 'text';
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

export function LeadCard({ lead, onContact, onViewDetails, isCondensed = false, isFocused = false }: LeadCardProps) {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  
  // Get recommended quick actions based on journey stage and contact history
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
        <div className="mt-3 p-3 bg-muted/30 rounded-md space-y-3 relative z-[9999]">
          <div className="flex items-center justify-between mb-2">
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
            <div className="relative z-[9999]">
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
                            'absolute w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-125 cursor-pointer z-[9999]',
                            isCompleted 
                              ? 'bg-primary border-white text-white shadow-md' 
                              : isCurrentStep
                              ? 'bg-primary/20 border-primary text-primary animate-pulse'
                              : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                          )}
                          style={{ 
                            left: `${position}%`, 
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
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
          
          {/* Work plan for current journey stage */}
          {lead.workPlan && lead.workPlan.length > 0 && journeyStages[lead.journeyStage] && (
            <WorkPlanProgress 
              tasks={lead.workPlan} 
              journeyStage={journeyStages[lead.journeyStage].label}
            />
          )}
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
        <div className="flex gap-2">
          {quickActions.map((action, idx) => (
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

        {/* Analysis Section - Collapsible */}
        <Collapsible open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
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
    </Card>
  );
}