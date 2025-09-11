import { useState } from 'react';
import { Phone, Mail, MessageCircle, User, Calendar, DollarSign, Car, Send, Edit3, ChevronDown, ChevronRight, PlayCircle, Timer, Check, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Timeline } from '@/components/ui/timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Lead } from './LeadCard';
import MessageHistory from './MessageHistory';
import JourneyAdvanceButton from './JourneyAdvanceButton';
import { WorkPlanProgress } from './WorkPlanProgress';
import { CallSimulationModal } from './CallSimulationModal';
import { useMessaging } from '@/hooks/useMessaging';
import { CustomerHistoryTimeline } from './CustomerHistoryTimeline';
import { useToast } from '@/hooks/use-toast';

interface NotificationPanelContentProps {
  lead: Lead;
  onContact: (leadId: string, method: 'phone' | 'email' | 'text' | 'appointment') => void;
}

const statusStyles = {
  new: 'bg-status-new text-white',
  contacted: 'bg-status-contacted text-white',
  qualified: 'bg-status-qualified text-white',
  closed: 'bg-status-closed text-white'
};

// AI Overview Component
function AIHistoryOverview({ filter, leadName }: { filter: 'all' | 'text' | 'priority', leadName: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getOverviewContent = () => {
    switch (filter) {
      case 'text':
        return {
          summary: "Recent messaging shows active engagement with quick responses.",
          details: `${leadName} has been actively responding to text and email communications. Last exchange was about financing options with positive sentiment. Customer is asking specific questions about rates, indicating serious purchase intent. Response times average under 2 hours, showing high engagement level.`
        };
      case 'priority':
        return {
          summary: "High-priority items show strong purchase signals and urgency.",
          details: `Priority interactions include completed qualification call, scheduled test drive, and active financing discussions. Customer has shown strong buying signals with specific questions about warranty coverage and payment options. Timeline indicates readiness to make decision within 1-2 weeks based on stated preferences.`
        };
      default:
        return {
          summary: "Customer journey shows steady progression with multiple touchpoints.",
          details: `${leadName} has progressed from initial inquiry to active engagement across multiple channels. Timeline shows consistent follow-through on scheduled activities. High engagement with both digital communications and in-person interactions. Strong indicators of purchase intent with specific questions about financing and features.`
        };
    }
  };

  const content = getOverviewContent();

  return (
    <Card>
      <CardContent className="p-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <div className="p-0.5 rounded bg-primary/10">
              <MessageCircle className="h-2.5 w-2.5 text-primary" />
            </div>
            <h4 className="text-xs font-medium text-foreground">AI Overview</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-5 w-5 p-0"
          >
            {isExpanded ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground leading-tight">
          {content.summary}
        </p>
        
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground leading-tight">
              {content.details}
            </p>
            <div className="mt-1.5 flex gap-1 flex-wrap">
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-auto">
                Engagement: High
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-auto">
                Intent: Strong
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-auto">
                Timeline: 1-2 weeks
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function NotificationPanelContent({ lead, onContact }: NotificationPanelContentProps) {
  const [activeMainTab, setActiveMainTab] = useState<'contact' | 'customer-info' | 'customer-history'>('customer-history');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'notes'>('overview');
  const [responseText, setResponseText] = useState('');
  const [expandedHistoryItems, setExpandedHistoryItems] = useState<Set<string>>(new Set());
  const [selectedJourneyStage, setSelectedJourneyStage] = useState<string | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'text' | 'priority'>('all');
  const [historyScope, setHistoryScope] = useState<'deal' | 'customer'>('deal');
  const [contactMethod, setContactMethod] = useState<'phone' | 'email' | 'text' | 'appointment'>('text');
  const { sendMessage, isLoading } = useMessaging();
  const { toast } = useToast();

  type HistoryContent = 
    | { type: 'form'; data: Record<string, string> }
    | { type: 'voicemail'; duration: string; transcript: string }
    | { type: 'text'; messages: Array<{ sender: string; text: string; time: string }> }
    | { type: 'email'; subject: string; body: string }
    | { type: 'meeting'; duration: string; notes: string; actions: string[] };

  type HistoryItem = {
    id: string;
    type: string;
    title: string;
    timestamp: string;
    icon: any;
    color: string;
    description: string;
    expandable: boolean;
    content: HistoryContent;
  };

  // Generate AI responses for different contact methods
  const generateAIResponse = (method: 'phone' | 'email' | 'text' | 'appointment', selectedLead: Lead) => {
    const responses = {
      phone: `Hi ${selectedLead.name}! This is [Your Name] from [Dealership Name]. I noticed you've been interested in our ${selectedLead.vehicle}. I wanted to personally reach out to see if you have any questions and help you schedule a test drive. What would be the best time for you to visit our showroom?`,
      email: `Subject: Your ${selectedLead.vehicle} - Next Steps & Special Pricing\n\nHi ${selectedLead.name},\n\nThank you for your interest in the ${selectedLead.vehicle}! I'm excited to help you through this process.\n\nBased on your inquiry, I've prepared:\n• Detailed vehicle specifications\n• Current financing options\n• Available appointment times for test drives\n\nI'm here to answer any questions and make this as easy as possible for you. When would be a good time to connect?\n\nBest regards,\n[Your Name]`,
      text: `Hi ${selectedLead.name}! This is [Your Name] from [Dealership]. Hope you're well! Still interested in the ${selectedLead.vehicle}? I'd love to help schedule a test drive or answer any questions. When works best for you? 🚗`,
      appointment: `Hi ${selectedLead.name}, I'd like to schedule an appointment for you to see the ${selectedLead.vehicle} in person. We have availability this week for test drives and I can show you all the features. What day and time works best for your schedule?`
    };
    
    return responses[method];
  };

  const currentAIResponse = generateAIResponse(contactMethod, lead);

  const handleContactMethodClick = (method: 'phone' | 'email' | 'text' | 'appointment') => {
    setContactMethod(method);
    if (method === 'phone') {
      setShowCallModal(true);
    } else if (method === 'appointment') {
      setActiveMainTab('contact');
      setResponseText(generateAIResponse('appointment', lead));
    } else {
      setActiveMainTab('contact');
    }
  };

  const toggleHistoryItem = (itemId: string) => {
    const newExpanded = new Set(expandedHistoryItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedHistoryItems(newExpanded);
  };

  const generateFakeHistory = (): HistoryItem[] => {
    const historyItems: HistoryItem[] = [
      {
        id: '1',
        type: 'form',
        title: 'Contact Form Submitted',
        timestamp: '2 days ago',
        icon: MessageSquare,
        color: 'text-blue-600',
        description: 'Customer filled out interest form online',
        expandable: true,
        content: {
          type: 'form',
          data: {
            'Vehicle Interest': lead.vehicle,
            'Budget Range': `$${lead.budget?.min?.toLocaleString()} - $${lead.budget?.max?.toLocaleString()}`,
            'Preferred Contact': lead.preferredContact || 'Phone',
            'Timeline': 'Within 2 weeks',
            'Comments': 'Looking for family vehicle with good safety ratings'
          }
        }
      },
      {
        id: '2',
        type: 'phone',
        title: 'Outbound Phone Call',
        timestamp: '1 day ago',
        icon: Phone,
        color: 'text-green-600',
        description: 'Initial contact call - discussed needs',
        expandable: true,
        content: {
          type: 'voicemail',
          duration: '12 minutes',
          transcript: `Spoke with ${lead.name} about their interest in ${lead.vehicle}. Customer mentioned they are actively shopping and comparing options. Discussed financing options and scheduled a visit for today. Customer seems motivated and ready to make a decision soon.`
        }
      },
      {
        id: '3',
        type: 'visit',
        title: 'Showroom Visit',
        timestamp: 'Today',
        icon: Car,
        color: 'text-purple-600',
        description: 'Customer visited dealership for test drive',
        expandable: true,
        content: {
          type: 'meeting',
          duration: '45 minutes',
          notes: `${lead.name} arrived on time and test drove the ${lead.vehicle}. Very impressed with the vehicle features and ride quality. Discussed pricing and trade-in options.`,
          actions: [
            'Provided detailed brochure and specifications',
            'Ran preliminary credit check (approved)',
            'Discussed extended warranty options',
            'Scheduled follow-up call for tomorrow'
          ]
        }
      }
    ];

    return historyItems;
  };

  const historyData = generateFakeHistory();

  return (
    <div className="h-full">
      <ScrollArea className="h-full">
        <div className="p-4 pt-2 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{lead.name}</h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusStyles[lead.status]}>{lead.status}</Badge>
                  <Badge variant="outline" className={cn(
                    "capitalize",
                    lead.priority === 'hot' && 'border-hot-lead text-hot-lead',
                    lead.priority === 'warm' && 'border-warm-lead text-warm-lead',
                    lead.priority === 'cold' && 'border-cold-lead text-cold-lead'
                  )}>
                    {lead.priority} priority
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="space-y-4">
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setActiveMainTab('contact')}
                className={cn(
                  "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors",
                  activeMainTab === 'contact' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Contact
              </button>
              <button
                onClick={() => setActiveMainTab('customer-info')}
                className={cn(
                  "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors",
                  activeMainTab === 'customer-info' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Details
              </button>
              <button
                onClick={() => setActiveMainTab('customer-history')}
                className={cn(
                  "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors",
                  activeMainTab === 'customer-history' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                History
              </button>
            </div>

            {/* Contact Tab Content */}
            {activeMainTab === 'contact' && (
              <div className="space-y-4">
                {/* AI Response Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">AI Suggested Response</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Method: {contactMethod === 'phone' ? 'Phone Call' : contactMethod === 'email' ? 'Email' : 'Text Message'}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-line">
                      {currentAIResponse}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Your Response</label>
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder={`Edit the AI suggestion or write your own ${contactMethod || 'text'} message...`}
                        className="w-full p-3 border border-input rounded-lg text-sm resize-none"
                        rows={4}
                      />
                    </div>

                    {/* Quick AI Edit Actions */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[
                        "Quick check-in about test drive",
                        "Follow up on financing options", 
                        "Schedule appointment this week",
                        "Send vehicle pricing details"
                      ].map((quickEdit, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => setResponseText(quickEdit)}
                        >
                          {quickEdit}
                        </Button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 gap-2 bg-gradient-primary hover:opacity-90"
                        onClick={async () => {
                          const messageToSend = responseText.trim() || currentAIResponse;
                          if (messageToSend) {
                            try {
                              await sendMessage(
                                lead.id,
                                messageToSend,
                                contactMethod === 'phone' ? 'call' : contactMethod === 'email' ? 'email' : 'text',
                                lead.journeyStage
                              );
                              
                              toast({
                                title: "Message Sent",
                                description: `Your ${contactMethod} message has been sent to ${lead.name}.`,
                              });
                              
                              setResponseText('');
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to send message. Please try again.",
                                variant: "destructive",
                              });
                            }
                          }
                        }}
                        disabled={isLoading}
                      >
                        <Send className="h-4 w-4" />
                        {isLoading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Contact Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleContactMethodClick('phone')}
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleContactMethodClick('text')}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Text
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleContactMethodClick('email')}
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleContactMethodClick('appointment')}
                      >
                        <Calendar className="h-4 w-4" />
                        Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Message History */}
                <MessageHistory leadId={lead.id} />
              </div>
            )}

            {/* Customer Info Tab */}
            {activeMainTab === 'customer-info' && (
              <div className="space-y-4">
                {/* Lead Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Lead Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Vehicle Interest</label>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{lead.vehicle}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Deal Value</label>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-success" />
                          <span className="text-sm font-medium text-success">
                            ${lead.value.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Quick Actions */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Quick Actions</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Phone className="h-4 w-4" />
                          Call Customer
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Send Text
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Mail className="h-4 w-4" />
                          Send Email
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Calendar className="h-4 w-4" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sub-tabs for detailed info */}
                <div className="space-y-4">
                  <div className="flex gap-1 p-1 bg-muted rounded-lg">
                    <button
                      onClick={() => setActiveSubTab('overview')}
                      className={cn(
                        "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors",
                        activeSubTab === 'overview' 
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveSubTab('notes')}
                      className={cn(
                        "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors",
                        activeSubTab === 'notes' 
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Notes
                    </button>
                  </div>

                  {activeSubTab === 'overview' && (
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        {/* Customer Details */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Customer Information</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Email</span>
                              <span className="text-xs">{lead.email || 'Not provided'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Phone</span>
                              <span className="text-xs">{lead.phone || 'Not provided'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Preferred Contact</span>
                              <span className="text-xs capitalize">{lead.preferredContact || 'Phone'}</span>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Deal Information */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Deal Information</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Deal Probability</span>
                              <span className="text-xs font-medium">{lead.dealProbability}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Last Activity</span>
                              <span className="text-xs">{lead.lastActivity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Journey Stage</span>
                              <Badge variant="outline" className="text-xs">{lead.journeyStage}</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Journey Progress */}
                        {lead.journeyStage && (
                          <>
                            <Separator />
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Journey Progress</h4>
                              <JourneyAdvanceButton
                                currentStage={lead.journeyStage}
                                leadId={lead.id}
                                leadName={lead.name}
                                leadStatus={lead.status}
                                hasCustomerReplied={true}
                                onStageAdvanced={() => {}}
                              />
                            </div>
                          </>
                        )}

                        {/* Work Plan Progress */}
                        {lead.workPlan && (
                          <>
                            <Separator />
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Work Plan</h4>
                              <WorkPlanProgress 
                                tasks={lead.workPlan}
                                journeyStage={lead.journeyStage}
                              />
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {activeSubTab === 'notes' && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Customer Notes</h4>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Edit3 className="h-3 w-3" />
                              Edit
                            </Button>
                          </div>
                          <textarea
                            placeholder="Add notes about this customer..."
                            className="w-full p-3 border border-input rounded-lg text-sm resize-none"
                            rows={6}
                            defaultValue={`Initial interest in ${lead.vehicle}. Customer mentioned they need a reliable family vehicle. Budget appears flexible based on features. Good candidate for extended warranty discussion.`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeMainTab === 'customer-history' && (
              <div className="space-y-4">
                {/* History Section Header and Scope Tabs */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">History</h3>

                  {/* Deal vs Customer Scope Tabs - Smaller */}
                  <div className="flex gap-0.5 p-0.5 bg-muted rounded-md w-fit">
                    <button
                      onClick={() => setHistoryScope('deal')}
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-sm transition-colors",
                        historyScope === 'deal' 
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      This Deal Only
                    </button>
                    <button
                      onClick={() => setHistoryScope('customer')}
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-sm transition-colors",
                        historyScope === 'customer' 
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Full Customer
                    </button>
                  </div>
                </div>

                {/* Customer History Timeline */}
                <CustomerHistoryTimeline 
                  leadId={lead.id}
                  leadName={lead.name}
                  filter={historyFilter}
                  onFilterChange={setHistoryFilter}
                  scope={historyScope}
                />
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Call Simulation Modal */}
      {showCallModal && (
        <CallSimulationModal
          isOpen={showCallModal}
          onClose={() => setShowCallModal(false)}
          leadName={lead.name}
          phoneNumber={lead.phone || ""}
        />
      )}
    </div>
  );
}