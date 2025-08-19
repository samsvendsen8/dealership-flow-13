import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MessageSquare, Clock } from 'lucide-react';
import { useMessaging, Message } from '@/hooks/useMessaging';
import { supabase } from '@/integrations/supabase/client';

interface MessageHistoryProps {
  leadId: string;
}

const getMessageIcon = (type: string) => {
  switch (type) {
    case 'call': return <Phone className="w-4 h-4" />;
    case 'email': return <Mail className="w-4 h-4" />;
    default: return <MessageSquare className="w-4 h-4" />;
  }
};

const MessageHistory: React.FC<MessageHistoryProps> = ({ leadId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { getMessages } = useMessaging();

  const loadMessages = async () => {
    const messageData = await getMessages(leadId);
    setMessages(messageData);
  };

  useEffect(() => {
    loadMessages();

    // Subscribe to real-time message updates
    const channel = supabase
      .channel('messages_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `lead_id=eq.${leadId}`
        },
        () => {
          loadMessages(); // Reload messages when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId, getMessages]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (messages.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No messages yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 max-h-96 overflow-y-auto">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.direction === 'outbound' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex flex-col max-w-[70%] ${
                message.direction === 'outbound'
                  ? 'items-end'
                  : 'items-start'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {getMessageIcon(message.message_type)}
                <span className="text-xs text-muted-foreground">
                  {message.direction === 'outbound' ? 'You' : 'Customer'}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatTime(message.created_at)}
                </div>
              </div>
              
              <div
                className={`rounded-lg p-3 ${
                  message.direction === 'outbound'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              
              <div className="mt-1">
                <Badge 
                  variant={message.status === 'replied' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {message.status}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MessageHistory;