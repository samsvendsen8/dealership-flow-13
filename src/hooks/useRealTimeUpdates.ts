import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeUpdates = (onLeadUpdate?: (leadId: string, updates: any) => void) => {
  useEffect(() => {
    // Listen for real-time updates to leads table
    const leadsChannel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          console.log('Lead updated:', payload);
          if (onLeadUpdate && payload.new) {
            onLeadUpdate(payload.new.id, payload.new);
          }
        }
      )
      .subscribe();

    // Listen for new messages (customer responses)
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message:', payload);
          // Trigger UI update for customer responses
          if (payload.new?.direction === 'inbound') {
            // Customer replied - this should trigger the journey advance button
            setTimeout(() => {
              if (onLeadUpdate) {
                onLeadUpdate(payload.new.lead_id, { 
                  status: 'qualified',
                  hasNewMessage: true 
                });
              }
            }, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [onLeadUpdate]);
};