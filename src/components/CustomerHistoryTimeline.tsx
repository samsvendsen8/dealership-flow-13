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
  call: 'text-blue-600 bg-blue-50 border-blue-200',
  text: 'text-green-600 bg-green-50 border-green-200',
  email: 'text-purple-600 bg-purple-50 border-purple-200',
  appointment: 'text-orange-600 bg-orange-50 border-orange-200',
  note: 'text-gray-600 bg-gray-50 border-gray-200',
  tag: 'text-pink-600 bg-pink-50 border-pink-200',
  milestone: 'text-yellow-600 bg-yellow-50 border-yellow-200'
};

const statusIcons = {
  completed: CheckCircle,
  scheduled: Calendar,
  missed: AlertTriangle,
  cancelled: Clock
};

const priorityColors = {
  low: 'border-l-gray-300',
  medium: 'border-l-blue-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-500'
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

      {/* Timeline */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No interactions found for this filter</p>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const Icon = typeIcons[item.type];
            const StatusIcon = item.status ? statusIcons[item.status] : null;
            
            return (
              <Card 
                key={item.id} 
                className={cn(
                  "border-l-4 transition-all hover:shadow-sm",
                  priorityColors[item.priority || 'medium']
                )}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={cn(
                      "p-2 rounded-lg border flex-shrink-0",
                      typeColors[item.type]
                    )}>
                      <Icon className="h-3 w-3" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          {item.status && StatusIcon && (
                            <StatusIcon className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {item.content}
                      </p>
                      
                      {/* Metadata */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.duration && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                              {item.duration}
                            </Badge>
                          )}
                          {item.priority && ['high', 'urgent'].includes(item.priority) && (
                            <Badge 
                              variant={item.priority === 'urgent' ? 'destructive' : 'secondary'} 
                              className="text-xs px-1.5 py-0.5"
                            >
                              {item.priority}
                            </Badge>
                          )}
                        </div>
                        
                        {item.tags && (
                          <div className="flex gap-1 flex-wrap">
                            {item.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0.5">
                                {tag}
                              </Badge>
                            ))}
                            {item.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                +{item.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {item.outcome && (
                        <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                          <strong>Outcome:</strong> {item.outcome}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
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