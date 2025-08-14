import { useState } from 'react';
import { X, Phone, Mail, MessageCircle, User, Calendar, DollarSign, Car, Send, Edit3, ChevronDown, ChevronRight, PlayCircle, Clock, Check, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Lead } from './LeadCard';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'notes' | 'response'>('response');
  const [responseText, setResponseText] = useState('');
  const [expandedHistoryItems, setExpandedHistoryItems] = useState<Set<string>>(new Set());

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
        icon: Clock,
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
      'inquiry': [
        {
          id: 'first-contact',
          type: 'outbound',
          title: 'Initial Phone Call',
          timestamp: '2 days ago',
          icon: Phone,
          color: 'border-status-contacted',
          description: 'Left voicemail - no answer',
          expandable: true,
          content: {
            type: 'voicemail',
            duration: '45 seconds',
            transcript: `Hi ${selectedLead.name}, this is Alex from Premier Auto. Thanks for your interest in the ${selectedLead.vehicle}. I'd love to discuss your needs and schedule a test drive. Please call me back at (555) 123-4567. Looking forward to hearing from you!`
          }
        }
      ],
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
      ],
      'test-drive': [
        {
          id: 'test-drive',
          type: 'meeting',
          title: 'Test Drive Completed',
          timestamp: '2 hours ago',
          icon: Check,
          color: 'border-success',
          description: 'Successful test drive - customer very positive',
          expandable: true,
          content: {
            type: 'meeting',
            duration: '30 minutes',
            notes: `Excellent test drive! ${selectedLead.name} loved the handling and comfort. Asked about trade-in value for current vehicle. Ready to move forward with purchase.`,
            actions: ['Trade-in evaluation completed', 'Financing pre-approval started', 'Purchase proposal prepared']
          }
        }
      ]
    };

    // Add history based on current journey stage
    const currentStageIndex = ['inquiry', 'engaged', 'visit', 'test-drive', 'proposal', 'financing', 'sold', 'delivered'].indexOf(selectedLead.journeyStage);
    
    let allHistory: HistoryItem[] = [...baseHistory];
    
    if (currentStageIndex >= 0) allHistory.push(...(stageHistory.inquiry || []));
    if (currentStageIndex >= 1) allHistory.push(...(stageHistory.engaged || []));
    if (currentStageIndex >= 2) allHistory.push(...(stageHistory.visit || []));
    if (currentStageIndex >= 3) allHistory.push(...(stageHistory['test-drive'] || []));

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

      {selectedLead ? (
        <ScrollArea className="h-full pb-20">
          <div className="p-4 space-y-4">
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

            {/* Tabs */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              {['response', 'overview', 'history', 'notes'].map((tab) => (
                <button
                  key={tab}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
                    activeTab === tab 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => setActiveTab(tab as any)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <Card>
              <CardContent className="pt-6">
                {activeTab === 'response' && contactMethod && (
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
                        onClick={() => {
                          onContact(selectedLead.id, contactMethod);
                          setResponseText('');
                        }}
                      >
                        <Send className="h-4 w-4" />
                        Send {contactMethod === 'phone' ? 'Call' : contactMethod === 'email' ? 'Email' : 'Text'}
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
                
                {activeTab === 'overview' && (
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

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    {generateFakeHistory().map((item) => {
                      const IconComponent = item.icon;
                      const isExpanded = expandedHistoryItems.has(item.id);
                      
                      return (
                        <div key={item.id} className={`border-l-3 ${item.color} pl-4 pb-4`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className={`p-2 rounded-full ${
                                item.type === 'inbound' ? 'bg-success/10 text-success' :
                                item.type === 'outbound' ? 'bg-primary/10 text-primary' :
                                item.type === 'meeting' ? 'bg-hot-lead/10 text-hot-lead' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm">{item.title}</h4>
                                  <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                
                                {item.expandable && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 h-auto p-1 text-xs"
                                    onClick={() => toggleHistoryItem(item.id)}
                                  >
                                    {isExpanded ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                                    {isExpanded ? 'Hide Details' : 'View Details'}
                                  </Button>
                                )}
                                
                                {isExpanded && item.content && (
                                  <div className="mt-3 p-3 bg-muted/50 rounded-md border">
                                     {item.content.type === 'voicemail' && 'duration' in item.content && (
                                       <div className="space-y-2">
                                         <div className="flex items-center space-x-2">
                                           <PlayCircle className="h-4 w-4 text-primary" />
                                           <span className="text-sm font-medium">Voicemail Recording</span>
                                           <span className="text-xs text-muted-foreground">({item.content.duration})</span>
                                         </div>
                                         <div className="bg-background p-2 rounded text-xs">
                                           <strong>Transcript:</strong><br />
                                           {'transcript' in item.content && item.content.transcript}
                                         </div>
                                       </div>
                                     )}
                                     
                                     {item.content.type === 'text' && 'messages' in item.content && (
                                      <div className="space-y-2">
                                        <h5 className="text-sm font-medium">Text Conversation</h5>
                                        <div className="space-y-1">
                                          {item.content.messages.map((msg, idx) => (
                                            <div key={idx} className={`p-2 rounded text-xs ${
                                              msg.sender === 'customer' 
                                                ? 'bg-primary/10 text-primary ml-4' 
                                                : 'bg-muted text-foreground mr-4'
                                            }`}>
                                              <div className="font-medium">{msg.sender === 'customer' ? selectedLead.name : 'Me'}</div>
                                              <div>{msg.text}</div>
                                              <div className="text-xs opacity-70 mt-1">{msg.time}</div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                     
                                     {item.content.type === 'email' && 'subject' in item.content && 'body' in item.content && (
                                       <div className="space-y-2">
                                         <div className="flex items-center space-x-2">
                                           <Mail className="h-4 w-4 text-primary" />
                                           <span className="text-sm font-medium">Email Content</span>
                                         </div>
                                         <div className="bg-background p-2 rounded text-xs space-y-2">
                                           <div><strong>Subject:</strong> {item.content.subject}</div>
                                           <div><strong>Body:</strong></div>
                                           <div className="whitespace-pre-line">{item.content.body}</div>
                                         </div>
                                       </div>
                                     )}
                                     
                                     {item.content.type === 'meeting' && 'duration' in item.content && 'notes' in item.content && (
                                      <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <Clock className="h-4 w-4 text-hot-lead" />
                                          <span className="text-sm font-medium">Meeting Summary</span>
                                          <span className="text-xs text-muted-foreground">({item.content.duration})</span>
                                        </div>
                                         <div className="bg-background p-2 rounded text-xs space-y-2">
                                           <div><strong>Notes:</strong></div>
                                           <div>{item.content.notes}</div>
                                           {'actions' in item.content && item.content.actions && (
                                             <>
                                               <div><strong>Actions Completed:</strong></div>
                                               <ul className="list-disc list-inside">
                                                 {item.content.actions.map((action, idx) => (
                                                   <li key={idx}>{action}</li>
                                                 ))}
                                               </ul>
                                             </>
                                           )}
                                         </div>
                                       </div>
                                     )}
                                     
                                     {item.content.type === 'form' && 'data' in item.content && (
                                      <div className="space-y-2">
                                        <h5 className="text-sm font-medium">Initial Inquiry Details</h5>
                                        <div className="bg-background p-2 rounded text-xs space-y-1">
                                          {Object.entries(item.content.data).map(([key, value]) => (
                                            <div key={key}>
                                              <strong>{key}:</strong> {value}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'notes' && (
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