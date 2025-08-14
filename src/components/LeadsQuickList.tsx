import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, DollarSign, Car } from 'lucide-react';
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

export function LeadsQuickList({ leads, onLeadClick, selectedLeadId }: LeadsQuickListProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Quick Lead List</CardTitle>
        <p className="text-xs text-muted-foreground">{leads.length} leads • Click to view details</p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-1 p-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className={cn(
                  'relative border-l-2 bg-card border border-border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-sm',
                  priorityStyles[lead.priority],
                  selectedLeadId === lead.id && 'ring-2 ring-primary/50 bg-primary/5'
                )}
                onClick={() => onLeadClick(lead.id)}
              >
                <div className="space-y-2">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate">{lead.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-xs">{priorityIcons[lead.priority]}</span>
                      <div className={cn('w-2 h-2 rounded-full', statusColors[lead.status])} />
                    </div>
                  </div>

                  {/* Vehicle & Value */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Car className="h-3 w-3" />
                      <span className="truncate">{lead.vehicle}</span>
                    </div>
                    <div className="flex items-center gap-1 text-success font-medium">
                      <DollarSign className="h-3 w-3" />
                      <span>${(lead.value / 1000).toFixed(0)}k</span>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="truncate">{lead.lastActivity}</span>
                  </div>

                  {/* Time on Lot Badge */}
                  {lead.timeOnLot && (
                    <Badge variant="secondary" className="text-xs bg-warning/20 text-warning border-warning/30">
                      On Lot: {lead.timeOnLot}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}