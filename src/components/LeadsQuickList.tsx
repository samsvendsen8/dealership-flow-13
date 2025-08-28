import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, DollarSign, Car, Brain, Zap, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { type Lead } from './LeadCard';

interface LeadsQuickListProps {
  leads: Lead[];
  onLeadClick: (leadId: string) => void;
  selectedLeadId?: string;
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

export function LeadsQuickList({ leads, onLeadClick, selectedLeadId }: LeadsQuickListProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Quick Lead List</CardTitle>
            <p className="text-xs text-muted-foreground">{leads.length} leads • Click to view details</p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                  <Info className="h-3 w-3 text-primary" />
                  <span>AI Priority</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-sm">
                  🤖 Leads are automatically ranked using: Priority level + Deal value + Recent activity. 
                  <strong>Recently contacted leads move down</strong> since you're waiting for their response,
                  while new customer activity gets top priority.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-0.5 p-2">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className={cn(
                  'relative border-l-2 bg-card border border-border rounded-lg p-2 cursor-pointer transition-all duration-300 hover:shadow-sm group',
                  priorityStyles[lead.priority],
                  selectedLeadId === lead.id ? 
                    'ring-2 ring-primary bg-primary/10 shadow-md border-primary/50 transform translate-x-1' : 
                    'hover:scale-[1.01]'
                )}
                onClick={() => onLeadClick(lead.id)}
              >
                {/* Static selection indicator */}
                {selectedLeadId === lead.id && (
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-3 h-3 bg-primary rounded-full border-2 border-background shadow-sm"></div>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs text-foreground truncate">{lead.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'text-xs px-1.5 py-0.5 flex items-center gap-1',
                          getScoreColor(getAIPriorityScore(lead))
                        )}
                      >
                        <Brain className="h-2.5 w-2.5" />
                        {getAIPriorityScore(lead)}
                      </Badge>
                      <span className="text-xs">{priorityIcons[lead.priority]}</span>
                      <div className={cn('w-1.5 h-1.5 rounded-full', statusColors[lead.status])} />
                    </div>
                  </div>

                  {/* Vehicle & Value */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Car className="h-2.5 w-2.5" />
                      <span className="truncate">{lead.vehicle}</span>
                    </div>
                    <div className="flex items-center gap-1 text-success font-medium">
                      <DollarSign className="h-2.5 w-2.5" />
                      <span>${(lead.value / 1000).toFixed(0)}k</span>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    <span className="truncate">{lead.lastActivity}</span>
                  </div>

                     {/* Journey Stage */}
                     <div className="flex items-center justify-between gap-1">
                      {lead.journeyStage && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary border-primary/30">
                          {lead.journeyStage}
                        </Badge>
                      )}
                     </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}