import { useState, useEffect } from 'react';
import { LeadsPriorityList } from '@/components/LeadsPriorityList';
import { LeadFocusView } from '@/components/LeadFocusView';
import { NotificationPanel } from '@/components/NotificationPanel';
import { ToastNotification } from '@/components/ToastNotification';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Eye, List } from 'lucide-react';
import type { Lead } from '@/components/LeadCard';

// Mock data - in a real app this would come from your CRM API
const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    vehicle: '2024 Toyota Camry',
    status: 'new',
    priority: 'hot',
    lastActivity: '5 min ago',
    value: 28500,
    source: 'Website',
    timeOnLot: '15 minutes',
    notes: 'Customer expressed urgent interest in financing options',
    journeyStage: 'visit',
    stageProgress: 65,
    contactAttempts: 2,
    responseRate: 100,
    daysSinceLastContact: 0,
    nextFollowUp: 'Today 3pm',
    dealProbability: 90,
    sentiment: 'positive',
    lastAppointment: 'Today',
    keyInsight: 'Currently on lot - ready to make decision today with right financing',
    preferredContact: 'phone',
    budget: { min: 26000, max: 30000 },
    journeyTimeline: [
      {
        stage: 'Inquiry',
        startDate: '2024-01-15',
        completedDate: '2024-01-15',
        workPlan: [
          { id: 'in1', label: 'Initial response call', type: 'call', status: 'completed', attempts: 1, maxAttempts: 3, completedDate: '2024-01-15' },
          { id: 'in2', label: 'Send vehicle information', type: 'email', status: 'completed', attempts: 1, maxAttempts: 2, completedDate: '2024-01-15' }
        ],
        currentStep: 2
      },
      {
        stage: 'Visit',
        startDate: '2024-01-16',
        workPlan: [
          { id: 'v1', label: 'Welcome & tour', type: 'appointment', status: 'completed', attempts: 1, maxAttempts: 1, completedDate: '2024-01-16' },
          { id: 'v2', label: 'Discuss financing options', type: 'appointment', status: 'pending', attempts: 0, maxAttempts: 1, dueDate: 'Today 3pm' }
        ],
        currentStep: 1
      }
    ],
    currentWorkPlan: [
      { id: 'v1', label: 'Welcome & tour', type: 'appointment', status: 'completed', attempts: 1, maxAttempts: 1, completedDate: '2024-01-16' },
      { id: 'v2', label: 'Discuss financing options', type: 'appointment', status: 'pending', attempts: 0, maxAttempts: 1, dueDate: 'Today 3pm' }
    ],
    currentStepIndex: 1
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '(555) 234-5678',
    vehicle: '2024 Honda Accord',
    status: 'contacted',
    priority: 'hot',
    lastActivity: '1 hour ago',
    value: 32000,
    source: 'Referral',
    notes: 'Ready to purchase, waiting for trade-in appraisal',
    journeyStage: 'proposal',
    stageProgress: 85,
    contactAttempts: 3,
    responseRate: 67,
    daysSinceLastContact: 0,
    nextFollowUp: 'Tomorrow 2pm',
    dealProbability: 85,
    sentiment: 'positive',
    lastAppointment: 'Yesterday',
    keyInsight: 'Mentioned budget increase after seeing vehicle in person - ready to move forward',
    preferredContact: 'phone',
    budget: { min: 45000, max: 55000 },
    tradeInVehicle: '2018 Honda Accord'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '(555) 345-6789',
    vehicle: '2024 BMW X3',
    status: 'qualified',
    priority: 'warm',
    lastActivity: '2 hours ago',
    value: 45000,
    source: 'Google Ads',
    notes: 'Interested in lease options, needs to discuss with spouse',
    journeyStage: 'financing',
    stageProgress: 90,
    contactAttempts: 4,
    responseRate: 75,
    daysSinceLastContact: 1,
    nextFollowUp: 'Friday 10am',
    dealProbability: 70,
    sentiment: 'neutral',
    lastAppointment: '3 days ago',
    keyInsight: 'Spouse approval needed - scheduled joint call Friday morning',
    preferredContact: 'email',
    budget: { min: 40000, max: 48000 }
  },
  {
    id: '4',
    name: 'David Thompson',
    email: 'david.thompson@email.com',
    phone: '(555) 456-7890',
    vehicle: '2024 Ford F-150',
    status: 'new',
    priority: 'warm',
    lastActivity: '3 hours ago',
    value: 38000,
    source: 'Facebook',
    timeOnLot: '5 minutes',
    notes: 'Looking for work truck, budget conscious',
    journeyStage: 'test-drive',
    stageProgress: 45,
    contactAttempts: 1,
    responseRate: 100,
    daysSinceLastContact: 0,
    nextFollowUp: 'Monday 9am',
    dealProbability: 60,
    sentiment: 'neutral',
    keyInsight: 'Price sensitive - mentioned competitor pricing, needs value proposition',
    preferredContact: 'text',
    budget: { min: 35000, max: 40000 }
  },
  {
    id: '5',
    name: 'Lisa Park',
    email: 'lisa.park@email.com',
    phone: '(555) 567-8901',
    vehicle: '2024 Subaru Outback',
    status: 'contacted',
    priority: 'cold',
    lastActivity: '1 day ago',
    value: 29000,
    source: 'Email Campaign',
    notes: 'Initial inquiry, needs more information',
    journeyStage: 'engaged',
    stageProgress: 30,
    contactAttempts: 2,
    responseRate: 50,
    daysSinceLastContact: 1,
    dealProbability: 30,
    sentiment: 'neutral',
    lastAppointment: 'Never',
    keyInsight: 'Early stage - needs education about vehicle benefits and financing options',
    preferredContact: 'email',
    budget: { min: 25000, max: 32000 }
  },
  {
    id: '6',
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    phone: '(555) 678-9012',
    vehicle: '2024 Tesla Model 3',
    status: 'new',
    priority: 'hot',
    lastActivity: '30 min ago',
    value: 42000,
    source: 'Website',
    notes: 'Cash buyer, ready to purchase today',
    journeyStage: 'inquiry',
    stageProgress: 15,
    contactAttempts: 0,
    responseRate: 0,
    daysSinceLastContact: 0,
    nextFollowUp: 'Today 4pm',
    dealProbability: 95,
    sentiment: 'positive',
    keyInsight: 'Cash buyer with urgent timeline - immediate follow-up critical',
    preferredContact: 'phone',
    budget: { min: 40000, max: 50000 }
  }
];

