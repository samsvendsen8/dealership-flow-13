import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MessageSquare, CheckCircle, Clock, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InlineActionFormProps {
  actionType: 'call' | 'text' | 'email' | 'appointment';
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
  email: Mail,
  appointment: Calendar
};

const actionLabels = {
  call: 'Phone Call',
  text: 'Text Message',
  email: 'Email',
  appointment: 'Schedule Appointment'
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

        {/* Work Plan Context (hidden for text/email per request) */}
        {workPlanItem && !(actionType === 'text' || actionType === 'email') && (
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

        {/* AI Response Interface */}
        {(actionType === 'text' || actionType === 'email') && (
          <div className="space-y-3">
            {/* AI Suggested Response */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 dark:bg-blue-950/20 dark:border-blue-800">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded">
                  <MessageSquare className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs font-medium text-blue-800 dark:text-blue-200">AI Suggested Response:</p>
              </div>
              <div className="bg-white dark:bg-gray-900/50 border border-blue-200 dark:border-blue-700 rounded-md p-2">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  Hi {leadName}, I noticed you were looking at the 2024 Tesla Model 3. I'm here to answer any questions and can schedule a test drive whenever convenient for you!
                </p>
              </div>
            </div>

            {/* Custom AI Refinement */}
            <div className="bg-background/50 border border-border rounded-md p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="bg-primary/10 p-1 rounded">
                  <MessageSquare className="h-3 w-3 text-primary" />
                </div>
                <p className="text-xs font-medium text-primary">Ask AI to modify response</p>
              </div>
              <p className="text-xs text-muted-foreground">Tell the AI how to improve or change the suggested response</p>
              <Textarea
                placeholder="e.g., make it more friendly, add pricing details, mention warranty..."
                className="min-h-[50px] text-xs bg-white dark:bg-background border-input"
              />
              <Button size="sm" className="w-auto h-8 bg-primary text-primary-foreground hover:bg-primary/90">
                <MessageSquare className="h-3 w-3 mr-2" />
                Update Response with AI
              </Button>
            </div>

            {/* Quick Edits */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Quick edits:</p>
              <div className="flex flex-wrap gap-1">
                <Button variant="outline" size="sm" className="text-xs h-6 px-2">
                  Make Shorter
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-6 px-2">
                  Make Casual
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-6 px-2">
                  Add Urgency
                </Button>
              </div>
            </div>

            {/* Send Button */}
            <Button className="w-auto h-8">
              <Mail className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border"></div>

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
            className="resize-none bg-white dark:bg-background border-input"
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