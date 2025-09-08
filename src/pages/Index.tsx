import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeadsPriorityList } from '@/components/LeadsPriorityList';
import { LeadFocusView } from '@/components/LeadFocusView';
import { NotificationPanel } from '@/components/NotificationPanel';
import { ToastNotification } from '@/components/ToastNotification';
import { GoalsDashboard } from '@/components/GoalsDashboard';
import { MobileNavbar } from '@/components/MobileNavbar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { Button } from '@/components/ui/button';
import { Eye, List, Target, Users, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Lead } from '@/components/LeadCard';

// Mock data - in a real app this would come from your CRM API
const mockLeads: Lead[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    vehicle: '2024 Toyota Camry',
    status: 'new',
    priority: 'hot',
    lastActivity: '5 min ago',
    value: 28500,
    source: 'Website',
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
    keyInsight: 'Ready to make decision today with right financing',
    preferredContact: 'phone',
    budget: { min: 26000, max: 30000 },
    timeline: [
      { date: '2 days ago', action: 'Initial Inquiry', details: 'Submitted online form for Toyota Camry', type: 'contact' },
      { date: '1 day ago', action: 'Phone Call', details: 'Discussed financing options and scheduled visit', type: 'contact' },
      { date: 'Today 9am', action: 'Visited Dealership', details: 'Customer visited to view vehicles', type: 'visit' },
      { date: 'Today 10am', action: 'Test Drive', details: 'Completed 15-minute test drive', type: 'milestone' }
    ],
    workPlan: [
      { id: 'visit-1', title: 'Visit Stage - Attempt 1', description: 'Follow up on customer visit', dueDate: 'Now', status: 'pending', attemptNumber: 1, contactMethod: 'phone', journeyStage: 'visit' },
      { id: 'visit-2', title: 'Visit Stage - Attempt 2', description: 'Follow-up call if initial contact unsuccessful', dueDate: 'In 30 min', status: 'scheduled', attemptNumber: 2, contactMethod: 'phone', journeyStage: 'visit' },
      { id: 'visit-3', title: 'Visit Stage - Attempt 3', description: 'Text message if calls go unanswered', dueDate: 'In 1 hour', status: 'scheduled', attemptNumber: 3, contactMethod: 'text', journeyStage: 'visit' }
    ]
  },
  {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
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
  }
];

const Index = () => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>();
  const [viewMode, setViewMode] = useState<'list' | 'focus'>('list');
  const [focusedLeadId, setFocusedLeadId] = useState<string | null>(null);
  const [toastsPaused, setToastsPaused] = useState(false);
  const [toastQueue, setToastQueue] = useState<Array<{
    id: string;
    leadId: string;
    leadName: string;
    message: string;
    suggestedResponse: string;
  }>>([]);
  const { toast } = useToast();

  const handleLeadClick = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    setSelectedLead(lead);
    setFocusedLeadId(leadId);
  };

  const handleContact = (leadId: string, method: 'phone' | 'email' | 'text') => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      toast({
        title: `${method} contact initiated`,
        description: `Contacting ${lead.name} via ${method}`,
      });
    }
  };

  const handleViewDetails = (leadId: string) => {
    handleLeadClick(leadId);
  };

  const handleSelectFocusLead = (leadId: string | null) => {
    setFocusedLeadId(leadId);
    if (leadId) {
      const lead = leads.find(l => l.id === leadId);
      setSelectedLead(lead);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setFocusedLeadId(null);
  };

  const handleSendResponse = (toastId: string, message: string) => {
    console.log('Sending response:', { toastId, message });
    setToastQueue(prev => prev.filter(t => t.id !== toastId));
    
    toast({
      title: "Message Sent",
      description: "Your response has been sent to the lead",
    });
  };

  const handleEditResponse = () => {
    console.log('Edit response clicked');
  };

  const handleViewToastDetails = (toastId: string) => {
    const toastItem = toastQueue.find(t => t.id === toastId);
    if (toastItem) {
      const lead = leads.find(l => l.id === toastItem.leadId);
      if (lead) {
        setSelectedLead(lead);
        setFocusedLeadId(lead.id);
      }
    }
  };

  const handleDismissToast = (toastId: string) => {
    setToastQueue(prev => prev.filter(t => t.id !== toastId));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <MobileNavbar 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNotificationToggle={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
        isNotificationPanelOpen={isNotificationPanelOpen}
      />

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Dealership CRM</h1>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List View
            </Button>
            <Button
              variant={viewMode === 'focus' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('focus')}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Focus View
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/leads" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                All Leads
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={isNotificationPanelOpen ? "default" : "outline"}
            size="sm"
            onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </Button>
          <ThemeToggle />
        </div>
      </div>

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
        <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-73px)]">
          {/* Mobile: Stacked Layout */}
          <div className="lg:hidden">
            {/* Quick Leads List - Mobile */}
            <div className="border-b bg-muted/30 p-2">
              <LeadsPriorityList 
                leads={leads}
                onContact={handleContact}
                onViewDetails={handleViewDetails}
                onToggleNotifications={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                onTriggerToast={() => {}}
                onPauseToasts={() => setToastsPaused(!toastsPaused)}
                onTaskCompleted={() => {}}
                onCommunicationSent={() => {}}
                toastsPaused={toastsPaused}
                hasNotifications={isNotificationPanelOpen}
              />
            </div>

            {/* Goals Dashboard - Mobile */}
            <div className="p-4">
              <GoalsDashboard />
            </div>
          </div>

          {/* Desktop: Side-by-side Layout */}
          <div className="hidden lg:flex lg:flex-1 lg:overflow-hidden">
            <div className="flex-1 p-4 overflow-auto">
              <LeadsPriorityList 
                leads={leads}
                onContact={handleContact}
                onViewDetails={handleViewDetails}
                onToggleNotifications={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                onTriggerToast={() => {}}
                onPauseToasts={() => setToastsPaused(!toastsPaused)}
                onTaskCompleted={() => {}}
                onCommunicationSent={() => {}}
                toastsPaused={toastsPaused}
                hasNotifications={isNotificationPanelOpen}
              />
            </div>
            
            <div className="w-80 border-l bg-muted/30 overflow-auto">
              <GoalsDashboard />
            </div>
          </div>

          {/* Notification Panel */}
          <NotificationPanel 
            isOpen={isNotificationPanelOpen}
            onClose={() => setIsNotificationPanelOpen(false)}
            onContact={(leadId: string, method: 'phone' | 'email' | 'text') => {
              handleContact(leadId, method);
              setIsNotificationPanelOpen(false);
            }}
          />
        </div>
      )}

      {/* Mobile Toast Notifications */}
      <div className="fixed bottom-4 left-4 right-4 space-y-2 z-50 lg:top-4 lg:right-4 lg:left-auto lg:bottom-auto lg:w-80">
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