import { useState, useMemo, useCallback } from 'react';
import { Search, Filter, SortDesc, Bell, Zap, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadCard, type Lead } from './LeadCard';
import { LeadsQuickList } from './LeadsQuickList';
import { cn } from '@/lib/utils';

interface LeadsPriorityListProps {
  leads: Lead[];
  onContact: (leadId: string, method: 'phone' | 'email' | 'text') => void;
  onViewDetails: (leadId: string) => void;
  onToggleNotifications: () => void;
  onTriggerToast: () => void;
  hasNotifications?: boolean;
}

type SortOption = 'priority' | 'value' | 'activity' | 'status';
type FilterOption = 'all' | 'hot' | 'warm' | 'cold' | 'new' | 'contacted';

export function LeadsPriorityList({ 
  leads, 
  onContact, 
  onViewDetails, 
  onToggleNotifications,
  onTriggerToast,
  hasNotifications = false 
}: LeadsPriorityListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [isCondensed, setIsCondensed] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('action-required');

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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">{priorityStats.hot}</p>
              <p className="text-sm text-muted-foreground">Hot Leads</p>
            </div>
            <div className="h-8 w-8 bg-hot-lead/10 rounded-full flex items-center justify-center">
              🔥
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">{priorityStats.warm}</p>
              <p className="text-sm text-muted-foreground">Warm Leads</p>
            </div>
            <div className="h-8 w-8 bg-warm-lead/10 rounded-full flex items-center justify-center">
              ⚡
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">{priorityStats.cold}</p>
              <p className="text-sm text-muted-foreground">Cold Leads</p>
            </div>
            <div className="h-8 w-8 bg-cold-lead/10 rounded-full flex items-center justify-center">
              ❄️
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">{priorityStats.total}</p>
              <p className="text-sm text-muted-foreground">Total Leads</p>
            </div>
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              📋
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search - Sticky */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border py-6 space-y-4">
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCondensed(!isCondensed)}
            className="gap-2"
          >
            {isCondensed ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
            {isCondensed ? 'Expanded' : 'Condensed'}
          </Button>
        </div>

        {/* Priority Algorithm Info */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h3 className="font-semibold text-primary mb-2">🤖 AI Priority Scoring</h3>
          <p className="text-sm text-primary/80">
            Leads are automatically ranked using: Priority level + Deal value + Time on lot + Recent activity. 
            <strong>Recently contacted leads move down</strong> since you're waiting for their response, 
            while new customer activity gets top priority.
          </p>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 sticky top-20 z-30 bg-background">
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
              {/* Two Column Layout */}
              <div className="grid grid-cols-12 gap-6">
                {/* Main Cards Section - 9 columns */}
                <div className="col-span-9 space-y-4">
                  {currentLeads.map((lead, index) => (
                    <div 
                      key={lead.id} 
                      className={cn(
                        "relative transition-all duration-300",
                        selectedLeadId === lead.id && "transform translate-x-2"
                      )}
                      id={`lead-card-${lead.id}`}
                    >
                      {/* Static connection indicator */}
                      {selectedLeadId === lead.id && (
                        <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 z-20">
                          <div className="flex items-center text-primary">
                            <div className="w-6 h-0.5 bg-primary"></div>
                            <div className="w-3 h-3 bg-primary rounded-full border-2 border-background"></div>
                          </div>
                        </div>
                      )}
                      
                      {index === 0 && lead.priority === 'hot' && category === 'action-required' && (
                        <Badge className="absolute -top-2 -left-2 z-10 bg-hot-lead text-white">
                          🚨 TOP PRIORITY
                        </Badge>
                      )}
                      <div className={cn(
                        "transition-all duration-300",
                        selectedLeadId === lead.id && "ring-2 ring-primary shadow-lg shadow-primary/10 bg-primary/5 rounded-lg"
                      )}>
                        <LeadCard
                          lead={lead}
                          onContact={onContact}
                          onViewDetails={onViewDetails}
                          isCondensed={isCondensed}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {currentLeads.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-lg mb-2">No leads found</p>
                      <p className="text-sm">
                        {category === 'action-required' && 'No leads requiring immediate action.'}
                        {category === 'awaiting-response' && 'No leads awaiting your response.'}
                        {category === 're-engaged' && 'No recently re-engaged leads.'}
                        {category === 'cold' && 'No cold leads to re-engage with.'}
                        {category === 'all' && 'Try adjusting your search or filter criteria.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick List Sidebar - 3 columns */}
                <div className="col-span-3">
                  <div className="sticky top-24">
                    <LeadsQuickList
                      leads={currentLeads}
                      onLeadClick={(leadId) => {
                        setSelectedLeadId(leadId);
                        const element = document.getElementById(`lead-card-${leadId}`);
                        if (element) {
                          setTimeout(() => {
                            element.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'center' 
                            });
                          }, 100);
                          
                          setTimeout(() => {
                            setSelectedLeadId(undefined);
                          }, 4000);
                        }
                      }}
                      selectedLeadId={selectedLeadId}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}