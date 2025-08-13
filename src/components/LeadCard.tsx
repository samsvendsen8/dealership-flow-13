import { useState } from 'react';
import { Phone, Mail, MessageCircle, Clock, DollarSign, Car } from 'lucide-react';
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

export function LeadCard({ lead, onContact, onViewDetails }: LeadCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className={cn(
        'relative border-l-4 transition-all duration-300 cursor-pointer shadow-soft hover:shadow-medium',
        priorityStyles[lead.priority],
        isHovered && lead.priority === 'hot' && 'animate-pulse-glow'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
      </CardHeader>

      <CardContent className="space-y-4">
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