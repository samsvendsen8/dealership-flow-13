
import React from 'react';
import { Phone, Mail, MessageCircle, Clock, DollarSign, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Lead } from './LeadCard';

interface LeadsQuickListProps {
  leads: Lead[];
  onLeadClick: (leadId: string) => void;
  selectedLeadId?: string;
}

export function LeadsQuickList({ leads, onLeadClick, selectedLeadId }: LeadsQuickListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hot': return 'text-hot-lead border-hot-lead bg-hot-lead/10';
      case 'warm': return 'text-warm-lead border-warm-lead bg-warm-lead/10';
      case 'cold': return 'text-cold-lead border-cold-lead bg-cold-lead/10';
      default: return 'text-muted-foreground border-muted bg-muted/10';
    }
  };

  if (leads.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        <p className="text-sm">No leads in this category</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-2">
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Quick Lead List ({leads.length})
        </h3>
        <p className="text-xs text-muted-foreground">
          Click any lead to view details
        </p>
      </div>

      <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto">
        {leads.map((lead, index) => {
          const isSelected = selectedLeadId === lead.id;
          const hasCustomerReachOut = lead.lastActivity.includes('Just replied') || 
                                     lead.lastActivity.includes('Customer replied') ||
                                     lead.lastActivity.includes('replied with questions');
          
          return (
            <Card 
              key={lead.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md border-2',
                isSelected && 'ring-2 ring-primary ring-offset-1 border-primary',
                // Apply red background for hot leads in quick list
                lead.priority === 'hot' && 'bg-hot-lead/5 border-hot-lead/30',
                hasCustomerReachOut && 'border-success/40 bg-success/5'
              )}
              onClick={() => onLeadClick(lead.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Lead Name & Priority */}
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold truncate">{lead.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={cn('text-xs px-1.5 py-0', getPriorityColor(lead.priority))}
                      >
                        {lead.priority.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Vehicle & Value */}
                    <p className="text-xs text-muted-foreground truncate mb-2">{lead.vehicle}</p>

                    {/* Key Metrics Row */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">
                          ${(lead.value / 1000).toFixed(0)}K
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{lead.stageProgress}%</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{lead.lastActivity}</span>
                      </div>
                    </div>

                    {/* Customer Reach Out Indicator */}
                    {hasCustomerReachOut && (
                      <div className="flex items-center gap-1 mb-2">
                        <Zap className="h-3 w-3 text-success" />
                        <span className="text-xs text-success font-medium">Customer replied!</span>
                      </div>
                    )}

                    {/* Journey Stage */}
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {lead.journeyStage}
                      </Badge>
                      {index === 0 && lead.priority === 'hot' && (
                        <Badge className="text-xs bg-hot-lead text-white">
                          TOP
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Priority Indicator */}
                  <div className="flex flex-col items-center gap-1">
                    <div 
                      className={cn(
                        'w-3 h-3 rounded-full border-2',
                        lead.priority === 'hot' && 'bg-hot-lead border-hot-lead',
                        lead.priority === 'warm' && 'bg-warm-lead border-warm-lead', 
                        lead.priority === 'cold' && 'bg-cold-lead border-cold-lead'
                      )}
                    />
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                  </div>
                </div>

                {/* Time on Lot Indicator */}
                {lead.timeOnLot && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      <span className="text-xs text-success font-medium">
                        On lot: {lead.timeOnLot}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
