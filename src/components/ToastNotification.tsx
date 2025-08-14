import { useState } from 'react';
import { X, Send, Edit3, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
}

export function ToastNotification({
  isVisible,
  leadName,
  message,
  suggestedResponse,
  onSend,
  onEdit,
  onViewDetails,
  onDismiss
}: ToastNotificationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedResponse, setEditedResponse] = useState(suggestedResponse);

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
      'fixed top-4 right-4 w-96 z-50 animate-slide-in-right',
      'transition-all duration-300'
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
                  className="w-full h-20 p-2 text-sm border border-input rounded-md resize-none"
                />
              ) : (
                <p className="text-sm text-foreground">{suggestedResponse}</p>
              )}
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