const Index = () => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>();
  const [viewMode, setViewMode] = useState<'list' | 'focus'>('list');
  const [focusedLeadId, setFocusedLeadId] = useState<string | null>(null);
  const [toastQueue, setToastQueue] = useState<Array<{
    id: string;
    leadId: string;
    leadName: string;
    message: string;
    suggestedResponse: string;
  }>>([]);
  const { toast } = useToast();

  // Real-time new lead generation - simulates incoming leads
  useEffect(() => {
    const newLeadTemplates = [
      {
        name: 'Jennifer Martinez',
        email: 'jennifer.martinez@email.com',
        vehicle: '2024 Mazda CX-5',
        source: 'Website',
        value: 31000,
        notes: 'Interested in safety features and warranty',
        journeyStage: 'inquiry' as const,
        stageProgress: 10
      },
      {
        name: 'Robert Kim',
        email: 'robert.kim@email.com',
        vehicle: '2024 Chevrolet Silverado',
        source: 'Facebook',
        value: 52000,
        notes: 'Looking for heavy-duty truck for business',
        journeyStage: 'inquiry' as const,
        stageProgress: 15
      },
      {
        name: 'Amanda Foster',
        email: 'amanda.foster@email.com',
        vehicle: '2024 Audi Q5',
        source: 'Google Ads',
        value: 48000,
        notes: 'Premium features important, wants luxury',
        journeyStage: 'engaged' as const,
        stageProgress: 25
      },
      {
        name: 'Carlos Rivera',
        email: 'carlos.rivera@email.com',
        vehicle: '2024 Hyundai Tucson',
        source: 'Referral',
        value: 35000,
        notes: 'First-time buyer, needs financing help',
        journeyStage: 'inquiry' as const,
        stageProgress: 8
      },
      {
        name: 'Michelle Wong',
        email: 'michelle.wong@email.com',
        vehicle: '2024 Lexus RX',
        source: 'Website',
        value: 55000,
        notes: 'Returning customer, ready to upgrade',
        journeyStage: 'engaged' as const,
        stageProgress: 35
      }
    ];

    const interval = setInterval(() => {
      // 40% chance of new lead every interval
      if (Math.random() > 0.6) {
        const template = newLeadTemplates[Math.floor(Math.random() * newLeadTemplates.length)];
        const leadCount = leads.length;
        
        const newLead: Lead = {
          id: `new-${Date.now()}`,
          name: template.name,
          email: template.email,
          phone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          vehicle: template.vehicle,
          status: 'new',
          priority: Math.random() > 0.7 ? 'hot' : Math.random() > 0.4 ? 'warm' : 'cold',
          lastActivity: 'Just now',
          value: template.value + Math.floor(Math.random() * 5000) - 2500,
          source: template.source,
          notes: template.notes,
          journeyStage: template.journeyStage,
          stageProgress: template.stageProgress,
          ...(Math.random() > 0.7 && { timeOnLot: `${Math.floor(Math.random() * 30) + 5} minutes` })
        };

        setLeads(prevLeads => [newLead, ...prevLeads]);
        console.log('Adding new lead to toast queue:', newLead.name);
        
        // Add toast notification for hot leads
        if (newLead.priority === 'hot') {
          const newToast = {
            id: `${newLead.id}-${Date.now()}`,
            leadId: newLead.id,
            leadName: newLead.name,
            message: `New ${newLead.priority} lead just came in!`,
            suggestedResponse: `Hi ${newLead.name}! Thanks for your interest in the ${newLead.vehicle}. I'd love to help you find the perfect vehicle. When would be a good time to discuss your needs?`
          };
          console.log('Adding toast:', newToast);
          setToastQueue(prev => {
            console.log('Previous toast queue:', prev);
            const newQueue = [...prev, newToast];
            console.log('New toast queue:', newQueue);
            return newQueue;
          });
        }
      }
    }, 12000); // New lead every 12 seconds on average

    return () => clearInterval(interval);
  }, [leads.length]);

  // Random activity updates for existing leads
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomLead = leads[Math.floor(Math.random() * leads.length)];
        if (randomLead && randomLead.priority === 'hot') {
          const activities = [
            'viewed vehicle photos',
            'requested pricing information',
            'browsed financing options',
            'checked availability',
            'viewed similar models'
          ];
          
          const activity = activities[Math.floor(Math.random() * activities.length)];
          setToastQueue(prev => [...prev, {
            id: `${randomLead.id}-${Date.now()}`,
            leadId: randomLead.id,
            leadName: randomLead.name,
            message: `${randomLead.name} just ${activity}`,
            suggestedResponse: `Hi ${randomLead.name}, I saw you were interested in the ${randomLead.vehicle}. I'm here to help with any questions and can arrange a test drive at your convenience!`
          }]);
        }
      }
    }, 20000); // Activity notification every 20 seconds

    return () => clearInterval(interval);
  }, [leads]);

  const [contactMethod, setContactMethod] = useState<'phone' | 'email' | 'text' | undefined>();
  const [aiSuggestedResponse, setAiSuggestedResponse] = useState<string>('');

  const handleContact = (leadId: string, method: 'phone' | 'email' | 'text') => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      // Generate AI suggested response based on contact method and lead data
      const generateAiResponse = (contactMethod: string, leadData: Lead) => {
        const responses = {
          phone: `Hi ${leadData.name}, this is [Your Name] from [Dealership]. I wanted to personally reach out about your interest in the ${leadData.vehicle}. I have some great financing options and would love to schedule a time for you to see the vehicle. When would be convenient for a quick call?`,
          email: `Dear ${leadData.name},\n\nThank you for your interest in the ${leadData.vehicle}! I wanted to reach out personally to answer any questions you might have.\n\nBased on your inquiry, I believe this vehicle would be perfect for your needs. I'd be happy to:\n• Arrange a test drive at your convenience\n• Discuss financing options\n• Provide detailed specifications\n\nWhen would be a good time to connect?\n\nBest regards,\n[Your Name]`,
          text: `Hi ${leadData.name}! Thanks for your interest in the ${leadData.vehicle}. I'm here to help with any questions and can arrange a test drive whenever works for you. What's the best time to call? - [Your Name] at [Dealership]`
        };
        return responses[contactMethod as keyof typeof responses];
      };

      setContactMethod(method);
      setAiSuggestedResponse(generateAiResponse(method, lead));
      setSelectedLead(lead);
      setIsNotificationPanelOpen(true);
    }
  };

  const handleExecuteStep = (leadId: string, stepId: string, type: 'call' | 'email' | 'text' | 'appointment' | 'follow-up') => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      // In a real app, this would execute the work plan step
      console.log(`Executing step ${stepId} of type ${type} for lead ${leadId}`);
      
      // Show appropriate contact method or action
      switch (type) {
        case 'call':
          handleContact(leadId, 'phone');
          break;
        case 'email':
          handleContact(leadId, 'email');
          break;
        case 'text':
          handleContact(leadId, 'text');
          break;
        default:
          // For appointments and other actions, show details
          handleViewDetails(leadId);
          break;
      }
    }
  };

  const handleViewDetails = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (viewMode === 'focus') {
      setFocusedLeadId(leadId);
    } else {
      setSelectedLead(lead);
      setIsNotificationPanelOpen(true);
    }
  };

  const handleSelectFocusLead = (leadId: string) => {
    setFocusedLeadId(leadId);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setFocusedLeadId(null);
  };

  const handleToggleNotifications = () => {
    setIsNotificationPanelOpen(!isNotificationPanelOpen);
  };

  const handleTriggerToast = () => {
    const hotLeads = leads.filter(lead => lead.priority === 'hot');
    if (hotLeads.length > 0) {
      const randomLead = hotLeads[Math.floor(Math.random() * hotLeads.length)];
      setToastQueue(prev => [...prev, {
        id: `${randomLead.id}-${Date.now()}`,
        leadId: randomLead.id,
        leadName: randomLead.name,
        message: 'Customer just viewed vehicle details online',
        suggestedResponse: `Hi ${randomLead.name}, I noticed you were looking at the ${randomLead.vehicle}. I'm here to answer any questions and can schedule a test drive whenever convenient for you!`
      }]);
    }
  };

  const handleSendResponse = (toastId: string, message: string) => {
    // Find the toast and its associated lead
    const toastItem = toastQueue.find(t => t.id === toastId);
    if (!toastItem) return;
    
    // In a real app, this would send the message via the selected method
    console.log('Sending response:', message);
    
    // Update the lead status
    setLeads(prevLeads => 
      prevLeads.map(lead => {
        if (lead.id === toastItem.leadId) {
          const stages: Lead['journeyStage'][] = ['inquiry', 'engaged', 'visit', 'test-drive', 'proposal', 'financing', 'sold', 'delivered'];
          const currentIndex = stages.indexOf(lead.journeyStage);
          const nextStage = currentIndex < stages.length - 1 ? stages[currentIndex + 1] : lead.journeyStage;
          
          return {
            ...lead,
            journeyStage: nextStage,
            stageProgress: Math.min(100, lead.stageProgress + 15),
            lastActivity: 'Just replied',
            status: 'contacted' as const
          };
        }
        return lead;
      })
    );
    
    // Remove the toast from queue
    setToastQueue(prev => prev.filter(t => t.id !== toastId));
    
    toast({
      title: "Response Sent!",
      description: `Your message was sent to ${toastItem.leadName}`,
    });
  };

  const handleEditResponse = () => {
    // In a real app, this would open a full editor
    console.log('Edit response');
  };

  const handleViewToastDetails = (toastId: string) => {
    const toastItem = toastQueue.find(t => t.id === toastId);
    if (!toastItem) return;
    
    const lead = leads.find(l => l.id === toastItem.leadId);
    if (lead) {
      setSelectedLead(lead);
      setIsNotificationPanelOpen(true);
      // Remove the toast from queue
      setToastQueue(prev => prev.filter(t => t.id !== toastId));
    }
  };

  const handleDismissToast = (toastId: string) => {
    setToastQueue(prev => prev.filter(t => t.id !== toastId));
  };

  return (
    <div className="min-h-screen bg-background">
      {viewMode === 'focus' ? (
        <LeadFocusView 
          leads={leads}
          selectedLeadId={focusedLeadId}
          onSelectLead={handleSelectFocusLead}
          onContact={handleContact}
          onViewDetails={handleViewDetails}
          onBack={handleBackToList}
        />
      ) : (
        <div className="container mx-auto px-6 py-8">
          {/* View Toggle Button */}
          <div className="fixed top-4 left-4 z-40">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setViewMode('focus');
                if (leads.length > 0) {
                  setFocusedLeadId(leads[0].id);
                }
              }}
              className="gap-2 bg-background/95 backdrop-blur-sm border shadow-lg"
            >
              <Eye className="h-4 w-4" />
              Focus View
            </Button>
          </div>

          <LeadsPriorityList
            leads={leads}
            onContact={handleContact}
            onViewDetails={handleViewDetails}
            onExecuteStep={handleExecuteStep}
            onToggleNotifications={handleToggleNotifications}
            onTriggerToast={handleTriggerToast}
            hasNotifications={isNotificationPanelOpen || toastQueue.length > 0}
          />
        </div>
      )}

      {viewMode === 'list' && (
        <NotificationPanel
          isOpen={isNotificationPanelOpen}
          onClose={() => {
            setIsNotificationPanelOpen(false);
            setContactMethod(undefined);
            setAiSuggestedResponse('');
          }}
          selectedLead={selectedLead}
          onContact={(leadId, method) => {
            setLeads(prevLeads => 
              prevLeads.map(l => {
                if (l.id === leadId) {
                  const stages: Lead['journeyStage'][] = ['inquiry', 'engaged', 'visit', 'test-drive', 'proposal', 'financing', 'sold', 'delivered'];
                  const currentIndex = stages.indexOf(l.journeyStage);
                  const nextStage = currentIndex < stages.length - 1 ? stages[currentIndex + 1] : l.journeyStage;
                  
                  return {
                    ...l,
                    journeyStage: nextStage,
                    stageProgress: Math.min(100, l.stageProgress + 15),
                    lastActivity: `${method} contact sent`,
                    status: 'contacted' as const
                  };
                }
                return l;
              })
            );
            
            toast({
              title: `Message Sent`,
              description: `${method} sent to ${selectedLead?.name} - Journey stage updated!`,
            });
            
            setIsNotificationPanelOpen(false);
            setContactMethod(undefined);
            setAiSuggestedResponse('');
          }}
          contactMethod={contactMethod}
          aiSuggestedResponse={aiSuggestedResponse}
        />
      )}

      {/* Stacked Toast Notifications */}
      <div className="fixed top-4 right-4 space-y-3 z-50">
        {toastQueue.map((toast, index) => (
          <ToastNotification
            key={toast.id}
            isVisible={true}
            leadName={toast.leadName}
            message={toast.message}
            suggestedResponse={toast.suggestedResponse}
            onSend={(message) => handleSendResponse(toast.id, message)}
            onEdit={handleEditResponse}
            onViewDetails={() => handleViewToastDetails(toast.id)}
            onDismiss={() => handleDismissToast(toast.id)}
            stackIndex={index}
          />
        ))}
      </div>
    </div>
  );
};

export default Index;
