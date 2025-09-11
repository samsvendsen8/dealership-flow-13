import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Car, Brain, Info, ArrowLeft } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { type Lead } from './LeadCard';
import LeadCard from './LeadCard';
import { NotificationPanelContent } from './NotificationPanelContent';

interface LeadsQuickListProps {
  leads: Lead[];
  onLeadClick: (leadId: string) => void;
  selectedLeadId?: string;
  showDetailView?: boolean;
  selectedLead?: Lead;
  onContact?: (leadId: string, method: 'phone' | 'email' | 'text') => void;
  onViewDetails?: (leadId: string) => void;
  onBackToList?: () => void;
}

const priorityStyles = {
  hot: 'border-l-hot-lead bg-gradient-to-r from-hot-lead/10 to-transparent',
  warm: 'border-l-warm-lead bg-gradient-to-r from-warm-lead/10 to-transparent',
  cold: 'border-l-cold-lead bg-gradient-to-r from-cold-lead/10 to-transparent'
};

const statusColors = {
  new: 'bg-status-new',
  contacted: 'bg-status-contacted',
  qualified: 'bg-status-qualified',
  closed: 'bg-status-closed'
};

const priorityIcons = {
  hot: '🔥',
  warm: '⚡',
  cold: '❄️'
};

// AI Priority Scoring
const getAIPriorityScore = (lead: Lead) => {
  let score = 0;
  
  // Deal probability weight
  if (lead.dealProbability >= 80) score += 30;
  else if (lead.dealProbability >= 60) score += 20;
  else if (lead.dealProbability >= 40) score += 10;
  
  // Priority weight
  if (lead.priority === 'hot') score += 25;
  else if (lead.priority === 'warm') score += 15;
  else score += 5;
  
  // Timeline urgency
  if (lead.lastActivity?.includes('min ago')) score += 15;
  
  // Value weight
  if (lead.value > 40000) score += 10;
  else if (lead.value > 30000) score += 5;
  
  return Math.min(100, score);
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-hot-lead bg-hot-lead/10 border-hot-lead/30';
  if (score >= 60) return 'text-warm-lead bg-warm-lead/10 border-warm-lead/30';
  return 'text-cold-lead bg-cold-lead/10 border-cold-lead/30';
};

export function LeadsQuickList({ 
  leads, 
  onLeadClick, 
  selectedLeadId, 
  showDetailView, 
  selectedLead, 
  onContact, 
  onViewDetails, 
  onBackToList 
}: LeadsQuickListProps) {
  // If showing detail view, render the selected lead's details
  if (showDetailView && selectedLead) {
    return (
      <Card className="h-full border-0 shadow-none">
        <CardHeader className="pb-2 pt-4 px-3 sm:px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBackToList}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-sm sm:text-base font-semibold">Lead Details</CardTitle>
                <p className="text-xs text-muted-foreground">{selectedLead.name}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto h-[calc(100vh-12rem)]">
          <NotificationPanelContent 
            lead={selectedLead}
            onContact={onContact || (() => {})}
          />
        </CardContent>
      </Card>
    );
  }

  // Default list view
  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader className="pb-2 pt-4 px-3 sm:px-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm sm:text-base font-semibold">Quick Lead List</CardTitle>
            <p className="text-xs text-muted-foreground">{leads.length} leads</p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/50 touch-manipulation">
                  <Brain className="h-4 w-4 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="flex items-start gap-2">
                  <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm mb-1">🤖 AI Priority Ranking</p>
                    <p className="text-xs text-muted-foreground">
                      Our AI automatically ranks leads using advanced scoring that considers deal probability, 
                      urgency signals, value potential, and response patterns. Recently contacted leads are 
                      deprioritized while hot opportunities rise to the top for maximum efficiency.
                    </p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-4rem)]">
        <div className="space-y-1 px-2 sm:px-3 pb-2 overflow-y-auto h-full">
            {leads.map((lead, index) => (
              <div
                key={lead.id}
                className={cn(
                  'relative border-l-2 bg-card/50 border border-border/50 rounded-md px-3 py-2 sm:px-2 sm:py-1.5 cursor-pointer transition-all duration-200 hover:bg-card hover:border-border hover:shadow-sm group touch-manipulation min-h-[44px] sm:min-h-0',
                  priorityStyles[lead.priority],
                  selectedLeadId === lead.id ? 
                    'ring-2 ring-primary border-primary bg-primary/5' : 
                    'hover:bg-card/80',
                  // Subtle ranking gradient - higher ranked leads are slightly more prominent
                  index === 0 ? 'shadow-sm ring-1 ring-primary/20' : '',
                  index <= 2 ? 'border-border' : 'border-border/30',
                )}
                style={{
                  // Subtle opacity gradient for ranking
                  opacity: 1 - (index * 0.02)
                }}
                onClick={() => onLeadClick(lead.id)}
              >
                
                <div className="space-y-1 sm:space-y-0.5">
                  {/* Header Row */}
                  <div className="flex items-center justify-between gap-2 sm:gap-1">
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      {/* Small rank number for top 3 */}
                      {index < 3 && (
                        <div className={cn(
                          'text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                          index === 0 ? 'bg-primary/10 text-primary' :
                          index === 1 ? 'bg-primary/5 text-primary/80' :
                          'bg-muted text-muted-foreground'
                        )}>
                          {index + 1}
                        </div>
                      )}
                      <h4 className="font-medium text-base sm:text-sm text-foreground truncate">{lead.name}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-1">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'text-xs px-1.5 py-0.5 h-5 sm:h-4 sm:px-1 font-medium border-0',
                          getScoreColor(getAIPriorityScore(lead))
                        )}
                      >
                        {getAIPriorityScore(lead)}
                      </Badge>
                      <span className="text-sm sm:text-xs">{priorityIcons[lead.priority]}</span>
                      <div className={cn('w-1.5 h-1.5 sm:w-1 sm:h-1 rounded-full', statusColors[lead.status])} />
                    </div>
                  </div>

                  {/* Vehicle & Value Row */}
                  <div className="flex items-center justify-between gap-2 sm:gap-1">
                    <div className="flex items-center gap-1.5 sm:gap-1 text-muted-foreground min-w-0 flex-1">
                      <Car className="h-3.5 w-3.5 sm:h-3 sm:w-3 flex-shrink-0" />
                      <span className="text-sm sm:text-xs truncate">{lead.vehicle}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-0.5 text-success font-medium">
                      <DollarSign className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                      <span className="text-sm sm:text-xs">${(lead.value / 1000).toFixed(0)}k</span>
                    </div>
                  </div>

                  {/* Activity & Stage Row */}
                  <div className="flex items-center justify-between gap-2 sm:gap-1">
                    <div className="flex items-center gap-1.5 sm:gap-1 text-muted-foreground min-w-0 flex-1">
                      <Clock className="h-3.5 w-3.5 sm:h-3 sm:w-3 flex-shrink-0" />
                      <span className="text-sm sm:text-xs truncate">{lead.lastActivity}</span>
                    </div>
                    {lead.journeyStage && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5 sm:h-4 sm:px-1 bg-primary/5 text-primary border-primary/20 font-normal">
                        {lead.journeyStage}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
      </CardContent>
    </Card>
  );
}