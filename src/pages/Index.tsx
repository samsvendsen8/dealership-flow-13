import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeadsPriorityList } from '@/components/LeadsPriorityList';
import { LeadFocusView } from '@/components/LeadFocusView';
import { NotificationPanel } from '@/components/NotificationPanel';
import { ToastNotification } from '@/components/ToastNotification';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { Button } from '@/components/ui/button';
import { Eye, List, Target } from 'lucide-react';
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
    timeline: [
      { date: '2 days ago', action: 'Initial Inquiry', details: 'Submitted online form for Toyota Camry', type: 'contact' },
      { date: '1 day ago', action: 'Phone Call', details: 'Discussed financing options and scheduled visit', type: 'contact' },
      { date: 'Today 9am', action: 'Arrived on Lot', details: 'Currently viewing vehicles on lot', type: 'visit' },
      { date: 'Today 10am', action: 'Test Drive', details: 'Completed 15-minute test drive', type: 'milestone' }
    ],
    workPlan: [
      { id: 'visit-1', title: 'Visit Stage - Attempt 1', description: 'Immediate contact while customer is on lot', dueDate: 'Now', status: 'pending', attemptNumber: 1, contactMethod: 'phone', journeyStage: 'visit' },
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
    tradeInVehicle: '2018 Honda Accord',
    timeline: [
      { date: '5 days ago', action: 'Referral Contact', details: 'Initial contact through referral program', type: 'contact' },
      { date: '3 days ago', action: 'First Call', details: 'Discussed vehicle requirements', type: 'contact' },
      { date: '2 days ago', action: 'Showroom Visit', details: 'Viewed multiple Honda models', type: 'visit' },
      { date: 'Yesterday', action: 'Test Drive', details: 'Test drove 2024 Honda Accord', type: 'milestone' },
      { date: '1 hour ago', action: 'Price Negotiation', details: 'Discussed pricing and trade-in value', type: 'contact' }
    ],
    workPlan: [
      { id: 'proposal-1', title: 'Proposal Stage - Attempt 1', description: 'Email detailed offer and trade-in value', dueDate: 'Today', status: 'pending', attemptNumber: 1, contactMethod: 'email', journeyStage: 'proposal' },
      { id: 'proposal-2', title: 'Proposal Stage - Attempt 2', description: 'Call to discuss proposal questions', dueDate: 'Tomorrow 10am', status: 'scheduled', attemptNumber: 2, contactMethod: 'phone', journeyStage: 'proposal' },
      { id: 'proposal-3', title: 'Proposal Stage - Attempt 3', description: 'Text to address any final concerns', dueDate: 'Day 3', status: 'scheduled', attemptNumber: 3, contactMethod: 'text', journeyStage: 'proposal' }
    ]
  },
  {
    id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
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
    journeyStage: 'proposal',
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
    budget: { min: 40000, max: 48000 },
    timeline: [
      { date: '1 week ago', action: 'Online Inquiry', details: 'Submitted interest form via Google Ads', type: 'contact' },
      { date: '5 days ago', action: 'Initial Call', details: 'Discussed BMW X3 lease options', type: 'contact' },
      { date: '3 days ago', action: 'Showroom Visit', details: 'Viewed X3, needs spouse approval', type: 'visit' },
      { date: '2 hours ago', action: 'Follow-up Email', details: 'Sent lease comparison document', type: 'contact' }
    ],
    workPlan: [
      { id: 'proposal-1', title: 'Proposal Stage - Attempt 1', description: 'Send detailed lease options and terms', dueDate: 'Today', status: 'pending', attemptNumber: 1, contactMethod: 'email', journeyStage: 'proposal' },
      { id: 'proposal-2', title: 'Proposal Stage - Attempt 2', description: 'Schedule call to include spouse in decision', dueDate: 'Tomorrow', status: 'scheduled', attemptNumber: 2, contactMethod: 'phone', journeyStage: 'proposal' },
      { id: 'proposal-3', title: 'Proposal Stage - Attempt 3', description: 'Text to confirm final decision timeline', dueDate: 'Day 3', status: 'scheduled', attemptNumber: 3, contactMethod: 'text', journeyStage: 'proposal' }
    ]
  },
  {
    id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
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
    journeyStage: 'visit',
    stageProgress: 45,
    contactAttempts: 1,
    responseRate: 100,
    daysSinceLastContact: 0,
    nextFollowUp: 'Monday 9am',
    dealProbability: 60,
    sentiment: 'neutral',
    keyInsight: 'Price sensitive - mentioned competitor pricing, needs value proposition',
    preferredContact: 'text',
    budget: { min: 35000, max: 40000 },
    timeline: [
      { date: '4 hours ago', action: 'Facebook Inquiry', details: 'Messaged about Ford F-150 pricing', type: 'contact' },
      { date: '3 hours ago', action: 'Phone Call', details: 'Discussed work truck needs and pricing', type: 'contact' },
      { date: '30 min ago', action: 'Arrived for Test Drive', details: 'Currently test driving F-150', type: 'visit' }
    ],
    workPlan: [
      { id: 'visit-1', title: 'Visit Stage - Attempt 1', description: 'Call to discuss budget and payment options', dueDate: 'Today', status: 'pending', attemptNumber: 1, contactMethod: 'phone', journeyStage: 'visit' },
      { id: 'visit-2', title: 'Visit Stage - Attempt 2', description: 'Email current inventory and pricing', dueDate: 'Tomorrow', status: 'scheduled', attemptNumber: 2, contactMethod: 'email', journeyStage: 'visit' },
      { id: 'visit-3', title: 'Visit Stage - Attempt 3', description: 'Text to schedule viewing appointment', dueDate: 'Day 3', status: 'scheduled', attemptNumber: 3, contactMethod: 'text', journeyStage: 'visit' }
    ]
  },
  {
    id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
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
    budget: { min: 25000, max: 32000 },
    timeline: [
      { date: '1 week ago', action: 'Email Campaign', details: 'Opened Subaru promotion email', type: 'contact' },
      { date: '3 days ago', action: 'Form Submission', details: 'Requested Outback brochure and pricing', type: 'contact' },
      { date: '1 day ago', action: 'Email Response', details: 'Replied asking about safety features', type: 'contact' }
    ],
    workPlan: [
      { id: 'engaged-1', title: 'Engaged Stage - Attempt 1', description: 'Send safety ratings and feature comparison', dueDate: 'Today', status: 'customer_replied', attemptNumber: 1, contactMethod: 'email', customerResponse: true, journeyStage: 'engaged' },
      { id: 'engaged-2', title: 'Engaged Stage - Attempt 2', description: 'Call to answer questions and schedule visit', dueDate: 'Tomorrow', status: 'not_needed', attemptNumber: 2, contactMethod: 'phone', journeyStage: 'engaged' },
      { id: 'engaged-3', title: 'Engaged Stage - Attempt 3', description: 'Text to confirm showroom appointment', dueDate: 'Day 3', status: 'not_needed', attemptNumber: 3, contactMethod: 'text', journeyStage: 'engaged' }
    ]
  },
  {
    id: 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
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
    journeyStage: 'engaged',
    stageProgress: 15,
    contactAttempts: 0,
    responseRate: 0,
    daysSinceLastContact: 0,
    nextFollowUp: 'Today 4pm',
    dealProbability: 95,
    sentiment: 'positive',
    keyInsight: 'Cash buyer with urgent timeline - immediate follow-up critical',
    preferredContact: 'phone',
    budget: { min: 40000, max: 50000 },
    timeline: [
      { date: '30 min ago', action: 'Website Inquiry', details: 'Submitted urgent purchase form for Tesla Model 3', type: 'contact' }
    ],
    workPlan: [
      { id: 'engaged-1', title: 'Engaged Stage - Attempt 1', description: 'Call within 15 minutes to secure initial contact', dueDate: 'Now', status: 'pending', attemptNumber: 1, contactMethod: 'phone', journeyStage: 'engaged' },
      { id: 'engaged-2', title: 'Engaged Stage - Attempt 2', description: 'Email to confirm availability and options', dueDate: 'In 1 hour', status: 'scheduled', attemptNumber: 2, contactMethod: 'email', journeyStage: 'engaged' },
      { id: 'engaged-3', title: 'Engaged Stage - Attempt 3', description: 'Text to coordinate next steps', dueDate: 'Today 6pm', status: 'scheduled', attemptNumber: 3, contactMethod: 'text', journeyStage: 'engaged' }
    ]
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

  // Real-time updates for lead changes
  useRealTimeUpdates((leadId: string, updates: any) => {
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === leadId 
          ? { ...lead, ...updates, lastActivity: updates.hasNewMessage ? 'Just replied' : lead.lastActivity }
          : lead
      )
    );
  });

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
        journeyStage: 'engaged' as const,
        stageProgress: 10
      },
      {
        name: 'Robert Kim',
        email: 'robert.kim@email.com',
        vehicle: '2024 Chevrolet Silverado',
        source: 'Facebook',
        value: 52000,
        notes: 'Looking for heavy-duty truck for business',
        journeyStage: 'engaged' as const,
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
        journeyStage: 'engaged' as const,
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
      // Only add new toasts if not paused
      if (!toastsPaused && Math.random() > 0.6) {
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
  }, [leads.length, toastsPaused]);

  // Random activity updates for existing leads
  useEffect(() => {
    const interval = setInterval(() => {
      if (!toastsPaused && Math.random() > 0.7) {
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
  }, [leads, toastsPaused]);

  // Real-time updates for lead journey stage changes
  useEffect(() => {
    const channel = supabase
      .channel('lead_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          // Update leads when journey stage changes
          setLeads(prevLeads => 
            prevLeads.map(lead => 
              lead.id === (payload.new as any).id 
                ? { ...lead, journeyStage: (payload.new as any).journey_stage }
                : lead
            )
          );
          
          // Show toast notification for journey stage updates
          toast({
            title: "Journey Stage Updated",
            description: "Lead moved to next stage after customer response",
            duration: 3000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

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

  const handleOpenNotificationPanel = (leadId: string, method: 'phone' | 'email' | 'text') => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setSelectedLead(lead);
      setContactMethod(method);
      setIsNotificationPanelOpen(true);
      
      // Generate AI response for the specific method and context
      const contextualResponse = generateContextualResponse(lead, method);
      setAiSuggestedResponse(contextualResponse);
    }
  };

  const generateContextualResponse = (lead: Lead, method: 'phone' | 'email' | 'text') => {
    const responses = {
      phone: `Hi ${lead.name}! This is [Your Name] from [Dealership Name]. I noticed you've shown strong interest in our ${lead.vehicle} and wanted to personally reach out. I have some exciting updates and would love to help you take the next step. What would be the best time for you to visit our showroom for a test drive?`,
      email: `Subject: Your ${lead.vehicle} - Exclusive Offer & Next Steps Available\n\nHi ${lead.name},\n\nI hope this email finds you well! I wanted to personally follow up on your interest in the ${lead.vehicle}.\n\nBased on your profile, I've secured:\n• Preferred pricing options tailored to your budget\n• Priority scheduling for test drives\n• Exclusive financing rates (subject to approval)\n\nI'm confident we can find the perfect solution for you. When would be convenient for a quick call to discuss your timeline and any questions you might have?\n\nLooking forward to helping you drive away in your new ${lead.vehicle}!\n\nBest regards,\n[Your Name]\n[Your Title]\n[Dealership Name]`,
      text: `Hi ${lead.name}! 👋 Hope you're having a great day! I have some exciting updates about the ${lead.vehicle} you were interested in. Just secured some special pricing options! 🚗💰 When's a good time for a quick chat? Can schedule your test drive right away! 📅✨`
    };
    
    return responses[method];
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

  const handlePauseToasts = () => {
    setToastsPaused(!toastsPaused);
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
          const stages: Lead['journeyStage'][] = ['engaged', 'visit', 'proposal', 'sold', 'delivered'];
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
                // Scroll to top of page
                window.scrollTo({ 
                  top: 0, 
                  behavior: 'smooth' 
                });
                
                // Try to zoom out the viewport if possible
                if (document.body.style.zoom !== undefined) {
                  document.body.style.zoom = '0.85';
                  
                  // Reset zoom after a delay
                  setTimeout(() => {
                    document.body.style.zoom = '1';
                  }, 300);
                } else {
                  // Fallback: try to adjust viewport scale
                  const viewport = document.querySelector('meta[name=viewport]');
                  if (viewport) {
                    const originalContent = viewport.getAttribute('content') || '';
                    viewport.setAttribute('content', 'width=device-width, initial-scale=0.85');
                    
                    setTimeout(() => {
                      viewport.setAttribute('content', originalContent);
                    }, 300);
                  }
                }
              }}
              className="gap-2 bg-background/95 backdrop-blur-sm border shadow-lg"
            >
              <Target className="h-4 w-4" />
              Fit View
            </Button>
          </div>

          <LeadsPriorityList 
            leads={leads}
            onContact={handleContact}
            onViewDetails={handleViewDetails}
            onOpenNotificationPanel={handleOpenNotificationPanel}
            onToggleNotifications={handleToggleNotifications}
            onTriggerToast={handleTriggerToast}
            onPauseToasts={handlePauseToasts}
            toastsPaused={toastsPaused}
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
                  const stages: Lead['journeyStage'][] = ['engaged', 'visit', 'proposal', 'sold', 'delivered'];
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
