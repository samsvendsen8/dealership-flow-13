import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  lead_id: string;
  direction: 'outbound' | 'inbound';
  content: string;
  message_type: 'text' | 'email' | 'call';
  status: 'sent' | 'delivered' | 'read' | 'replied';
  created_at: string;
}

const journeyStageMap: { [key: string]: string } = {
  'initial_inquiry': 'needs_assessment',
  'needs_assessment': 'vehicle_presentation',
  'vehicle_presentation': 'test_drive',
  'test_drive': 'negotiation',
  'negotiation': 'closing'
};

const customerResponses = [
  "Thanks for reaching out! I'm definitely interested.",
  "Yes, I'd like to know more about this.",
  "Sounds good, when can we meet?",
  "I'm still considering my options, but this looks promising.",
  "Perfect timing! I was just thinking about this.",
  "I appreciate the follow-up. Let me think about it.",
  "Yes, I'd like to move forward with this.",
  "This is exactly what I was looking for!"
];

export const useMessaging = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (
    leadId: string, 
    content: string, 
    messageType: 'text' | 'email' | 'call' = 'text',
    currentJourneyStage: string
  ) => {
    setIsLoading(true);
    try {
      // Send outbound message
      const { error: outboundError } = await supabase
        .from('messages')
        .insert({
          lead_id: leadId,
          direction: 'outbound',
          content,
          message_type: messageType,
          status: 'sent'
        });

      if (outboundError) throw outboundError;

      // Simulate customer response after 15 seconds
      setTimeout(async () => {
        const randomResponse = customerResponses[Math.floor(Math.random() * customerResponses.length)];
        
        // Send inbound message (customer response)
        const { error: inboundError } = await supabase
          .from('messages')
          .insert({
            lead_id: leadId,
            direction: 'inbound',
            content: randomResponse,
            message_type: messageType,
            status: 'replied'
          });

        if (inboundError) {
          console.error('Error creating customer response:', inboundError);
          return;
        }

        // Update journey stage to next stage
        const nextStage = journeyStageMap[currentJourneyStage];
        if (nextStage) {
          const { error: updateError } = await supabase
            .from('leads')
            .update({ 
              journey_stage: nextStage,
              last_contact: new Date().toISOString()
            })
            .eq('id', leadId);

          if (updateError) {
            console.error('Error updating journey stage:', updateError);
          }
        }
      }, 15000); // 15 seconds

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMessages = useCallback(async (leadId: string): Promise<Message[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      lead_id: row.lead_id,
      direction: row.direction as 'outbound' | 'inbound',
      content: row.content,
      message_type: row.message_type as 'text' | 'email' | 'call',
      status: row.status as 'sent' | 'delivered' | 'read' | 'replied',
      created_at: row.created_at
    }));
  }, []);

  return {
    sendMessage,
    getMessages,
    isLoading
  };
};