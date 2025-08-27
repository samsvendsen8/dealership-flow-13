import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Search, Phone, Mail, MessageSquare, Calendar, Filter, SortDesc } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Lead } from '@/components/LeadCard';

// Mock data for now - in a real app this would come from Supabase
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
    keyInsight: 'Currently on lot - ready to make decision today with right financing',
    preferredContact: 'phone',
    budget: { min: 26000, max: 30000 }
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
    tradeInVehicle: '2018 Honda Accord'
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
    budget: { min: 40000, max: 48000 }
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
    notes: 'Looking for work truck, budget conscious',
    journeyStage: 'visit',
    stageProgress: 45,
    contactAttempts: 1,
    responseRate: 100,
    daysSinceLastContact: 0,
    dealProbability: 60,
    sentiment: 'neutral',
    budget: { min: 35000, max: 40000 }
  },
  {
    id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    name: 'Lisa Park',
    email: 'lisa.park@email.com',
    phone: '(555) 567-8901',
    vehicle: '2024 Subaru Outback',
    status: 'contacted',
    priority: 'warm',
    lastActivity: '30 min ago',
    value: 29000,
    source: 'Email Campaign',
    notes: 'Customer replied with questions + missed previous call - needs follow-up',
    journeyStage: 'engaged',
    stageProgress: 40,
    contactAttempts: 3,
    responseRate: 67,
    daysSinceLastContact: 0,
    dealProbability: 55,
    sentiment: 'positive',
    budget: { min: 25000, max: 32000 }
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
    budget: { min: 40000, max: 50000 }
  }
];

const priorityColors = {
  hot: 'bg-destructive/10 text-destructive border-destructive/20',
  warm: 'bg-orange-100 text-orange-800 border-orange-200',
  cold: 'bg-blue-100 text-blue-800 border-blue-200'
};

const statusColors = {
  new: 'bg-green-100 text-green-800 border-green-200',
  contacted: 'bg-blue-100 text-blue-800 border-blue-200',
  qualified: 'bg-purple-100 text-purple-800 border-purple-200',
  proposal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  won: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  lost: 'bg-gray-100 text-gray-800 border-gray-200'
};

const journeyStageColors = {
  initial_inquiry: 'bg-gray-100 text-gray-800',
  engaged: 'bg-blue-100 text-blue-800',
  visit: 'bg-orange-100 text-orange-800',
  proposal: 'bg-purple-100 text-purple-800',
  negotiation: 'bg-yellow-100 text-yellow-800',
  closing: 'bg-emerald-100 text-emerald-800'
};

