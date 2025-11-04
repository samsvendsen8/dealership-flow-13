import { useState } from 'react';
import { X, Phone, Mail, MessageCircle, User, Calendar, DollarSign, Car, Send, Edit3, ChevronDown, ChevronRight, PlayCircle, Timer, Check, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';
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
import { CustomerResponsePreview } from './CustomerResponsePreview';
import { useToast } from '@/hooks/use-toast';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLead?: Lead;
  onContact: (leadId: string, method: 'phone' | 'email' | 'text' | 'appointment') => void;
  contactMethod?: 'phone' | 'email' | 'text' | 'appointment';
  aiSuggestedResponse?: string;
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

export function NotificationPanel({ isOpen, onClose, selectedLead, onContact, contactMethod, aiSuggestedResponse }: NotificationPanelProps) {
  const [activeMainTab, setActiveMainTab] = useState<'contact' | 'customer-info' | 'customer-history'>('contact');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'notes'>('overview');
  const [responseText, setResponseText] = useState('');
  const [expandedHistoryItems, setExpandedHistoryItems] = useState<Set<string>>(new Set());
  const [selectedJourneyStage, setSelectedJourneyStage] = useState<string | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'text' | 'priority'>('all');
  const [historyScope, setHistoryScope] = useState<'deal' | 'customer'>('deal');
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
  const generateAIResponse = (method: 'phone' | 'email' | 'text' | 'appointment', lead: Lead) => {
    const responses = {
      phone: `Hi ${lead.name}! This is [Your Name] from [Dealership Name]. I noticed you've been interested in our ${lead.vehicle}. I wanted to personally reach out to see if you have any questions and help you schedule a test drive. What would be the best time for you to visit our showroom?`,
      email: `Subject: Your ${lead.vehicle} - Next Steps & Special Pricing\n\nHi ${lead.name},\n\nThank you for your interest in the ${lead.vehicle}! I'm excited to help you through this process.\n\nBased on your inquiry, I've prepared:\n• Detailed vehicle specifications\n• Current financing options\n• Available appointment times for test drives\n\nI'm here to answer any questions and make this as easy as possible for you. When would be a good time to connect?\n\nBest regards,\n[Your Name]`,
      text: `Hi ${lead.name}! This is [Your Name] from [Dealership]. Hope you're well! Still interested in the ${lead.vehicle}? I'd love to help schedule a test drive or answer any questions. When works best for you? 🚗`,
      appointment: `Hi ${lead.name}, I'd like to schedule an appointment for you to see the ${lead.vehicle} in person. We have availability this week for test drives and I can show you all the features. What day and time works best for your schedule?`
    };
    
    return responses[method];
  };

  const currentAIResponse = selectedLead && contactMethod ? 
    aiSuggestedResponse || generateAIResponse(contactMethod, selectedLead) :
    selectedLead ? generateAIResponse('text', selectedLead) : '';

  const handleContactMethodClick = (method: 'phone' | 'email' | 'text' | 'appointment') => {
    if (method === 'phone') {
      setShowCallModal(true);
    } else if (method === 'appointment') {
      // For appointments, switch to contact tab and prepare scheduling message
      setActiveMainTab('contact');
      if (selectedLead) {
        setResponseText(generateAIResponse('appointment', selectedLead));
      }
    } else {
      // Auto-switch to contact tab for messaging
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
    if (!selectedLead) return [];

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
            'Vehicle Interest': selectedLead.vehicle,
            'Budget Range': `$${selectedLead.budget?.min?.toLocaleString()} - $${selectedLead.budget?.max?.toLocaleString()}`,
            'Preferred Contact': selectedLead.preferredContact || 'Phone',
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
          transcript: `Spoke with ${selectedLead.name} about their interest in ${selectedLead.vehicle}. Customer mentioned they are actively shopping and comparing options. Discussed financing options and scheduled a visit for today. Customer seems motivated and ready to make a decision soon.`
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
          notes: `${selectedLead.name} arrived on time and test drove the ${selectedLead.vehicle}. Very impressed with the vehicle features and ride quality. Discussed pricing and trade-in options.`,
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

  if (!isOpen) {
    return null;
  }

  return (
    <div className={cn(
      "fixed right-0 top-0 h-full bg-background border-l border-border z-50 transition-all duration-300 ease-in-out",
      isOpen ? "w-[420px] translate-x-0" : "w-0 translate-x-full"
    )}>
      {selectedLead ? (
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Header + Tabs wrapper (white background) */}
            <div className="bg-white border rounded-lg p-4 space-y-4">
              {/* Header with close button */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{selectedLead.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={statusStyles[selectedLead.status]}>{selectedLead.status}</Badge>
                        <Badge variant="outline" className={cn(
                          "capitalize",
                          selectedLead.priority === 'hot' && 'border-hot-lead text-hot-lead',
                          selectedLead.priority === 'warm' && 'border-warm-lead text-warm-lead',
                          selectedLead.priority === 'cold' && 'border-cold-lead text-cold-lead'
                        )}>
                          {selectedLead.priority} priority
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Dashboard Sections */}
            <div className="space-y-4">
              {/* Quick Response Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      Quick Response
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">2 New</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{selectedLead.name}</p>
                      <Badge variant="destructive" className="text-xs">New</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedLead.vehicle}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        5m
                      </span>
                      <Button size="sm" className="h-7 text-xs">Respond</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>Avg Response Time: 4.2 min</span>
                    <span className="text-green-600">SLA Target: ✓ &lt; 5 min</span>
                  </div>
                </CardContent>
              </Card>

              {/* Appointments Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Appointments
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">Schedule New</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{selectedLead.name}</p>
                      <Badge variant="outline" className="text-xs">confirmed</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Today 2:00 PM • Test Drive
                    </p>
                    <p className="text-xs text-muted-foreground">{selectedLead.vehicle}</p>
                  </div>
                  <div className="text-xs text-muted-foreground pt-1">
                    Show Rate (30d): <span className="font-medium">72%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Log Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Quick Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <Phone className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-medium">Log Call</p>
                    </button>
                    <button className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <MessageCircle className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-medium">Log Text</p>
                    </button>
                    <button className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <User className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-medium">Walk-in</p>
                    </button>
                    <button className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <Car className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-medium">Test Drive</p>
                    </button>
                    <button className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <DollarSign className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-medium">Quote Sent</p>
                    </button>
                    <button className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <CheckCircle className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-medium">Note</p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Inventory Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Vehicle Inventory</CardTitle>
                    <span className="text-xs text-muted-foreground">24 Available</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{selectedLead.vehicle}</p>
                      <Badge variant="outline" className="text-xs">available</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Sport • #H24001 • Board A3</p>
                    <div className="flex justify-end mt-2">
                      <Button variant="outline" size="sm" className="h-7 text-xs">Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tab Navigation Container */}
            <div className="bg-white border rounded-lg p-4">
              {/* Tab Navigation */}
              <div className="flex gap-1 p-1 bg-white border rounded-lg">
                <button
                  onClick={() => setActiveMainTab('contact')}
                  className={cn(
                    "flex-1 py-1 px-2 h-7 text-xs font-medium rounded-md transition-colors",
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
                    "flex-1 py-1 px-2 h-7 text-xs font-medium rounded-md transition-colors",
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
                    "flex-1 py-1 px-2 h-7 text-xs font-medium rounded-md transition-colors",
                    activeMainTab === 'customer-history' 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  History
                </button>
              </div>
            </div>
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
                            if (messageToSend && selectedLead) {
                              try {
                                await sendMessage(
                                  selectedLead.id,
                                  messageToSend,
                                  contactMethod === 'phone' ? 'call' : contactMethod === 'email' ? 'email' : 'text',
                                  selectedLead.journeyStage
                                );
                                
                                toast({
                                  title: "Message Sent",
                                  description: `Your ${contactMethod || 'text'} has been sent and customer will auto-respond in 15 seconds.`,
                                });
                                
                                setResponseText('');
                                onContact(selectedLead.id, contactMethod || 'text');
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to send message. Please try again.",
                                  variant: "destructive"
                                });
                              }
                            }
                          }}
                          disabled={isLoading}
                        >
                          <Send className="h-4 w-4" />
                          {isLoading ? "Sending..." : `Send ${contactMethod === 'phone' ? 'Call' : contactMethod === 'email' ? 'Email' : 'Text'}`}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setResponseText(currentAIResponse)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Communication History */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Communication History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MessageHistory leadId={selectedLead.id} />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Customer Info Content */}
              {activeMainTab === 'customer-info' && (
                <div className="space-y-4">
                  {/* Lead Summary Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Lead Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Contact</p>
                          <div className="text-sm">
                            <p className="font-medium">{selectedLead.email}</p>
                            <p>{selectedLead.phone}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Vehicle Interest</p>
                          <p className="text-sm font-medium">{selectedLead.vehicle}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Estimated Value</p>
                          <p className="text-sm font-medium">${selectedLead.value.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Last Activity</p>
                          <p className="text-sm">{selectedLead.lastActivity}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Quick Actions</h3>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 gap-2"
                        onClick={() => handleContactMethodClick('phone')}
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 gap-2"
                        onClick={() => handleContactMethodClick('text')}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Text
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 gap-2"
                        onClick={() => handleContactMethodClick('email')}
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </Button>
                    </div>
                  </div>

                  {/* Sub-tabs for customer info */}
                  <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
                    <button
                      onClick={() => setActiveSubTab('overview')}
                      className={cn(
                        "flex-1 py-1.5 px-2 text-xs font-medium rounded transition-colors",
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
                        "flex-1 py-1.5 px-2 text-xs font-medium rounded transition-colors",
                        activeSubTab === 'notes' 
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Notes
                    </button>
                  </div>

                  {/* Overview Tab Content */}
                  {activeSubTab === 'overview' && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Lead Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Priority</span>
                              <Badge variant="outline" className={cn(
                                "capitalize",
                                selectedLead.priority === 'hot' && 'border-hot-lead text-hot-lead',
                                selectedLead.priority === 'warm' && 'border-warm-lead text-warm-lead',
                                selectedLead.priority === 'cold' && 'border-cold-lead text-cold-lead'
                              )}>
                                {selectedLead.priority}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Vehicle</span>
                              <span className="text-sm font-medium">{selectedLead.vehicle}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Est. Value</span>
                              <span className="text-sm font-medium">${selectedLead.value.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Notes</h4>
                          <p className="text-sm text-muted-foreground">{selectedLead.notes}</p>
                        </div>
                        
                        {selectedLead.keyInsight && (
                          <>
                            <Separator />
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Key Insight</h4>
                              <p className="text-sm text-muted-foreground">{selectedLead.keyInsight}</p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Notes Tab Content */}
                  {activeSubTab === 'notes' && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Lead Notes</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Add Note</label>
                          <textarea
                            placeholder="Add your notes about this lead..."
                            className="w-full p-3 border border-input rounded-lg text-sm resize-none"
                            rows={4}
                          />
                          <Button size="sm" className="w-full">Save Note</Button>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Previous Notes</h4>
                          <div className="space-y-2">
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-medium">System Note</span>
                                <span className="text-xs text-muted-foreground">Today 2:30 PM</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{selectedLead.notes}</p>
                            </div>
                            {selectedLead.keyInsight && (
                              <div className="p-3 bg-muted/30 rounded-lg">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-xs font-medium">AI Insight</span>
                                  <span className="text-xs text-muted-foreground">Today 1:15 PM</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{selectedLead.keyInsight}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Customer History Content */}
              {activeMainTab === 'customer-history' && (
                <div className="space-y-3">
                  {/* History Scope Toggle - No container */}
                  <div className="flex gap-1 bg-muted rounded-lg p-0.5">
                    <button
                      onClick={() => setHistoryScope('deal')}
                      className={cn(
                        "flex-1 py-1 px-2 h-7 text-xs font-medium rounded-md transition-colors",
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
                        "flex-1 py-1 px-2 h-7 text-xs font-medium rounded-md transition-colors",
                        historyScope === 'customer'
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Full Customer
                    </button>
                  </div>

                  {/* AI Overview Section - Analyzes content below */}
                  <AIHistoryOverview 
                    filter={historyFilter}
                    leadName={selectedLead.name}
                  />

                  {/* Original AI Overview Section */}
                  <AIHistoryOverview 
                    filter={historyFilter}
                    leadName={selectedLead.name}
                  />

                  <CustomerHistoryTimeline
                    leadId={selectedLead.id}
                    leadName={selectedLead.name}
                    filter={historyFilter}
                    onFilterChange={setHistoryFilter}
                    scope={historyScope}
                  />
                </div>
              )}
            </div>
          {/* Bottom padding for send button */}
          <div className="pb-6" />
        </ScrollArea>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Select a lead to view details</p>
        </div>
      )}
      
      {/* Call Simulation Modal */}
      {selectedLead && (
        <CallSimulationModal
          isOpen={showCallModal}
          onClose={() => setShowCallModal(false)}
          leadName={selectedLead.name}
          phoneNumber={selectedLead.phone}
        />
      )}
    </div>
  );
}
