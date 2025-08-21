import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Calendar, 
  FileText, 
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoryItem {
  id: string;
  type: 'call' | 'text' | 'email' | 'appointment' | 'note' | 'tag' | 'milestone';
  timestamp: string;
  title: string;
  content: string;
  status?: 'completed' | 'scheduled' | 'missed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  duration?: string;
  outcome?: string;
  tags?: string[];
}

interface CustomerHistoryTimelineProps {
  leadId: string;
  leadName: string;
  filter: 'all' | 'text' | 'priority';
  onFilterChange: (filter: 'all' | 'text' | 'priority') => void;
}

// Mock data for demonstration
const mockHistoryItems: HistoryItem[] = [
  {
    id: '1',
    type: 'call',
    timestamp: '2024-01-15T14:30:00Z',
    title: 'Follow-up call',
    content: 'Discussed financing options and answered questions about warranty coverage. Customer showed strong interest in extended warranty.',
    status: 'completed',
    priority: 'high',
    duration: '12 min',
    outcome: 'Positive - scheduling test drive',
    tags: ['financing', 'warranty']
  },
  {
    id: '2',
    type: 'text',
    timestamp: '2024-01-15T10:15:00Z',
    title: 'Initial contact response',
    content: 'Hi! Thanks for following up on the BMW X3. I\'m really interested but had a few questions about the financing options.',
    status: 'completed',
    priority: 'medium'
  },
  {
    id: '3',
    type: 'appointment',
    timestamp: '2024-01-14T16:00:00Z',
    title: 'Test drive scheduled',
    content: 'Test drive appointment for BMW X3 - Saturday 2:00 PM',
    status: 'scheduled',
    priority: 'high',
    tags: ['test-drive']
  },
  {
    id: '4',
    type: 'email',
    timestamp: '2024-01-14T09:20:00Z',
    title: 'Vehicle specifications sent',
    content: 'Sent detailed specifications and pricing information for BMW X3 with requested options package.',
    status: 'completed',
    priority: 'medium',
    tags: ['specifications', 'pricing']
  },
  {
    id: '5',
    type: 'note',
    timestamp: '2024-01-13T11:45:00Z',
    title: 'Customer preference noted',
    content: 'Prefers hybrid options, budget range $45-55k, needs 7-seater for family',
    priority: 'medium',
    tags: ['preferences', 'budget', 'family']
  },
  {
    id: '6',
    type: 'milestone',
    timestamp: '2024-01-12T15:30:00Z',
    title: 'Lead qualified',
    content: 'Customer passed initial qualification - confirmed budget and timeline',
    status: 'completed',
    priority: 'high'
  }
];

const typeIcons = {
  call: Phone,
  text: MessageCircle,
  email: Mail,
  appointment: Calendar,
  note: FileText,
  tag: Tag,
  milestone: Star
};

const typeColors = {
  call: 'text-primary bg-primary/20 border-primary/30 shadow-sm',
  text: 'text-emerald-700 bg-emerald-100 border-emerald-300 shadow-sm',
  email: 'text-violet-700 bg-violet-100 border-violet-300 shadow-sm',
  appointment: 'text-amber-700 bg-amber-100 border-amber-300 shadow-sm',
  note: 'text-foreground bg-card border-border shadow-sm',
  tag: 'text-pink-700 bg-pink-100 border-pink-300 shadow-sm',
  milestone: 'text-orange-700 bg-orange-100 border-orange-300 shadow-sm'
};

const statusIcons = {
  completed: CheckCircle,
  scheduled: Calendar,
  missed: AlertTriangle,
  cancelled: Clock
};

const priorityColors = {
  low: 'border-muted',
  medium: 'border-primary/60',
  high: 'border-amber-400',
  urgent: 'border-destructive'
};

export function CustomerHistoryTimeline({ 
  leadId, 
  leadName, 
  filter, 
  onFilterChange 
}: CustomerHistoryTimelineProps) {
  
  const filteredItems = mockHistoryItems.filter(item => {
    if (filter === 'text') {
      return ['text', 'email'].includes(item.type);
    }
    if (filter === 'priority') {
      return ['high', 'urgent'].includes(item.priority || 'medium');
    }
    return true; // 'all' filter
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Interaction History</h3>
        <div className="flex gap-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'text', label: 'Messages' },
            { key: 'priority', label: 'Priority' }
          ].map((filterOption) => (
            <Button
              key={filterOption.key}
              variant={filter === filterOption.key ? "default" : "ghost"}
              size="sm"
              onClick={() => onFilterChange(filterOption.key as 'all' | 'text' | 'priority')}
              className="h-7 px-2 text-xs"
            >
              {filterOption.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Timeline Feed */}
      <div className="relative">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No interactions found for this filter</p>
          </div>
        ) : (
          <>
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border/60"></div>
            
            {filteredItems.map((item, index) => {
              const Icon = typeIcons[item.type];
              const StatusIcon = item.status ? statusIcons[item.status] : null;
              
              return (
                <div key={item.id} className="relative pb-4 last:pb-0">
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute left-2.5 w-3 h-3 rounded-full border-2 bg-background shadow-sm z-10",
                    item.priority === 'urgent' ? 'border-destructive shadow-destructive/30' :
                    item.priority === 'high' ? 'border-orange-500 shadow-orange-500/30' :
                    item.priority === 'medium' ? 'border-primary shadow-primary/30' : 'border-muted-foreground/60'
                  )}></div>
                  
                  {/* Content Card */}
                  <div className="ml-8 bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    {/* Header with icon, title, and timestamp */}
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <div className={cn(
                        "p-1.5 rounded border",
                        typeColors[item.type]
                      )}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <span className="font-medium text-card-foreground">{item.title}</span>
                      {item.status && StatusIcon && (
                        <StatusIcon className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <p className="text-sm text-card-foreground/80 leading-relaxed mb-3">
                      {item.content}
                    </p>
                    
                    {/* Metadata inline */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.duration && (
                        <span className="text-xs text-foreground bg-muted px-2 py-1 rounded border">
                          {item.duration}
                        </span>
                      )}
                      {item.outcome && (
                        <span className="text-xs text-emerald-800 bg-emerald-100 px-2 py-1 rounded border border-emerald-300">
                          {item.outcome}
                        </span>
                      )}
                      {item.tags && item.tags.map((tag) => (
                        <span key={tag} className="text-xs text-primary bg-primary/20 px-2 py-1 rounded border border-primary/30">
                          #{tag}
                        </span>
                      ))}
                      {item.priority && ['high', 'urgent'].includes(item.priority) && (
                        <span className={cn(
                          "text-xs px-2 py-1 rounded font-medium border",
                          item.priority === 'urgent' ? 'text-destructive bg-destructive/10 border-destructive/30' : 'text-amber-700 bg-amber-100 border-amber-300'
                        )}>
                          {item.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Summary Stats */}
      {filteredItems.length > 0 && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Total interactions:</span>
              <span className="font-medium">{filteredItems.length}</span>
            </div>
            <div className="flex justify-between">
              <span>This week:</span>
              <span className="font-medium">
                {filteredItems.filter(item => {
                  const itemDate = new Date(item.timestamp);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return itemDate > weekAgo;
                }).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Priority items:</span>
              <span className="font-medium">
                {filteredItems.filter(item => ['high', 'urgent'].includes(item.priority || 'medium')).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}