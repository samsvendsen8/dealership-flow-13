import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  lead_id: string;
  direction: 'outbound' | 'inbound';
  content: string;
  message_type: 'text' | 'email' | 'call' | 'appointment';
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
    messageType: 'text' | 'email' | 'call' | 'appointment' = 'text',
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

      // Update lead to show we reached out (but don't advance stage yet)
      const { error: updateError } = await supabase
        .from('leads')
        .update({ 
          last_contact: new Date().toISOString(),
          status: 'contacted'
        })
        .eq('id', leadId);

      if (updateError) {
        console.error('Error updating lead status:', updateError);
      }

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

        // Update lead to show customer replied (still don't advance stage)
        const { error: replyUpdateError } = await supabase
          .from('leads')
          .update({ 
            status: 'qualified' // Customer replied, ready for next step
          })
          .eq('id', leadId);

        if (replyUpdateError) {
          console.error('Error updating lead after reply:', replyUpdateError);
        }
      }, 15000); // 15 seconds

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const advanceJourneyStage = useCallback(async (leadId: string, currentJourneyStage: string) => {
    const nextStage = journeyStageMap[currentJourneyStage];
    if (nextStage) {
      const { error } = await supabase
        .from('leads')
        .update({ 
          journey_stage: nextStage,
          status: 'new' // Reset status for next stage
        })
        .eq('id', leadId);

      if (error) {
        console.error('Error advancing journey stage:', error);
        throw error;
      }
      
      return nextStage;
    }
    return null;
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
      message_type: row.message_type as 'text' | 'email' | 'call' | 'appointment',
      status: row.status as 'sent' | 'delivered' | 'read' | 'replied',
      created_at: row.created_at
    }));
  }, []);

  return {
    sendMessage,
    getMessages,
    advanceJourneyStage,
    isLoading
  };
};