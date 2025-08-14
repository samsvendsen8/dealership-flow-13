import { useState, useEffect } from 'react';
import { LeadsPriorityList } from '@/components/LeadsPriorityList';
import { NotificationPanel } from '@/components/NotificationPanel';
import { ToastNotification } from '@/components/ToastNotification';
import { useToast } from '@/hooks/use-toast';
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
    stageProgress: 65
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
    stageProgress: 85
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
    stageProgress: 90
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
    stageProgress: 45
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
    stageProgress: 30
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
    stageProgress: 15
  }
];

const Index = () => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>();
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({
    leadName: '',
    message: '',
    suggestedResponse: ''
  });
  const { toast } = useToast();

  // Real-time lead simulation - moves leads through journey stages
  useEffect(() => {
    const interval = setInterval(() => {
      setLeads(prevLeads => {
        return prevLeads.map(lead => {
          // Random chance to progress a lead
          if (Math.random() > 0.85) {
            const stages: Lead['journeyStage'][] = ['inquiry', 'engaged', 'visit', 'test-drive', 'proposal', 'financing', 'sold', 'delivered'];
            const currentIndex = stages.indexOf(lead.journeyStage);
            
            // Move to next stage if not at the end
            if (currentIndex < stages.length - 1) {
              const nextStage = stages[currentIndex + 1];
              const newProgress = Math.min(100, lead.stageProgress + Math.floor(Math.random() * 20) + 10);
              
              return {
                ...lead,
                journeyStage: nextStage,
                stageProgress: newProgress,
                lastActivity: 'Just now',
                priority: newProgress > 70 ? 'hot' : newProgress > 40 ? 'warm' : 'cold'
              };
            }
          }
          return lead;
        });
      });
    }, 8000); // Update every 8 seconds for demo

    return () => clearInterval(interval);
  }, []);

  // Simulate hot lead notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const hotLeads = leads.filter(lead => lead.priority === 'hot');
      if (hotLeads.length > 0 && Math.random() > 0.7) {
        const randomLead = hotLeads[Math.floor(Math.random() * hotLeads.length)];
        const messages = [
          'Customer just viewed vehicle details online',
          'Customer requested financing information',
          'Customer scheduled a test drive',
          'Customer is currently browsing inventory',
          'Customer added vehicle to favorites'
        ];
        
        setToastData({
          leadName: randomLead.name,
          message: messages[Math.floor(Math.random() * messages.length)],
          suggestedResponse: `Hi ${randomLead.name}, I noticed you were looking at the ${randomLead.vehicle}. I'm here to answer any questions and can schedule a test drive whenever convenient for you!`
        });
        setShowToast(true);
      }
    }, 15000); // Show notification every 15 seconds for demo

    return () => clearInterval(interval);
  }, [leads]);

  const handleContact = (leadId: string, method: 'phone' | 'email' | 'text') => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      toast({
        title: `Contacting ${lead.name}`,
        description: `Initiating ${method} contact...`,
      });
    }
  };

  const handleViewDetails = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    setSelectedLead(lead);
    setIsNotificationPanelOpen(true);
  };

  const handleToggleNotifications = () => {
    setIsNotificationPanelOpen(!isNotificationPanelOpen);
  };

  const handleTriggerToast = () => {
    const hotLeads = leads.filter(lead => lead.priority === 'hot');
    if (hotLeads.length > 0) {
      const randomLead = hotLeads[Math.floor(Math.random() * hotLeads.length)];
      setToastData({
        leadName: randomLead.name,
        message: 'Customer just viewed vehicle details online',
        suggestedResponse: `Hi ${randomLead.name}, I noticed you were looking at the ${randomLead.vehicle}. I'm here to answer any questions and can schedule a test drive whenever convenient for you!`
      });
      setShowToast(true);
    }
  };

  const handleSendResponse = (message: string) => {
    toast({
      title: 'Message Sent',
      description: `Response sent to ${toastData.leadName}`,
    });
    setShowToast(false);
  };

  const handleEditResponse = () => {
    // In a real app, this would open a full editor
    console.log('Edit response');
  };

  const handleViewToastDetails = () => {
    const lead = leads.find(l => l.name === toastData.leadName);
    if (lead) {
      handleViewDetails(lead.id);
    }
    setShowToast(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <LeadsPriorityList
          leads={leads}
          onContact={handleContact}
          onViewDetails={handleViewDetails}
          onToggleNotifications={handleToggleNotifications}
          onTriggerToast={handleTriggerToast}
          hasNotifications={isNotificationPanelOpen || showToast}
        />
      </div>

      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        selectedLead={selectedLead}
        onContact={handleContact}
      />

      <ToastNotification
        isVisible={showToast}
        leadName={toastData.leadName}
        message={toastData.message}
        suggestedResponse={toastData.suggestedResponse}
        onSend={handleSendResponse}
        onEdit={handleEditResponse}
        onViewDetails={handleViewToastDetails}
        onDismiss={() => setShowToast(false)}
      />
    </div>
  );
};

export default Index;
