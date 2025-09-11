import { Users, ArrowLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyLeadStateProps {
  hasLeadsInQuickList: boolean;
  onSelectFirstLead?: () => void;
}

export function EmptyLeadState({ hasLeadsInQuickList, onSelectFirstLead }: EmptyLeadStateProps) {
  if (hasLeadsInQuickList) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
        <Card className="p-8 max-w-md text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="mb-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Ready to start working?
            </h3>
            <p className="text-muted-foreground mb-6">
              Click on any lead from the Quick Leads list on the left to view their details and begin your outreach.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Start with your highest priority leads</span>
            </div>
            
            {onSelectFirstLead && (
              <Button 
                onClick={onSelectFirstLead}
                className="w-full gap-2 bg-primary hover:bg-primary/90"
              >
                <Zap className="h-4 w-4" />
                Select First Lead
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
      <Card className="p-8 max-w-md text-center">
        <div className="mb-6">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No leads found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria to find leads.
          </p>
        </div>
      </Card>
    </div>
  );
}