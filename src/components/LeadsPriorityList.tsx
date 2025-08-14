import { useState, useMemo } from 'react';
import { Search, Filter, SortDesc, Bell, Zap, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

  // Priority scoring function
  const getPriorityScore = (lead: Lead): number => {
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
  };

  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.filter(lead => {
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
          // Simple time-based sorting (this would be more sophisticated in a real app)
          return a.lastActivity.localeCompare(b.lastActivity);
        case 'status':
          const statusOrder = { new: 0, contacted: 1, qualified: 2, closed: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });

    return filtered;
  }, [leads, searchTerm, sortBy, filterBy]);

  const priorityStats = useMemo(() => {
    const stats = { hot: 0, warm: 0, cold: 0, total: leads.length };
    leads.forEach(lead => {
      stats[lead.priority]++;
    });
    return stats;
  }, [leads]);

  return (
    <div className="space-y-6 padding-top-20">
      {/* Monthly Goals */}
      <div className="bg-gradient-primary/10 border border-primary/20 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-lg font-bold text-primary">47</p>
              <p className="text-xs text-primary/70">This Month</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-primary">60</p>
              <p className="text-xs text-primary/70">Goal</p>
            </div>
          </div>
          <div className="flex-1 max-w-xs ml-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-primary/70">Progress</span>
              <span className="text-sm font-semibold text-primary">78%</span>
            </div>
            <Progress value={78} className="h-2" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lead Priority Dashboard</h1>
          <p className="text-muted-foreground">
            Prioritized by AI scoring algorithm • {filteredAndSortedLeads.length} of {leads.length} leads
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
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border pb-4 space-y-4">
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Cards Section - 9 columns */}
        <div className="col-span-9 space-y-4">
          {filteredAndSortedLeads.map((lead, index) => (
            <div 
              key={lead.id} 
              className="relative"
              id={`lead-card-${lead.id}`}
            >
              {index === 0 && lead.priority === 'hot' && (
                <Badge className="absolute -top-2 -left-2 z-10 bg-hot-lead text-white animate-pulse">
                  🚨 TOP PRIORITY
                </Badge>
              )}
              <LeadCard
                lead={lead}
                onContact={onContact}
                onViewDetails={onViewDetails}
                isCondensed={isCondensed}
              />
            </div>
          ))}
          
          {filteredAndSortedLeads.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">No leads found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Quick List Sidebar - 3 columns */}
        <div className="col-span-3">
          <div className="sticky top-24">
            <LeadsQuickList
              leads={filteredAndSortedLeads}
              onLeadClick={(leadId) => {
                setSelectedLeadId(leadId);
                const element = document.getElementById(`lead-card-${leadId}`);
                if (element) {
                  element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                  });
                  // Highlight briefly
                  element.classList.add('ring-2', 'ring-primary/50');
                  setTimeout(() => {
                    element.classList.remove('ring-2', 'ring-primary/50');
                  }, 2000);
                }
              }}
              selectedLeadId={selectedLeadId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}