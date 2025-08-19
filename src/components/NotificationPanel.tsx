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
import { useToast } from '@/components/ui/use-toast';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLead?: Lead;
  onContact: (leadId: string, method: 'phone' | 'email' | 'text') => void;
  contactMethod?: 'phone' | 'email' | 'text';
  aiSuggestedResponse?: string;
}

const statusStyles = {
  new: 'bg-status-new text-white',
  contacted: 'bg-status-contacted text-white',
  qualified: 'bg-status-qualified text-white',
  closed: 'bg-status-closed text-white'
};

export function NotificationPanel({ isOpen, onClose, selectedLead, onContact, contactMethod, aiSuggestedResponse }: NotificationPanelProps) {
  const [activeMainTab, setActiveMainTab] = useState<'contact' | 'customer-info' | 'journey'>('contact');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'notes'>('overview');
  const [responseText, setResponseText] = useState('');
  const [expandedHistoryItems, setExpandedHistoryItems] = useState<Set<string>>(new Set());
  const [selectedJourneyStage, setSelectedJourneyStage] = useState<string | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
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
  const generateAIResponse = (method: 'phone' | 'email' | 'text', lead: Lead) => {
    const responses = {
      phone: `Hi ${lead.name}! This is [Your Name] from [Dealership Name]. I noticed you've been interested in our ${lead.vehicle}. I wanted to personally reach out to see if you have any questions and help you schedule a test drive. What would be the best time for you to visit our showroom?`,
      email: `Subject: Your ${lead.vehicle} - Next Steps & Special Pricing\n\nHi ${lead.name},\n\nThank you for your interest in the ${lead.vehicle}! I'm excited to help you through this process.\n\nBased on your inquiry, I've prepared:\n• Detailed vehicle specifications\n• Current financing options\n• Available appointment times for test drives\n\nI'm here to answer any questions and make this as easy as possible for you. When would be a good time to connect?\n\nBest regards,\n[Your Name]`,
      text: `Hi ${lead.name}! This is [Your Name] from [Dealership]. Hope you're well! Still interested in the ${lead.vehicle}? I'd love to help schedule a test drive or answer any questions. When works best for you? 🚗`
    };
    
    return responses[method];
  };

  const currentAIResponse = selectedLead && contactMethod ? 
    aiSuggestedResponse || generateAIResponse(contactMethod, selectedLead) :
    selectedLead ? generateAIResponse('text', selectedLead) : '';

  const handleContactMethodClick = (method: 'phone' | 'email' | 'text') => {
    if (method === 'phone') {
      setShowCallModal(true);
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
      isOpen ? "w-[500px] translate-x-0" : "w-0 translate-x-full"
    )}>
      {selectedLead ? (
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
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

            {/* Tab Navigation - moved up below user info */}
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
                  Customer Info
                </button>
                <button
                  onClick={() => setActiveMainTab('journey')}
                  className={cn(
                    "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors",
                    activeMainTab === 'journey' 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Journey
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
                            {selectedLead.timeOnLot && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Time on Lot</span>
                                <span className="text-sm font-medium">{selectedLead.timeOnLot}</span>
                              </div>
                            )}
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

              {/* Journey Content */}
              {activeMainTab === 'journey' && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      Customer Journey
                      <Badge variant="secondary" className="text-xs">
                        {selectedLead.journeyStage}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      {(() => {
                        const allStages = ['engaged', 'visit', 'proposal', 'sold', 'delivered'];
                        const currentStageIndex = Math.max(0, allStages.indexOf(selectedLead.journeyStage));
                        
                        // Journey stage timeline events
                        const stageEvents = allStages.slice(0, currentStageIndex + 1).map(stage => {
                          const stageInfo = {
                            engaged: { action: 'Customer Engaged', type: 'milestone' as const, date: '2 days ago', details: 'Initial contact established' },
                            visit: { action: 'Showroom Visit', type: 'milestone' as const, date: 'Yesterday', details: 'Test drive completed' },
                            proposal: { action: 'Proposal Sent', type: 'milestone' as const, date: '3 hours ago', details: 'Purchase proposal presented' },
                            sold: { action: 'Deal Closed', type: 'milestone' as const, date: '1 hour ago', details: 'Sale successfully completed' },
                            delivered: { action: 'Vehicle Delivered', type: 'milestone' as const, date: 'Just now', details: 'Vehicle delivered to customer' }
                          };
                          
                          return stageInfo[stage as keyof typeof stageInfo];
                        });

                        // Calculate progress percentage (only completed stages)
                        const progressPercentage = (currentStageIndex / allStages.length) * 100;

                        return (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-3 relative">
                                <div 
                                  className="bg-primary h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${progressPercentage}%` }}
                                />
                                <Timeline 
                                  events={stageEvents}
                                  className="absolute inset-0 h-3"
                                />
                              </div>
                              <span className="text-sm text-muted-foreground font-medium">{Math.round(progressPercentage)}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Progress: {currentStageIndex} of {allStages.length} stages completed • Currently in {selectedLead.journeyStage} stage
                            </p>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="space-y-3">
                      {['engaged', 'visit', 'proposal', 'sold', 'delivered'].map((stageKey, index) => {
                        const journeyStages = {
                          engaged: { label: 'Engaged', icon: '💬', color: 'bg-teal-500', description: 'Active communication established' },
                          visit: { label: 'Visit', icon: '📍', color: 'bg-purple-500', description: 'Customer visit arranged' },
                          proposal: { label: 'Proposal', icon: '📄', color: 'bg-yellow-500', description: 'Formal offer presented' },
                          sold: { label: 'Sold', icon: '👍', color: 'bg-green-500', description: 'Deal closed successfully' },
                          delivered: { label: 'Delivered', icon: '🚚', color: 'bg-emerald-500', description: 'Vehicle delivered to customer' }
                        };
                        
                        const stage = journeyStages[stageKey as keyof typeof journeyStages];
                        const allStages = Object.keys(journeyStages);
                        const currentStageIndex = allStages.indexOf(selectedLead.journeyStage);
                        const isCompleted = index < currentStageIndex;
                        const isCurrent = index === currentStageIndex;
                        const isFuture = index > currentStageIndex;
                        
                        // Use the same mock workPlan data as LeadCard
                        const mockWorkPlanData = selectedLead.workPlan || [];

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
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium",
                                isCompleted && "bg-success",
                                isCurrent && stage.color,
                                isFuture && "bg-muted-foreground"
                              )}>
                                {isCompleted ? <CheckCircle className="h-3 w-3" /> : stage.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm">{stage.label}</h4>
                                  {isCurrent && (
                                    <Badge variant="secondary" className="text-xs">Current</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{stage.description}</p>
                              </div>
                            </div>

                            {selectedJourneyStage === stageKey && mockWorkPlanData.length > 0 && (
                              <div className="ml-9">
                                 <WorkPlanProgress 
                                   tasks={mockWorkPlanData} 
                                   journeyStage={stageKey}
                                   currentLeadStage={selectedLead.journeyStage}
                                   onContactMethodClick={(method) => handleContactMethodClick(method)}
                                 />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
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
