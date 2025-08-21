import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerResponse {
  id: string;
  content: string;
  type: 'text' | 'email' | 'call';
  timestamp: string;
  status: 'new' | 'read';
}

interface CustomerResponsePreviewProps {
  response: CustomerResponse;
  leadName: string;
  onViewFull: () => void;
  onRespond: (method: 'phone' | 'email' | 'text') => void;
}

const responseIcons = {
  text: MessageSquare,
  email: Mail,
  call: Phone
};

const responseLabels = {
  text: 'Text Message',
  email: 'Email',
  call: 'Phone Call'
};

export function CustomerResponsePreview({ 
  response, 
  leadName, 
  onViewFull, 
  onRespond 
}: CustomerResponsePreviewProps) {
  const Icon = responseIcons[response.type];
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 p-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-primary">Customer Response</h4>
              <p className="text-sm text-muted-foreground">
                {leadName} sent a {responseLabels[response.type].toLowerCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {response.status === 'new' && (
              <Badge variant="destructive" className="animate-pulse">
                New
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {formatTimestamp(response.timestamp)}
            </Badge>
          </div>
        </div>

        {/* Response Preview */}
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-sm text-foreground line-clamp-3">
            {response.content}
          </p>
          {response.content.length > 150 && (
            <Button 
              variant="link" 
              size="sm" 
              onClick={onViewFull}
              className="p-0 h-auto text-primary mt-1"
            >
              Read more...
            </Button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewFull}
            className="text-xs"
          >
            View Full Conversation
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRespond('text')}
              className="text-xs"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Text
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRespond('phone')}
              className="text-xs"
            >
              <Phone className="h-3 w-3 mr-1" />
              Call
            </Button>
            <Button
              size="sm"
              onClick={() => onRespond('email')}
              className="text-xs"
            >
              <Mail className="h-3 w-3 mr-1" />
              Respond
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}