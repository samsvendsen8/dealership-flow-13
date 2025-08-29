import React, { useState } from 'react';
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
  isIncoming?: boolean; // For message direction
}

interface CustomerHistoryTimelineProps {
  leadId: string;
  leadName: string;
  filter: 'all' | 'text' | 'priority';
  onFilterChange: (filter: 'all' | 'text' | 'priority') => void;
  scope?: 'deal' | 'customer';
}

// Mock data for demonstration - Deal Only
const dealOnlyHistoryItems: HistoryItem[] = [
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
    title: 'Customer response',
    content: 'Hi! Thanks for following up on the BMW X3. I\'m really interested but had a few questions about the financing options.',
    status: 'completed',
    priority: 'medium',
    isIncoming: true
  },
  {
    id: '2a',
    type: 'text',
    timestamp: '2024-01-15T10:18:00Z',
    title: 'Sales rep response',
    content: 'Great to hear! I\'d be happy to go over all our financing options with you. We have some great rates right now.',
    status: 'completed',
    priority: 'medium',
    isIncoming: false
  },
  {
    id: '2b',
    type: 'text',
    timestamp: '2024-01-15T10:20:00Z',
    title: 'Customer response',
    content: 'Perfect! What\'s the lowest rate you can offer?',
    status: 'completed',
    priority: 'medium',
    isIncoming: true
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
    tags: ['specifications', 'pricing'],
    isIncoming: false
  },
  {
    id: '4a',
    type: 'email',
    timestamp: '2024-01-14T11:30:00Z',
    title: 'Customer inquiry',
    content: 'Thank you for the specs! The X3 looks perfect. Do you have any available in Alpine White?',
    status: 'completed',
    priority: 'medium',
    isIncoming: true
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

// Full Customer history with additional past interactions
const fullCustomerHistoryItems: HistoryItem[] = [
  ...dealOnlyHistoryItems,
  {
    id: '7',
    type: 'milestone',
    timestamp: '2023-08-15T10:00:00Z',
    title: 'Previous vehicle purchase',
    content: 'Purchased 2021 Honda Civic - excellent customer experience, trade-in after 18 months',
    status: 'completed',
    priority: 'medium',
    tags: ['previous-purchase', 'loyal-customer']
  },
  {
    id: '8',
    type: 'call',
    timestamp: '2023-08-10T16:20:00Z',
    title: 'Purchase consultation',
    content: 'Discussed options for first-time buyer, provided comprehensive financing guidance.',
    status: 'completed',
    priority: 'medium',
    duration: '25 min',
    outcome: 'Purchased Honda Civic',
    tags: ['consultation', 'financing']
  },
  {
    id: '9',
    type: 'email',
    timestamp: '2023-07-28T09:15:00Z',
    title: 'Initial inquiry - Honda',
    content: 'Interested in fuel-efficient compact cars under $25k. First-time buyer seeking guidance.',
    status: 'completed',
    priority: 'medium',
    isIncoming: true,
    tags: ['first-inquiry', 'budget']
  },
  {
    id: '10',
    type: 'appointment',
    timestamp: '2023-08-02T14:00:00Z',
    title: 'First showroom visit',
    content: 'Test drove Honda Civic and Toyota Corolla - preferred Honda features and reliability',
    status: 'completed',
    priority: 'high',
    tags: ['test-drive', 'comparison']
  },
  {
    id: '11',
    type: 'note',
    timestamp: '2023-08-05T11:30:00Z',
    title: 'Customer profile established',
    content: 'Reliable customer, values fuel economy, appreciates thorough explanations, prefers Honda brand',
    priority: 'medium',
    tags: ['profile', 'preferences', 'loyalty']
  },
  {
    id: '12',
    type: 'text',
    timestamp: '2023-12-20T15:45:00Z',
    title: 'Holiday check-in',
    content: 'Hi! How\'s the Honda Civic treating you? Hope you\'re enjoying the holidays!',
    status: 'completed',
    priority: 'low',
    isIncoming: false
  },
  {
    id: '12a',
    type: 'text',
    timestamp: '2023-12-20T16:30:00Z',
    title: 'Customer response',
    content: 'Hey! Love the car, no issues at all. Actually thinking about upgrading to something bigger soon for the family.',
    status: 'completed',
    priority: 'medium',
    isIncoming: true
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
  onFilterChange,
  scope = 'deal'
}: CustomerHistoryTimelineProps) {
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  
  // Select history based on scope
  const historyItems = scope === 'customer' ? fullCustomerHistoryItems : dealOnlyHistoryItems;
  
  const filteredItems = historyItems.filter(item => {
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

  // Group messages by conversation thread (based on similar IDs like "2", "2a", "2b")
  const getConversationThread = (messageId: string) => {
    const baseId = messageId.split(/[a-z]$/)[0]; // Gets "2" from "2a" or "2b"
    return historyItems.filter(item => 
      (item.type === 'text' || item.type === 'email') && 
      (item.id === baseId || item.id.startsWith(baseId))
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  // Inline message thread view 
  const renderInlineMessageThread = (messageId: string) => {
    const threadMessages = getConversationThread(messageId);
    
    return (
      <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-primary/30">
        <div className="text-xs text-muted-foreground mb-3 text-center">
          <span className="bg-background px-2 py-1 rounded border">
            Conversation Thread
          </span>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {threadMessages.map((msg) => {
            const isIncoming = msg.isIncoming ?? (msg.type === 'text' || msg.type === 'email');
            
            return (
              <div key={msg.id} className={cn(
                "flex flex-col",
                isIncoming ? "items-start" : "items-end"
              )}>
                <div className={cn(
                  "max-w-[85%] p-3 rounded-lg shadow-sm text-sm",
                  isIncoming 
                    ? "bg-background border text-foreground rounded-bl-sm" 
                    : "bg-primary text-primary-foreground rounded-br-sm"
                )}>
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
                <div className={cn(
                  "flex items-center gap-1 mt-1 text-xs text-muted-foreground",
                  isIncoming ? "ml-2" : "mr-2"
                )}>
                  {msg.type === 'email' && <Mail className="h-3 w-3" />}
                  <span>{formatTimestamp(msg.timestamp)}</span>
                  {msg.status === 'completed' && !isIncoming && (
                    <CheckCircle className="h-3 w-3" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleMessageClick = (item: HistoryItem) => {
    if (['text', 'email'].includes(item.type)) {
      setExpandedMessageId(expandedMessageId === item.id ? null : item.id);
    }
  };

  // iPhone-style message view for text/email filter
  const renderMessageView = () => {
    return (
      <div className="space-y-3 bg-gray-100 dark:bg-gray-900 p-6 rounded-lg min-h-[500px] max-h-[700px] overflow-y-auto">
        <div className="text-center mb-6">
          <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border">
            {leadName}
          </span>
        </div>
        {filteredItems.map((item) => {
          const isIncoming = item.isIncoming ?? (item.type === 'text' || item.type === 'email');
          
          return (
            <div key={item.id} className={cn(
              "flex flex-col mb-4",
              isIncoming ? "items-start" : "items-end"
            )}>
              <div className={cn(
                "max-w-[80%] p-4 rounded-2xl shadow-sm",
                isIncoming 
                  ? "bg-card border text-card-foreground rounded-bl-md" 
                  : "bg-primary text-primary-foreground rounded-br-md"
              )}>
                <p className="text-sm leading-relaxed">{item.content}</p>
              </div>
              <div className={cn(
                "flex items-center gap-1 mt-2 text-xs text-muted-foreground",
                isIncoming ? "ml-3" : "mr-3"
              )}>
                {item.type === 'email' && (
                  <Mail className="h-3 w-3" />
                )}
                <span>{formatTimestamp(item.timestamp)}</span>
                {item.status === 'completed' && !isIncoming && (
                  <CheckCircle className="h-3 w-3" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
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

      {/* Timeline Feed or Message View */}
      <div className="relative">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No interactions found for this filter</p>
          </div>
        ) : filter === 'text' ? (
          renderMessageView()
        ) : (
          <>
            {/* Timeline line */}
            <div className="absolute left-16 top-0 bottom-0 w-px bg-border/60"></div>
            
            {filteredItems.map((item, index) => {
              const Icon = typeIcons[item.type];
              const StatusIcon = item.status ? statusIcons[item.status] : null;
              const date = new Date(item.timestamp);
              
              return (
                <div key={item.id} className="relative pb-4 last:pb-0">
                  {/* Timeline timestamp and dot */}
                  <div className="absolute left-0 flex items-center gap-3">
                    {/* Stacked timestamp */}
                    <div className="text-xs text-muted-foreground text-right leading-tight">
                      <div className="font-medium">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-muted-foreground/70">
                        {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </div>
                    </div>
                    {/* Timeline dot */}
                    <div className={cn(
                      "w-3 h-3 rounded-full border-2 bg-background shadow-sm z-10",
                      item.priority === 'urgent' ? 'border-destructive shadow-destructive/30' :
                      item.priority === 'high' ? 'border-orange-500 shadow-orange-500/30' :
                      item.priority === 'medium' ? 'border-primary shadow-primary/30' : 'border-muted-foreground/60'
                    )}></div>
                  </div>
                  
                  {/* Content Card */}
                  <div 
                    className={cn(
                      "ml-20 bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow",
                      ['text', 'email'].includes(item.type) && "cursor-pointer hover:bg-card/80"
                    )}
                    onClick={() => handleMessageClick(item)}
                  >
                    {/* Header with icon, title */}
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <div className={cn(
                        "p-1 rounded border",
                        typeColors[item.type]
                      )}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <span className="font-medium text-card-foreground text-xs">{item.title}</span>
                      {item.status && StatusIcon && (
                        <StatusIcon className="h-3 w-3 text-muted-foreground" />
                      )}
                      {['text', 'email'].includes(item.type) && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          Click to view thread
                        </span>
                      )}
                    </div>
                    
                    {/* Content */}
                    <p className="text-xs text-card-foreground/80 leading-relaxed mb-2">
                      {item.content}
                    </p>
                    
                    {/* Metadata inline */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.duration && (
                        <span className="text-xs text-foreground bg-muted px-1.5 py-0.5 rounded border">
                          {item.duration}
                        </span>
                      )}
                      {item.outcome && (
                        <span className="text-xs text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                          {item.outcome}
                        </span>
                      )}
                      {item.tags && item.tags.map((tag) => (
                        <span key={tag} className="text-xs text-primary bg-primary/20 px-1.5 py-0.5 rounded border border-primary/30">
                          #{tag}
                        </span>
                      ))}
                      {item.priority && ['high', 'urgent'].includes(item.priority) && (
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded font-medium border",
                          item.priority === 'urgent' ? 'text-destructive bg-destructive/10 border-destructive/30' : 'text-amber-700 bg-amber-100 border-amber-300'
                        )}>
                          {item.priority}
                        </span>
                      )}
                    </div>
                    
                    {/* Inline Message Thread */}
                    {expandedMessageId === item.id && ['text', 'email'].includes(item.type) && 
                      renderInlineMessageThread(item.id)
                    }
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