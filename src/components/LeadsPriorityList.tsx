import { useState, useMemo, useCallback } from 'react';
import { Search, Filter, SortDesc, Bell, Zap, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import LeadCard, { type Lead } from './LeadCard';
import { LeadsQuickList } from './LeadsQuickList';
import { cn } from '@/lib/utils';

interface LeadsPriorityListProps {
  leads: Lead[];
  onContact: (leadId: string, method: 'phone' | 'email' | 'text') => void;
  onViewDetails: (leadId: string) => void;
  onOpenNotificationPanel?: (leadId: string, method: 'phone' | 'email' | 'text') => void;
  onToggleNotifications: () => void;
  onTriggerToast: () => void;
  onPauseToasts: () => void;
  onTaskCompleted?: (leadId: string) => void;
  onCommunicationSent?: (leadId: string, method: 'phone' | 'email' | 'text') => void;
  toastsPaused: boolean;
  hasNotifications?: boolean;
}

type SortOption = 'priority' | 'value' | 'activity' | 'status';
type FilterOption = 'all' | 'hot' | 'warm' | 'cold' | 'new' | 'contacted';

export function LeadsPriorityList({ 
  leads, 
  onContact, 
  onViewDetails, 
  onOpenNotificationPanel,
  onToggleNotifications,
  onTriggerToast,
  onPauseToasts,
  onTaskCompleted,
  onCommunicationSent,
  toastsPaused,
  hasNotifications = false
}: LeadsPriorityListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('action-required');

  // Handle task completion - auto-advance to next lead
  const handleLocalTaskCompleted = (completedLeadId: string) => {
    const currentLeads = getFilteredAndSortedLeads(leadsByCategory[activeTab as keyof typeof leadsByCategory]);
    const currentIndex = currentLeads.findIndex(lead => lead.id === completedLeadId);
    
    // Move to next lead, or first if was last
    const nextIndex = currentIndex < currentLeads.length - 1 ? currentIndex + 1 : 0;
    if (currentLeads[nextIndex]) {
      setSelectedLeadId(currentLeads[nextIndex].id);
    }
    
    // Also call the parent's task completed handler
    onTaskCompleted?.(completedLeadId);
  };

  // Handle tab change and reset to first lead
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const newLeads = getFilteredAndSortedLeads(leadsByCategory[newTab as keyof typeof leadsByCategory]);
    if (newLeads.length > 0) {
      setSelectedLeadId(newLeads[0].id);
    }
  };

  // Priority scoring function
  const getPriorityScore = useCallback((lead: Lead): number => {
    let score = 0;
    
    // Priority base score
    if (lead.priority === 'hot') score += 100;
    else if (lead.priority === 'warm') score += 50;
    else score += 10;
    
    // Value multiplier
    score += (lead.value / 1000) * 2;
    
    // Time on lot bonus
    if (lead.timeOnLot) score += 50;
    
    // Recent activity logic - MAJOR CHANGE HERE
    if (lead.lastActivity.includes('Just replied') || lead.lastActivity.includes('contact sent') || lead.lastActivity.includes('contact made')) {
      // Recently contacted leads get LOWER priority since we're waiting for their response
      score -= 75; // Significant penalty for recently contacted leads
    } else if (lead.lastActivity.includes('Just now')) {
      // New activity from customer gets HIGH priority
      score += 40;
    } else if (lead.lastActivity.includes('min')) {
      score += 30;
    } else if (lead.lastActivity.includes('hour')) {
      score += 20;
    } else if (lead.lastActivity.includes('day')) {
      // Leads not contacted for a day get higher priority
      score += 25;
    }
    
    // Status adjustment - but reduce bonus for contacted leads
    if (lead.status === 'new') score += 25;
    else if (lead.status === 'contacted') {
      // Lower bonus for contacted leads since action has been taken
      score += 5; // Reduced from 15
    }
    
    return score;
  }, []);

  // Function to determine lead category for tabs
  const getLeadCategory = (lead: Lead) => {
    const hasRecentContact = lead.lastActivity.includes('Just replied') || 
                            lead.lastActivity.includes('contact sent') || 
                            lead.lastActivity.includes('contact made');
    
    const hasRecentCustomerActivity = lead.lastActivity.includes('Just now') && 
                                     !hasRecentContact;
    
    // Check if lead has gone cold (no activity for extended period)
    const isOldActivity = lead.lastActivity.includes('week ago') || 
                         lead.lastActivity.includes('month ago') ||
                         lead.priority === 'cold';
    
    if (isOldActivity && !hasRecentCustomerActivity) {
      return 'cold';
    } else if (hasRecentCustomerActivity) {
      return 're-engaged';
    } else if (hasRecentContact || lead.status === 'contacted') {
      return 'awaiting-response';
    } else {
      return 'action-required';
    }
  };

  // Organize leads by category
  const leadsByCategory = useMemo(() => {
    const categories = {
      'action-required': [] as Lead[],
      'awaiting-response': [] as Lead[],
      're-engaged': [] as Lead[],
      'cold': [] as Lead[],
      'all': leads
    };

    leads.forEach(lead => {
      const category = getLeadCategory(lead);
      categories[category].push(lead);
    });

    return categories;
  }, [leads]);

  const getFilteredAndSortedLeads = useMemo(() => {
    return (categoryLeads: Lead[]) => {
      let filtered = categoryLeads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             lead.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             lead.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;
        
        if (filterBy === 'all') return true;
        if (['hot', 'warm', 'cold'].includes(filterBy)) {
          return lead.priority === filterBy;
        }
        return lead.status === filterBy;
      });

      // Sort leads
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'priority':
            return getPriorityScore(b) - getPriorityScore(a);
          case 'value':
            return b.value - a.value;
          case 'activity':
            return a.lastActivity.localeCompare(b.lastActivity);
          case 'status':
            const statusOrder = { new: 0, contacted: 1, qualified: 2, closed: 3 };
            return statusOrder[a.status] - statusOrder[b.status];
          default:
            return 0;
        }
      });

      return filtered;
    };
  }, [searchTerm, sortBy, filterBy, getPriorityScore]);

  const priorityStats = useMemo(() => {
    const stats = { hot: 0, warm: 0, cold: 0, total: leads.length };
    leads.forEach(lead => {
      stats[lead.priority]++;
    });
    return stats;
  }, [leads]);

  return (
    <div className="space-y-6 padding-top-20">
      {/* Monthly Goals - Gamified */}
      <div className="bg-gradient-primary/10 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="relative">
                <p className="text-2xl font-bold text-primary">47</p>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full"></div>
              </div>
              <p className="text-xs text-primary/70">This Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary/60">60</p>
              <p className="text-xs text-primary/70">Goal</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-success">🏆</p>
              <p className="text-xs text-success">On Track</p>
            </div>
          </div>
          <div className="flex-1 max-w-xs ml-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-primary/70">Progress to Goal</span>
              <span className="text-sm font-semibold text-primary">78%</span>
            </div>
            <Progress value={78} className="h-3" />
            <div className="flex justify-between mt-1 text-xs text-primary/60">
              <span>13 to go</span>
              <span>🎯 Next: 50</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lead Priority Dashboard</h1>
          <p className="text-muted-foreground">
            Prioritized by AI scoring algorithm • {leads.length} total leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={onTriggerToast}
          >
            <Zap className="h-4 w-4" />
            Trigger Toast
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={onPauseToasts}
          >
            {toastsPaused ? '▶️' : '⏸️'} 
            {toastsPaused ? 'Resume' : 'Pause'} Toasts
          </Button>
          <Button 
            variant="outline" 
            className={cn(
              'relative gap-2',
              hasNotifications && 'border-notification-bg text-notification-bg'
            )}
            onClick={onToggleNotifications}
          >
            <Bell className="h-4 w-4" />
            Notifications
            {hasNotifications && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-hot-lead rounded-full animate-pulse" />
            )}
          </Button>
        </div>
      </div>


      {/* Filters and Search - Sticky */}
      <div className="sticky top-0 z-30 bg-card backdrop-blur-sm border border-border rounded-lg shadow-sm py-4 px-4 mb-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads by name, vehicle, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <SortDesc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Sort by Priority</SelectItem>
              <SelectItem value="value">Sort by Value</SelectItem>
              <SelectItem value="activity">Sort by Activity</SelectItem>
              <SelectItem value="status">Sort by Status</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="hot">Hot Priority</SelectItem>
              <SelectItem value="warm">Warm Priority</SelectItem>
              <SelectItem value="cold">Cold Priority</SelectItem>
              <SelectItem value="new">New Status</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Algorithm Info - Tooltip Icon */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4 text-primary" />
                  <span>AI Priority Scoring</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-sm">
                  🤖 Leads are automatically ranked using: Priority level + Deal value + Time on lot + Recent activity. 
                  <strong>Recently contacted leads move down</strong> since you're waiting for their response, 
                  while new customer activity gets top priority.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5 sticky top-28 z-20 bg-card backdrop-blur-sm border border-border shadow-sm mb-6 p-3 h-auto">
          <TabsTrigger value="action-required" className="gap-2">
            🎯 Action Required
            <Badge variant="secondary" className="ml-1">
              {leadsByCategory['action-required'].length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="awaiting-response" className="gap-2">
            ⏳ Awaiting Response
            <Badge variant="secondary" className="ml-1">
              {leadsByCategory['awaiting-response'].length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="re-engaged" className="gap-2">
            🔥 Re-engaged
            <Badge variant="secondary" className="ml-1">
              {leadsByCategory['re-engaged'].length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="cold" className="gap-2">
            ❄️ Cold Leads
            <Badge variant="secondary" className="ml-1">
              {leadsByCategory['cold'].length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            📋 All Leads
            <Badge variant="secondary" className="ml-1">
              {leadsByCategory['all'].length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Tab Content for each category */}
        {(['action-required', 'awaiting-response', 're-engaged', 'cold', 'all'] as const).map((category) => {
          const currentLeads = getFilteredAndSortedLeads(leadsByCategory[category]);
          
          return (
            <TabsContent key={category} value={category} className="mt-6">
              {/* Two Column Layout - Sticky Quick List + Single Card */}
              <div className="grid grid-cols-12 gap-6">
                {/* Sticky Quick List Sidebar - 4 columns */}
                <div className="col-span-4">
                  <div className="sticky top-44 z-10 h-[calc(100vh-14rem)] overflow-auto">
                    <LeadsQuickList 
                      leads={currentLeads}
                      onLeadClick={(leadId) => {
                        setSelectedLeadId(leadId);
                      }}
                      selectedLeadId={selectedLeadId || (currentLeads.length > 0 ? currentLeads[0].id : undefined)}
                    />
                  </div>
                </div>

                {/* Single Card Focus Area - 8 columns */}
                <div className="col-span-8">
                  {currentLeads.length > 0 ? (
                    <div className="sticky top-44 z-5">
                      {(() => {
                        const displayLead = selectedLeadId ? 
                          currentLeads.find(lead => lead.id === selectedLeadId) : 
                          currentLeads[0];
                        
                        if (!displayLead) return null;
                        
                        const leadIndex = currentLeads.findIndex(lead => lead.id === displayLead.id);
                        
                        return (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between bg-card/80 backdrop-blur-sm border rounded-lg p-3">
                              <div className="text-sm text-muted-foreground">
                                Lead {leadIndex + 1} of {currentLeads.length} • {displayLead.name}
                              </div>
                              {leadIndex === 0 && displayLead.priority === 'hot' && category === 'action-required' && (
                                <Badge className="bg-hot-lead text-white">
                                  🚨 TOP PRIORITY
                                </Badge>
                              )}
                            </div>
                            
                            <LeadCard
                              lead={displayLead}
                              onContact={onContact}
                              onViewDetails={onViewDetails}
                              onOpenNotificationPanel={onOpenNotificationPanel}
                              onTaskCompleted={handleLocalTaskCompleted}
                              onCommunicationSent={onCommunicationSent}
                              isCondensed={false}
                              isFocused={false}
                            />
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-center p-12 text-muted-foreground">
                      <h3 className="text-lg font-semibold mb-2">No leads in this category</h3>
                      <p>
                        {category === 'action-required' && 'No leads requiring immediate action.'}
                        {category === 'awaiting-response' && 'No leads awaiting your response.'}
                        {category === 're-engaged' && 'No recently re-engaged leads.'}
                        {category === 'cold' && 'No cold leads to re-engage with.'}
                        {category === 'all' && 'Try adjusting your search or filter criteria.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}