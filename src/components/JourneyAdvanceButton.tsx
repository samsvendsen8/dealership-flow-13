import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';
import { useToast } from '@/hooks/use-toast';

interface JourneyAdvanceButtonProps {
  leadId: string;
  leadName: string;
  currentStage: string;
  leadStatus: string;
  hasCustomerReplied: boolean;
  onStageAdvanced?: () => void;
}

const JourneyAdvanceButton: React.FC<JourneyAdvanceButtonProps> = ({
  leadId,
  leadName,
  currentStage,
  leadStatus,
  hasCustomerReplied,
  onStageAdvanced
}) => {
  const { advanceJourneyStage } = useMessaging();
  const { toast } = useToast();

  const handleAdvanceStage = async () => {
    try {
      const nextStage = await advanceJourneyStage(leadId, currentStage);
      if (nextStage) {
        toast({
          title: "Journey Stage Advanced",
          description: `${leadName} moved to ${nextStage.replace('_', ' ')} stage`,
        });
        onStageAdvanced?.();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to advance journey stage",
        variant: "destructive"
      });
    }
  };

  // Show different states based on lead status and customer response
  if (leadStatus === 'contacted') {
    return (
      <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
        <MessageCircle className="h-5 w-5 text-warning" />
        <div className="flex-1">
          <p className="text-sm font-medium text-warning">Reached out - Waiting for response</p>
          <p className="text-xs text-muted-foreground">Customer will respond automatically in ~15 seconds</p>
        </div>
        <Badge variant="secondary" className="bg-warning/20 text-warning">
          Pending
        </Badge>
      </div>
    );
  }

  if (leadStatus === 'qualified' && hasCustomerReplied) {
    return (
      <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
        <MessageCircle className="h-5 w-5 text-success" />
        <div className="flex-1">
          <p className="text-sm font-medium text-success">Customer replied!</p>
          <p className="text-xs text-muted-foreground">Ready to move to next journey stage</p>
        </div>
        <Button 
          onClick={handleAdvanceStage}
          size="sm"
          className="gap-2"
        >
          Move to Next Stage
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return null;
};

export default JourneyAdvanceButton;