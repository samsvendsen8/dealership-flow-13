import { useState } from 'react';
import { X, Send, Edit3, Eye, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ToastNotificationProps {
  isVisible: boolean;
  leadName: string;
  message: string;
  suggestedResponse: string;
  onSend: (message: string) => void;
  onEdit: () => void;
  onViewDetails: () => void;
  onDismiss: () => void;
  stackIndex?: number;
  leadInfo?: {
    vehicle?: string;
    value?: number;
    budget?: { min: number; max: number };
    source?: string;
  };
}

export function ToastNotification({
  isVisible,
  leadName,
  message,
  suggestedResponse,
  onSend,
  onEdit,
  onViewDetails,
  onDismiss,
  stackIndex = 0,
  leadInfo
}: ToastNotificationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedResponse, setEditedResponse] = useState(suggestedResponse);
  const [aiInstructions, setAiInstructions] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const { toast } = useToast();
  
  // AI refinement function
  const refineWithAI = async () => {
    if (!aiInstructions.trim()) {
      toast({
        title: "Please enter instructions",
        description: "Tell the AI how you'd like to modify the message",
        variant: "destructive",
      });
      return;
    }

    setIsRefining(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('refine-message', {
        body: {
          originalMessage: editedResponse,
          userInstructions: aiInstructions,
          leadName,
          leadInfo
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to refine message');
      }

      if (data.success) {
        setEditedResponse(data.refinedMessage);
        setAiInstructions('');
        setIsEditing(true);
        toast({
          title: "Message refined!",
          description: "The AI has updated your message based on your instructions",
        });
      } else {
        throw new Error(data.error || 'Failed to refine message');
      }
    } catch (error) {
      console.error('Error refining message:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to refine message',
        variant: "destructive",
      });
    } finally {
      setIsRefining(false);
    }
  };

  // AI modification functions
  const modifyResponse = (type: string) => {
    let modified = suggestedResponse;
    
    switch (type) {
      case 'shorter':
        // Make the response shorter
        const sentences = suggestedResponse.split('.').filter(s => s.trim());
        modified = sentences.slice(0, Math.max(1, Math.floor(sentences.length / 2))).join('.') + '.';
        break;
      case 'casual':
        // Make the response more casual
        modified = suggestedResponse
          .replace(/Dear /g, 'Hi ')
          .replace(/I would like to/g, "I'd love to")
          .replace(/Thank you for your interest/g, 'Thanks for checking out')
          .replace(/Best regards,/g, 'Talk soon!')
          .replace(/I am/g, "I'm")
          .replace(/We would be/g, "We'd be")
          .replace(/\[Your Name\]/g, 'me');
        break;
      case 'urgent':
        modified = `🚨 URGENT: ${suggestedResponse} This is time-sensitive - please respond ASAP!`;
        break;
      case 'friendly':
        modified = `Hey ${leadName.split(' ')[0]}! 😊 ${suggestedResponse} Looking forward to hearing from you!`;
        break;
      case 'professional':
        modified = suggestedResponse
          .replace(/Hi /g, 'Dear ')
          .replace(/Thanks/g, 'Thank you')
          .replace(/I'd/g, 'I would')
          .replace(/can't/g, 'cannot')
          .replace(/we'd/g, 'we would');
        break;
    }
    
    setEditedResponse(modified);
    setIsEditing(true);
  };

  // Update editedResponse when suggestedResponse changes
  if (editedResponse !== suggestedResponse && !isEditing) {
    setEditedResponse(suggestedResponse);
  }

  if (!isVisible) return null;

  const handleSend = () => {
    onSend(isEditing ? editedResponse : suggestedResponse);
  };

  const handleEdit = () => {
    setIsEditing(true);
    onEdit();
  };

  return (
    <div className={cn(
      'w-96 animate-slide-in-right transition-all duration-300',
      stackIndex > 0 && 'opacity-90 scale-95'
    )}>
      <Card className="border-l-4 border-l-hot-lead shadow-strong bg-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-hot-lead text-white" variant="secondary">
                  🔥 Hot Lead Update
                </Badge>
              </div>
              <h4 className="font-semibold text-foreground">{leadName}</h4>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
              <p className="text-xs font-medium text-primary mb-2">
                🤖 AI Suggested Response:
              </p>
              {isEditing ? (
                <textarea
                  value={editedResponse}
                  onChange={(e) => setEditedResponse(e.target.value)}
                  className="w-full h-32 p-2 text-sm border border-input rounded-md resize-none"
                />
              ) : (
                <p className="text-sm text-foreground">{suggestedResponse}</p>
              )}
              
              {/* Custom AI Refinement Section */}
              <div className="mt-3 pt-3 border-t border-border/30 bg-background/50 rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary">Ask AI to modify response</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Tell the AI how to improve or change the suggested response</p>
                <div className="space-y-2">
                  <textarea
                    placeholder="e.g., make it more friendly, add pricing details, mention warranty..."
                    value={aiInstructions}
                    onChange={(e) => {
                      setAiInstructions(e.target.value);
                      // Auto-resize textarea
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 72) + 'px';
                    }}
                    className="w-full text-xs border border-input rounded-md px-3 py-2 resize-none overflow-hidden bg-background"
                    rows={1}
                    style={{
                      height: '40px',
                      minHeight: '40px',
                      maxHeight: '72px'
                    }}
                    disabled={isRefining}
                  />
                  <Button
                    size="sm"
                    onClick={refineWithAI}
                    disabled={isRefining || !aiInstructions.trim()}
                    className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isRefining ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Refining...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        Update Response with AI
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* AI Modification Options - Available in both modes */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Quick edits:</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-6 px-2 text-xs"
                  onClick={() => modifyResponse('shorter')}
                >
                  Make Shorter
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-6 px-2 text-xs"
                  onClick={() => modifyResponse('casual')}
                >
                  Make Casual
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => modifyResponse('urgent')}>
                      <span className="text-xs">🚨 Make Urgent</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => modifyResponse('friendly')}>
                      <span className="text-xs">😊 Make Friendly</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => modifyResponse('professional')}>
                      <span className="text-xs">👔 Make Professional</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button 
                    size="sm" 
                    className="flex-1 gap-2 bg-gradient-primary hover:opacity-90"
                    onClick={handleSend}
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    size="sm" 
                    className="flex-1 gap-2 bg-gradient-primary hover:opacity-90"
                    onClick={handleSend}
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleEdit}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={onViewDetails}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}