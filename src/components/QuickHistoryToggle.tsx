import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Calendar, 
  FileText,
  List,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickHistoryItem {
  id: string;
  type: 'call' | 'text' | 'email' | 'appointment' | 'note';
  content: string;
  timestamp: string;
  status?: 'completed' | 'scheduled';
}

interface QuickHistoryToggleProps {
  leadId: string;
  leadName: string;
  className?: string;
}

// Mock quick history data
const mockQuickHistory: QuickHistoryItem[] = [
  {
    id: '1',
    type: 'call',
    content: 'Discussed financing options and warranty',
    timestamp: '2h ago',
    status: 'completed'
  },
  {
    id: '2',
    type: 'text',
    content: 'Customer replied: "Thanks! Still interested"',
    timestamp: '4h ago',
    status: 'completed'
  },
  {
    id: '3',
    type: 'email',
    content: 'Sent vehicle specifications and pricing',
    timestamp: '1d ago',
    status: 'completed'
  },
  {
    id: '4',
    type: 'appointment',
    content: 'Test drive scheduled for Saturday 2:00 PM',
    timestamp: '1d ago',
    status: 'scheduled'
  }
];

const typeIcons = {
  call: Phone,
  text: MessageCircle,
  email: Mail,
  appointment: Calendar,
  note: FileText
};

const typeColors = {
  call: 'text-blue-600',
  text: 'text-green-600', 
  email: 'text-purple-600',
  appointment: 'text-orange-600',
  note: 'text-gray-600'
};

export function QuickHistoryToggle({ leadId, leadName, className }: QuickHistoryToggleProps) {
  const [viewMode, setViewMode] = useState<'text' | 'timeline'>('text');
  const [isExpanded, setIsExpanded] = useState(false);

  const recentTextItems = mockQuickHistory.filter(item => 
    ['text', 'email'].includes(item.type)
  ).slice(0, 2);

  const formatTimestamp = (timestamp: string) => {
    return timestamp;
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'text' ? 'timeline' : 'text');
  };

  return (
    <Card className={cn("bg-muted/30 border-muted/40", className)}>
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Header with toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Quick History</span>
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                {mockQuickHistory.length}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleViewMode}
                className="h-7 px-2 gap-1"
              >
                {viewMode === 'text' ? (
                  <>
                    <List className="h-3 w-3" />
                    <span className="text-xs">Timeline</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-3 w-3" />
                    <span className="text-xs">Messages</span>
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-7 px-1"
              >
                {isExpanded ? (
                  <ToggleRight className="h-4 w-4 text-primary" />
                ) : (
                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'text' ? (
            <div className="space-y-2">
              {recentTextItems.length > 0 ? (
                recentTextItems.slice(0, isExpanded ? recentTextItems.length : 1).map((item) => (
                  <div key={item.id} className="p-2 bg-background/60 rounded border border-border/40">
                    <div className="flex items-start gap-2">
                      <div className={cn("mt-0.5", typeColors[item.type])}>
                        {React.createElement(typeIcons[item.type], { className: "h-3 w-3" })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground line-clamp-2">
                          {item.content}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-muted-foreground">No recent messages</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {mockQuickHistory.slice(0, isExpanded ? mockQuickHistory.length : 3).map((item, index) => {
                const Icon = typeIcons[item.type];
                return (
                  <div key={item.id} className="flex items-start gap-2">
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 border-background bg-card flex items-center justify-center",
                        typeColors[item.type]
                      )}>
                        <Icon className="h-3 w-3" />
                      </div>
                      {index < (isExpanded ? mockQuickHistory.length - 1 : 2) && (
                        <div className="w-px h-4 bg-border mt-1" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium capitalize">
                          {item.type}
                        </span>
                        {item.status && (
                          <Badge 
                            variant={item.status === 'completed' ? 'default' : 'outline'} 
                            className="text-xs px-1.5 py-0"
                          >
                            {item.status}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Show more indicator */}
          {!isExpanded && mockQuickHistory.length > (viewMode === 'text' ? 1 : 3) && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="text-xs h-6 px-2"
              >
                +{mockQuickHistory.length - (viewMode === 'text' ? 1 : 3)} more items
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}