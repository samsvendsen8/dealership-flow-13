import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InlineActionFormProps {
  actionType: 'call' | 'text' | 'email';
  leadName: string;
  leadId: string;
  workPlanItem?: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
  };
  onComplete: (notes: string, moveToNext: boolean) => void;
  onCancel: () => void;
}

const actionIcons = {
  call: Phone,
  text: MessageSquare,
  email: Mail
};

const actionLabels = {
  call: 'Phone Call',
  text: 'Text Message',
  email: 'Email'
};

export function InlineActionForm({ 
  actionType, 
  leadName, 
  leadId, 
  workPlanItem, 
  onComplete, 
  onCancel 
}: InlineActionFormProps) {
  const [notes, setNotes] = useState('');
  const [moveToNext, setMoveToNext] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const Icon = actionIcons[actionType];

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please add notes about this interaction.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onComplete(notes, moveToNext);
      
      toast({
        title: "Action Completed",
        description: `${actionLabels[actionType]} logged for ${leadName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete action. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 border-primary/20 bg-primary/5">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{actionLabels[actionType]} - {leadName}</h4>
              <p className="text-sm text-muted-foreground">Complete this work plan item</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>

        {/* Work Plan Context */}
        {workPlanItem && (
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-start space-x-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">{workPlanItem.title}</p>
                <p className="text-xs text-muted-foreground">{workPlanItem.description}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {workPlanItem.dueDate}
              </Badge>
            </div>
          </div>
        )}

        {/* Notes Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Interaction Notes
          </label>
          <Textarea
            placeholder={`Add notes about your ${actionLabels[actionType].toLowerCase()} with ${leadName}...`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="moveToNext"
            checked={moveToNext}
            onCheckedChange={(checked) => setMoveToNext(checked === true)}
          />
          <label 
            htmlFor="moveToNext" 
            className="text-sm font-medium cursor-pointer"
          >
            Move to Next Journey Step
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !notes.trim()}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Completing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Complete Work Plan Item</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}