const journeyStages = [
  { key: 'initial_inquiry', label: 'Initial Inquiry', color: 'bg-gray-500' },
  { key: 'engaged', label: 'Engaged', color: 'bg-blue-500' },
  { key: 'visit', label: 'Visit', color: 'bg-orange-500' },
  { key: 'proposal', label: 'Proposal', color: 'bg-purple-500' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-yellow-500' },
  { key: 'closing', label: 'Closing', color: 'bg-emerald-500' }
];

const getJourneyProgress = (stage: string) => {
  const stageIndex = journeyStages.findIndex(s => s.key === stage);
  return stageIndex >= 0 ? ((stageIndex + 1) / journeyStages.length) * 100 : 0;
};

const formatLastContact = (lastActivity: string) => {
  return lastActivity || 'Never';
};

const LeadsList = () => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [journeyStageFilter, setJourneyStageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastContact');

  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
      const matchesJourneyStage = journeyStageFilter === 'all' || lead.journeyStage === journeyStageFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesJourneyStage;
    });

    // Sort by last activity (most recent first)
    if (sortBy === 'lastContact') {
      filtered.sort((a, b) => {
        const aTime = a.daysSinceLastContact || 999;
        const bTime = b.daysSinceLastContact || 999;
        return aTime - bTime;
      });
    } else if (sortBy === 'value') {
      filtered.sort((a, b) => (b.value || 0) - (a.value || 0));
    } else if (sortBy === 'priority') {
      const priorityOrder = { hot: 3, warm: 2, cold: 1 };
      filtered.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
    }

    return filtered;
  }, [leads, searchTerm, statusFilter, priorityFilter, journeyStageFilter, sortBy]);

  const handleContact = (leadId: string, method: 'phone' | 'email' | 'text') => {
    console.log(`Contacting lead ${leadId} via ${method}`);
    // In a real app, this would trigger the contact flow
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header - Compact */}
      <div className="border-b bg-card flex-shrink-0">
        <div className="container mx-auto px-4 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="h-8">
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Back
                </Button>
              </Link>
              <h1 className="text-lg font-semibold text-foreground">All Leads</h1>
            </div>
            <div className="text-xs text-muted-foreground">
              {filteredAndSortedLeads.length} of {leads.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Flex Fill */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 h-full flex flex-col">
          {/* Filters - Compact Horizontal Bar */}
          <div className="border rounded-lg p-2 flex-shrink-0 bg-card">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 h-8 text-xs"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={journeyStageFilter} onValueChange={setJourneyStageFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Journey Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="initial_inquiry">Initial Inquiry</SelectItem>
                  <SelectItem value="engaged">Engaged</SelectItem>
                  <SelectItem value="visit">Visit</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closing">Closing</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastContact">Last Contact</SelectItem>
                  <SelectItem value="value">Deal Value</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Leads Table - Flex Fill */}
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-0.5 p-2">
                  {filteredAndSortedLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="border rounded-lg p-2 hover:bg-muted/50 transition-colors animate-fade-in"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-11 gap-2 items-center">
                        {/* Lead Info */}
                        <div className="lg:col-span-2">
                          <h3 className="font-semibold text-xs text-foreground">{lead.name}</h3>
                          <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                          <p className="text-xs text-muted-foreground">{lead.phone}</p>
                        </div>

                        {/* Vehicle & Value */}
                        <div className="lg:col-span-2">
                          <p className="font-medium text-xs text-foreground truncate">{lead.vehicle}</p>
                          <p className="text-xs text-muted-foreground">
                            ${(lead.value || 0).toLocaleString()}
                          </p>
                        </div>

                        {/* Status & Priority */}
                        <div className="lg:col-span-1">
                          <div className="flex flex-col gap-0.5">
                            <Badge className={`${statusColors[lead.status] || 'bg-gray-100 text-gray-800'} text-xs px-1.5 py-0.5 h-5`}>
                              {lead.status}
                            </Badge>
                            <Badge className={`${priorityColors[lead.priority]} text-xs px-1.5 py-0.5 h-5`}>
                              {lead.priority}
                            </Badge>
                          </div>
                        </div>

                        {/* Journey Stage with Visual Progress */}
                        <div className="lg:col-span-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between">
                              <Badge className={`${journeyStageColors[lead.journeyStage] || 'bg-gray-100 text-gray-800'} text-xs px-1.5 py-0.5 h-5`}>
                                {lead.journeyStage?.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {lead.stageProgress}%
                              </span>
                            </div>
                            
                            {/* Journey Progress Bar */}
                            <div className="space-y-0.5">
                              <Progress 
                                value={getJourneyProgress(lead.journeyStage)} 
                                className="h-1"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Inquiry</span>
                                <span>Closing</span>
                              </div>
                            </div>
                            
                            {/* Journey Stage Dots */}
                            <div className="flex items-center justify-between">
                              {journeyStages.map((stage, index) => {
                                const currentStageIndex = journeyStages.findIndex(s => s.key === lead.journeyStage);
                                const isCompleted = index <= currentStageIndex;
                                const isCurrent = index === currentStageIndex;
                                
                                return (
                                  <div
                                    key={stage.key}
                                    className={cn(
                                      "w-1 h-1 rounded-full transition-all duration-300",
                                      isCompleted 
                                        ? stage.color 
                                        : "bg-muted",
                                      isCurrent && "ring-1 ring-offset-1 ring-primary/50 scale-125"
                                    )}
                                    title={stage.label}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Last Contact */}
                        <div className="lg:col-span-1">
                          <p className="text-xs font-medium text-foreground">
                            {formatLastContact(lead.lastActivity)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lead.daysSinceLastContact === 0 ? 'Today' : `${lead.daysSinceLastContact}d ago`}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="lg:col-span-1">
                          <div className="flex gap-0.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleContact(lead.id, 'phone')}
                              className="h-6 w-6 p-0"
                            >
                              <Phone className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleContact(lead.id, 'email')}
                              className="h-6 w-6 p-0"
                            >
                              <Mail className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleContact(lead.id, 'text')}
                              className="h-6 w-6 p-0"
                            >
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Notes - Compact */}
                      {lead.notes && (
                        <div className="mt-1 pt-1 border-t">
                          <p className="text-xs text-muted-foreground">
                            <strong>Notes:</strong> {lead.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredAndSortedLeads.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No leads found matching your filters.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeadsList;