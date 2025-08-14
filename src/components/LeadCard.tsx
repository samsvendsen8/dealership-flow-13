import { useState } from 'react';
import { Phone, Mail, MessageCircle, Clock, DollarSign, Car, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  priority: 'hot' | 'warm' | 'cold';
  lastActivity: string;
  value: number;
  source: string;
  timeOnLot?: string;
  notes?: string;
  journeyStage: 'inquiry' | 'engaged' | 'visit' | 'test-drive' | 'proposal' | 'financing' | 'sold' | 'delivered';
  stageProgress: number; // 0-100 percentage
}

interface LeadCardProps {
  lead: Lead;
  onContact: (leadId: string, method: 'phone' | 'email' | 'text') => void;
  onViewDetails: (leadId: string) => void;
}

const priorityStyles = {
  hot: 'border-l-hot-lead bg-gradient-to-r from-hot-lead/5 to-transparent',
  warm: 'border-l-warm-lead bg-gradient-to-r from-warm-lead/5 to-transparent',
  cold: 'border-l-cold-lead bg-gradient-to-r from-cold-lead/5 to-transparent'
};

const statusStyles = {
  new: 'bg-status-new text-white',
  contacted: 'bg-status-contacted text-white',
  qualified: 'bg-status-qualified text-white',
  closed: 'bg-status-closed text-white'
};

const priorityLabels = {
  hot: '🔥 Hot Lead',
  warm: '⚡ Warm Lead',
  cold: '❄️ Cold Lead'
};

const journeyStages = {
  inquiry: { label: 'Inquiry', icon: '💬', color: 'bg-blue-500' },
  engaged: { label: 'Engaged', icon: '🎯', color: 'bg-teal-500' },
  visit: { label: 'Visit', icon: '🏢', color: 'bg-purple-500' },
  'test-drive': { label: 'Test Drive', icon: '🚗', color: 'bg-orange-500' },
  proposal: { label: 'Proposal', icon: '📄', color: 'bg-yellow-500' },
  financing: { label: 'Financing', icon: '🏦', color: 'bg-indigo-500' },
  sold: { label: 'Sold', icon: '✅', color: 'bg-green-500' },
  delivered: { label: 'Delivered', icon: '🎉', color: 'bg-emerald-500' }
};

export function LeadCard({ lead, onContact, onViewDetails }: LeadCardProps) {
  return (
    <Card 
      className={cn(
        'relative border-l-4 transition-all duration-300 cursor-pointer shadow-soft hover:shadow-medium',
        priorityStyles[lead.priority]
      )}
      onClick={() => onViewDetails(lead.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-foreground">{lead.name}</h3>
            <p className="text-sm text-muted-foreground">{lead.email}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={statusStyles[lead.status]} variant="secondary">
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              {priorityLabels[lead.priority]}
            </span>
          </div>
        </div>
        
        {/* Journey Stage Progress */}
        <div className="mt-3 p-2 bg-muted/30 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Journey Stage</span>
            <span className="text-xs text-muted-foreground">{lead.stageProgress}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs text-white", journeyStages[lead.journeyStage].color)}>
              {journeyStages[lead.journeyStage].icon}
            </div>
            <span className="text-sm font-medium">{journeyStages[lead.journeyStage].label}</span>
            <div className="flex-1 mx-2">
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className={cn("h-1.5 rounded-full transition-all duration-500", journeyStages[lead.journeyStage].color)}
                  style={{ width: `${lead.stageProgress}%` }}
                />
              </div>
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI Journey Analysis */}
        <div className="bg-gradient-to-r from-primary/5 to-hot-lead/5 border border-primary/20 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-full bg-gradient-primary text-white">
              <MessageCircle className="h-3 w-3" />
            </div>
            <h4 className="font-medium text-primary text-sm">AI Analysis</h4>
          </div>
          
          <div className="space-y-2 text-xs">
            <p className="text-foreground">
              <strong>Status:</strong> {
                lead.journeyStage === 'inquiry' ? 'Initial inquiry stage' :
                lead.journeyStage === 'engaged' ? 'Active engagement' :
                lead.journeyStage === 'visit' ? 'Showroom visit completed' :
                lead.journeyStage === 'test-drive' ? 'Test drive completed' :
                'Progressing through pipeline'
              }
            </p>
            
            {/* Notable Patterns */}
            {lead.journeyStage === 'engaged' && (
              <div className="bg-success/10 border border-success/20 rounded-md p-1.5">
                <p className="text-success text-xs font-medium">✓ High engagement</p>
              </div>
            )}
            
            {lead.journeyStage === 'visit' && (
              <div className="bg-hot-lead/10 border border-hot-lead/20 rounded-md p-1.5">
                <p className="text-hot-lead text-xs font-medium">🔥 Hot signal</p>
              </div>
            )}
            
            {lead.journeyStage === 'test-drive' && (
              <div className="bg-success/10 border border-success/20 rounded-md p-1.5">
                <p className="text-success text-xs font-medium">🎯 Purchase ready</p>
              </div>
            )}
            
            {lead.priority === 'hot' && (
              <div className="bg-warning/10 border border-warning/20 rounded-md p-1.5">
                <p className="text-warning text-xs font-medium">⚠️ Priority follow-up</p>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{lead.vehicle}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-success" />
            <span className="font-medium">${lead.value.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{lead.lastActivity}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Source:</span>
            <span className="text-xs font-medium">{lead.source}</span>
          </div>
        </div>

        {lead.timeOnLot && (
          <div className="bg-warning/10 border border-warning/20 rounded-md p-2">
            <p className="text-xs font-medium text-warning">
              🚗 Customer on lot: {lead.timeOnLot}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => onContact(lead.id, 'phone')}
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => onContact(lead.id, 'text')}
          >
            <MessageCircle className="h-4 w-4" />
            Text
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => onContact(lead.id, 'email')}
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}