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
  const [activeMainTab, setActiveMainTab] = useState<'customer-info' | 'journey'>('customer-info');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'history' | 'notes' | 'response'>('response');
  const [responseText, setResponseText] = useState('');
  const [expandedHistoryItems, setExpandedHistoryItems] = useState<Set<string>>(new Set());
  const [selectedJourneyStage, setSelectedJourneyStage] = useState<string | null>(null);
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

  // Update response text when AI suggestion changes
  if (aiSuggestedResponse && responseText !== aiSuggestedResponse) {
    setResponseText(aiSuggestedResponse);
  }

  
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

    const baseHistory: HistoryItem[] = [
      {
        id: 'created',
        type: 'system',
        title: 'Lead Created',
        timestamp: '3 days ago',
        icon: Timer,
        color: 'border-status-new',
        description: `${selectedLead.name} submitted inquiry through ${selectedLead.source}`,
        expandable: true,
        content: {
          type: 'form',
          data: {
            'Vehicle Interest': selectedLead.vehicle,
            'Preferred Contact': 'Phone',
            'Budget Range': `$${(selectedLead.value * 0.8).toLocaleString()} - $${selectedLead.value.toLocaleString()}`,
            'Additional Notes': selectedLead.notes || 'Interested in test driving soon'
          }
        }
      }
    ];

    // Add journey-specific history based on current stage
    const stageHistory: Record<string, HistoryItem[]> = {
      'engaged': [
        {
          id: 'text-response',
          type: 'inbound',
          title: 'Customer Text Reply',
          timestamp: '1 day ago',
          icon: MessageSquare,
          color: 'border-success',
          description: 'Customer responded via text',
          expandable: true,
          content: {
            type: 'text',
            messages: [
              { sender: 'customer', text: 'Hi Alex, got your voicemail. Still interested in the car. When can I see it?', time: '1 day ago' },
              { sender: 'me', text: `Great to hear from you! The ${selectedLead.vehicle} is available for viewing. Are you free this weekend?`, time: '1 day ago' },
              { sender: 'customer', text: 'Saturday afternoon works for me', time: '1 day ago' }
            ]
          }
        },
        {
          id: 'email-sent',
          type: 'outbound', 
          title: 'Vehicle Details Email',
          timestamp: '1 day ago',
          icon: Mail,
          color: 'border-primary',
          description: 'Sent detailed vehicle information',
          expandable: true,
          content: {
            type: 'email',
            subject: `${selectedLead.vehicle} - Complete Details & Pricing`,
            body: `Hi ${selectedLead.name},\n\nAs promised, here are the complete details for the ${selectedLead.vehicle}:\n\n• Price: $${selectedLead.value.toLocaleString()}\n• Mileage: 12,450 miles\n• Features: Premium package, leather seats, navigation\n• Warranty: 3 years/36,000 miles remaining\n\nI've attached the vehicle history report and additional photos. Looking forward to our meeting this Saturday!\n\nBest regards,\nAlex`
          }
        }
      ],
      'visit': [
        {
          id: 'showroom-visit',
          type: 'meeting',
          title: 'Showroom Visit',
          timestamp: '5 hours ago',
          icon: Check,
          color: 'border-hot-lead',
          description: 'Customer visited showroom',
          expandable: true,
          content: {
            type: 'meeting',
            duration: '45 minutes',
            notes: `${selectedLead.name} arrived on time and was very impressed with the ${selectedLead.vehicle}. Spent significant time examining the interior and asking detailed questions about financing options. Showed strong buying signals.`,
            actions: ['Vehicle inspection completed', 'Financing discussion initiated', 'Test drive scheduled']
          }
        }
      ]
    };

    // Add history based on current journey stage
    const currentStageIndex = ['engaged', 'visit', 'proposal', 'sold', 'delivered'].indexOf(selectedLead.journeyStage);
    
    let allHistory: HistoryItem[] = [...baseHistory];
    
    if (currentStageIndex >= 0) allHistory.push(...(stageHistory.engaged || []));
    if (currentStageIndex >= 1) allHistory.push(...(stageHistory.visit || []));

    return allHistory.reverse(); // Most recent first
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      'fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-strong z-50 transition-transform duration-300',
      isOpen ? 'translate-x-0' : 'translate-x-full'
    )}>
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Lead Details</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Tabs - Moved to Top */}
      <div className="flex space-x-1 bg-muted p-1 mx-4 mt-4 rounded-lg">
              {[
                { key: 'customer-info', label: 'Customer Info' },
                { key: 'journey', label: 'Journey' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
                    activeMainTab === tab.key 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => setActiveMainTab(tab.key as any)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

      {selectedLead ? (
        <ScrollArea className="h-full pb-20">
          <div className="p-4 space-y-4">
            {/* Show Lead Header and Quick Actions only for customer-info tab */}
            {activeMainTab === 'customer-info' && (
              <>
                {/* Lead Header */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{selectedLead.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{selectedLead.email}</p>
                        <p className="text-sm text-muted-foreground">{selectedLead.phone}</p>
                      </div>
                      <Badge className={statusStyles[selectedLead.status]} variant="secondary">
                        {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedLead.vehicle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-success" />
                        <span>${selectedLead.value.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedLead.lastActivity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedLead.source}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start gap-3 bg-gradient-primary hover:opacity-90"
                      onClick={() => onContact(selectedLead.id, 'phone')}
                    >
                      <Phone className="h-4 w-4" />
                      Call {selectedLead.name}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3"
                      onClick={() => onContact(selectedLead.id, 'text')}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Send Text Message
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3"
                      onClick={() => onContact(selectedLead.id, 'email')}
                    >
                      <Mail className="h-4 w-4" />
                      Send Email
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Customer Info Sub-tabs */}
            {activeMainTab === 'customer-info' && (
              <div className="flex space-x-1 bg-muted/50 p-1 rounded-lg">
                {['response', 'overview', 'history', 'notes'].map((tab) => (
                  <button
                    key={tab}
                    className={cn(
                      'flex-1 py-2 px-2 rounded-md text-xs font-medium transition-colors',
                      activeSubTab === tab 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    onClick={() => setActiveSubTab(tab as any)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {/* Tab Content */}
            <Card>
              <CardContent className="pt-6">
                {activeMainTab === 'customer-info' && activeSubTab === 'response' && contactMethod && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      {contactMethod === 'phone' && <Phone className="h-5 w-5 text-primary" />}
                      {contactMethod === 'email' && <Mail className="h-5 w-5 text-primary" />}
                      {contactMethod === 'text' && <MessageCircle className="h-5 w-5 text-primary" />}
                      <h4 className="font-medium">
                        {contactMethod === 'phone' && 'Phone Call Script'}
                        {contactMethod === 'email' && 'Email Response'}
                        {contactMethod === 'text' && 'Text Message'}
                      </h4>
                    </div>
                    
                    <div className="bg-primary/5 border border-primary/20 rounded-md p-3 mb-4">
                      <p className="text-xs font-medium text-primary mb-2">
                        🤖 AI Suggested Response:
                      </p>
                      <p className="text-sm text-foreground">{aiSuggestedResponse}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Response:</label>
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        className="w-full h-32 p-3 border border-input rounded-md text-sm resize-none"
                        placeholder={`Type your ${contactMethod} message here...`}
                      />
                    </div>

                     <div className="flex gap-2">
                       <Button 
                         className="flex-1 gap-2 bg-gradient-primary hover:opacity-90"
                         onClick={async () => {
                           if (responseText.trim()) {
                             try {
                               await sendMessage(
                                 selectedLead.id,
                                 responseText,
                                 contactMethod === 'phone' ? 'call' : contactMethod === 'email' ? 'email' : 'text',
                                 selectedLead.journeyStage
                               );
                               
                               toast({
                                 title: "Message Sent",
                                 description: `Your ${contactMethod} has been sent and customer will auto-respond in 15 seconds.`,
                               });
                               
                               setResponseText('');
                               onContact(selectedLead.id, contactMethod);
                             } catch (error) {
                               toast({
                                 title: "Error",
                                 description: "Failed to send message. Please try again.",
                                 variant: "destructive"
                               });
                             }
                           }
                         }}
                         disabled={!responseText.trim() || isLoading}
                       >
                         <Send className="h-4 w-4" />
                         {isLoading ? "Sending..." : `Send ${contactMethod === 'phone' ? 'Call' : contactMethod === 'email' ? 'Email' : 'Text'}`}
                       </Button>
                       <Button 
                         variant="outline"
                         onClick={() => setResponseText(aiSuggestedResponse || '')}
                       >
                         <Edit3 className="h-4 w-4" />
                       </Button>
                     </div>
                  </div>
                )}
                
                {activeMainTab === 'customer-info' && activeSubTab === 'overview' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Lead Priority</h4>
                      <Badge 
                        className={cn(
                          'text-white',
                          selectedLead.priority === 'hot' && 'bg-hot-lead',
                          selectedLead.priority === 'warm' && 'bg-warm-lead',
                          selectedLead.priority === 'cold' && 'bg-cold-lead'
                        )}
                      >
                        {selectedLead.priority.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                    
                    {selectedLead.timeOnLot && (
                      <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
                        <h4 className="font-medium text-warning mb-1">Customer on Lot</h4>
                        <p className="text-sm text-warning/80">{selectedLead.timeOnLot}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Vehicle Interest</h4>
                      <p className="text-sm text-muted-foreground">{selectedLead.vehicle}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Estimated Value</h4>
                      <p className="text-lg font-semibold text-success">
                        ${selectedLead.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                 {activeMainTab === 'customer-info' && activeSubTab === 'history' && (
                   <MessageHistory leadId={selectedLead.id} />
                 )}

                {activeMainTab === 'customer-info' && activeSubTab === 'notes' && (
                  <div className="space-y-3">
                    <textarea 
                      className="w-full h-32 p-3 border border-input rounded-md text-sm resize-none"
                      placeholder="Add notes about this lead..."
                      defaultValue={selectedLead.notes || ''}
                    />
                    <Button size="sm" className="w-full">
                      Save Notes
                    </Button>
                  </div>
                )}

                {activeMainTab === 'journey' && (
                  <div className="space-y-4">
                    <div className="mb-6">
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Journey Progress
                                  </h4>
                                  
                                  {/* Show journey advance button if customer has replied */}
                                  <JourneyAdvanceButton
                                    leadId={selectedLead.id}
                                    leadName={selectedLead.name}
                                    currentStage={selectedLead.journeyStage}
                                    leadStatus={selectedLead.status}
                                    hasCustomerReplied={selectedLead.status === 'qualified'}
                                    onStageAdvanced={() => {
                                      // Refresh could be handled here if needed
                                    }}
                                  />
                      
                      {(() => {
                        // Generate timeline events based on completed journey stages
                        const allStages = ['engaged', 'visit', 'proposal', 'sold', 'delivered'];
                        const currentStageIndex = allStages.indexOf(selectedLead.journeyStage);
                        // Only show stages BEFORE current as completed
                        const completedStages = allStages.slice(0, currentStageIndex);
                        
                        const stageEvents = completedStages.map((stage, index) => {
                          const stageInfo = {
                            engaged: { action: 'Engaged Customer', type: 'contact' as const, date: '2 days ago', details: 'Active communication established' },
                            visit: { action: 'Showroom Visit', type: 'visit' as const, date: '1 day ago', details: 'Customer visited showroom' },
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
                        
                        const mockWorkPlans: Record<string, Array<{
                          id: string;
                          title: string;
                          description: string;
                          dueDate: string;
                          status: 'pending' | 'completed' | 'missed' | 'scheduled' | 'customer_replied';
                          attemptNumber: number;
                          contactMethod: 'phone' | 'email' | 'text';
                          customerResponse?: boolean;
                        }>> = {
                              engaged: [
                                {
                                  id: '1',
                                  title: 'Initial Contact',
                                  description: 'Reach out to acknowledge inquiry and express interest',
                                  dueDate: 'Today',
                                  status: isCurrent ? 'pending' : (isCompleted ? 'customer_replied' : 'scheduled'),
                                  attemptNumber: 1,
                                  contactMethod: 'phone',
                                  customerResponse: isCompleted
                                },
                                {
                                  id: '2', 
                                  title: 'Follow-up Email',
                                  description: 'Send detailed vehicle info and availability',
                                  dueDate: 'Tomorrow',
                                  status: isCurrent ? 'scheduled' : (isCompleted ? 'completed' : 'scheduled'),
                                  attemptNumber: 2,
                                  contactMethod: 'email'
                                },
                                {
                                  id: '3',
                                  title: 'Text Check-in',
                                  description: 'Quick text to confirm interest and availability',
                                  dueDate: 'Day 3',
                                  status: 'scheduled',
                                  attemptNumber: 3,
                                  contactMethod: 'text'
                                }
                              ],
                          visit: [
                            {
                              id: '4',
                              title: 'Schedule Visit',
                              description: 'Book showroom appointment and send calendar invite',
                              dueDate: 'Today',
                              status: isCurrent && selectedLead.journeyStage === 'visit' ? 'pending' : (isCompleted ? 'customer_replied' : 'scheduled'),
                              attemptNumber: 1,
                              contactMethod: 'phone',
                              customerResponse: isCompleted && selectedLead.journeyStage !== 'visit'
                            },
                            {
                              id: '5',
                              title: 'Pre-visit Text',
                              description: 'Send directions and what to bring',
                              dueDate: 'Visit Day',
                              status: 'scheduled',
                              attemptNumber: 2,
                              contactMethod: 'text'
                            }
                          ],
                          proposal: [
                            {
                              id: '6',
                              title: 'Present Proposal',
                              description: 'Email formal offer and financing options',
                              dueDate: 'Today',
                              status: isCurrent && selectedLead.journeyStage === 'proposal' ? 'pending' : (isCompleted ? 'customer_replied' : 'scheduled'),
                              attemptNumber: 1,
                              contactMethod: 'email',
                              customerResponse: isCompleted && selectedLead.journeyStage !== 'proposal'
                            },
                            {
                              id: '7',
                              title: 'Follow-up Call',
                              description: 'Discuss questions and negotiate terms',
                              dueDate: 'Day 2',
                              status: 'scheduled',
                              attemptNumber: 2,
                              contactMethod: 'phone'
                            }
                          ],
                          sold: [
                            {
                              id: '8',
                              title: 'Contract Finalization',
                              description: 'Complete paperwork and payment processing',
                              dueDate: 'Today',
                              status: isCurrent && selectedLead.journeyStage === 'sold' ? 'pending' : (isCompleted ? 'customer_replied' : 'scheduled'),
                              attemptNumber: 1,
                              contactMethod: 'email',
                              customerResponse: isCompleted && selectedLead.journeyStage !== 'sold'
                            }
                          ],
                          delivered: [
                            {
                              id: '9',
                              title: 'Delivery Coordination',
                              description: 'Schedule vehicle pickup and final inspection',
                              dueDate: 'Today',
                              status: isCurrent && selectedLead.journeyStage === 'delivered' ? 'pending' : 'completed',
                              attemptNumber: 1,
                              contactMethod: 'phone'
                            }
                          ]
                        };
                        
                        const workPlan = mockWorkPlans[stageKey] || [];

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
                              {workPlan.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs">
                                     {workPlan.filter(t => t.status === 'customer_replied' || t.customerResponse).length > 0 ? 
                                       '✅ Customer responded!' : 
                                       `${workPlan.filter(t => t.status === 'pending').length} pending until response`}
                                  </Badge>
                                </div>
                              )}
                            </div>

                            {selectedJourneyStage === stageKey && workPlan.length > 0 && (
                              <div className="ml-9 space-y-2 border-l-2 border-muted pl-3 max-w-xs">
                                <h5 className="text-xs font-medium text-muted-foreground">
                                  Outreach Plan (Until Customer Responds)
                                </h5>
                                {workPlan.map((task) => {
                                  const statusIcons = {
                                    completed: CheckCircle,
                                    pending: Clock,
                                    missed: AlertCircle,
                                    scheduled: Calendar,
                                    customer_replied: CheckCircle,
                                  };
                                  
                                  const statusColors = {
                                    completed: 'text-success bg-success/10 border-success/20',
                                    pending: 'text-primary bg-primary/10 border-primary/20 ring-1 ring-primary/20',
                                    missed: 'text-destructive bg-destructive/10 border-destructive/20',
                                    scheduled: 'text-muted-foreground bg-muted/10 border-muted/20',
                                    customer_replied: 'text-success bg-gradient-to-r from-success/10 to-success/5 border-success/30',
                                  };
                                  
                                  const contactIcons = {
                                    phone: Phone,
                                    email: Mail,
                                    text: MessageCircle,
                                  };
                                  
                                  const StatusIcon = statusIcons[task.status];
                                  const ContactIcon = contactIcons[task.contactMethod];
                                  
                                  return (
                                    <div 
                                      key={task.id}
                                      className={cn(
                                        'p-2 rounded-md border text-xs break-words',
                                        statusColors[task.status]
                                      )}
                                    >
                                      <div className="flex items-start gap-2">
                                        <div className="flex items-center gap-1 mt-0.5 flex-shrink-0">
                                          <StatusIcon className="h-3 w-3" />
                                          <ContactIcon className="h-2.5 w-2.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium break-words">
                                            {task.status === 'customer_replied' ? '✅ Customer Responded!' :
                                             task.status === 'pending' ? `🎯 Attempt #${task.attemptNumber}: ${task.title}` :
                                             `Attempt #${task.attemptNumber}: ${task.title}`}
                                          </p>
                                          <p className="text-muted-foreground mt-0.5 break-words">
                                            {task.status === 'customer_replied' ? 'Goal achieved! Ready to move to next stage.' :
                                             task.status === 'pending' ? `Current focus: ${task.description}` :
                                             task.description}
                                          </p>
                                          <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs opacity-75">{task.dueDate}</span>
                                            <span className="text-xs opacity-75">{task.contactMethod}</span>
                                          </div>
                                          {task.status === 'customer_replied' && (
                                            <Badge className="mt-1 text-xs bg-success/20 text-success border-success/30">
                                              Stage can advance
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                                
                                {workPlan.some(t => t.status === 'customer_replied' || t.customerResponse) ? (
                                  <div className="text-xs text-center p-2 bg-success/5 border border-success/20 rounded-md">
                                    <span className="text-success font-medium">🎉 Success!</span>
                                    <span className="text-muted-foreground ml-1">Customer engagement achieved</span>
                                  </div>
                                ) : (
                                  <div className="text-xs text-center text-muted-foreground break-words">
                                    Continue attempts until customer responds
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Select a lead to view details</p>
        </div>
      )}
    </div>
  );
}