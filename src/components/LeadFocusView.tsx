import { useState } from 'react';
import { ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LeadCard, type Lead } from './LeadCard';
import { cn } from '@/lib/utils';

interface LeadFocusViewProps {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (leadId: string) => void;
  onContact: (leadId: string, method: 'phone' | 'email' | 'text') => void;
  onViewDetails: (leadId: string) => void;
  onBack: () => void;
}

export function LeadFocusView({ 
  leads, 
  selectedLeadId, 
  onSelectLead, 
  onContact, 
  onViewDetails, 
  onBack 
}: LeadFocusViewProps) {
  const selectedLead = leads.find(lead => lead.id === selectedLeadId);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  const getLeadPriorityColor = (lead: Lead) => {
    switch (lead.priority) {
      case 'hot': return 'border-l-hot-lead';
      case 'warm': return 'border-l-warm-lead';
      case 'cold': return 'border-l-cold-lead';
      default: return 'border-l-muted';
    }
  };

  const currentIndex = leads.findIndex(lead => lead.id === selectedLeadId);
  const nextLead = currentIndex < leads.length - 1 ? leads[currentIndex + 1] : null;
  const prevLead = currentIndex > 0 ? leads[currentIndex - 1] : null;

  return (
    <div className="h-screen flex bg-background">
      {/* Navigation Sidebar */}
      <div className={cn(
        "border-r border-border bg-muted/30 transition-all duration-300",
        isNavCollapsed ? "w-16" : "w-80"
      )}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!isNavCollapsed && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to List
                </Button>
                <Badge variant="secondary" className="ml-2">
                  {leads.length} leads
                </Badge>
              </>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsNavCollapsed(!isNavCollapsed)}
              className="h-8 w-8 p-0"
            >
              {isNavCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {!isNavCollapsed && (
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {leads.map((lead, index) => (
                <div 
                  key={lead.id}
                  className={cn(
                    "p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:bg-background/50",
                    getLeadPriorityColor(lead),
                    selectedLeadId === lead.id 
                      ? "bg-primary/10 border-primary ring-1 ring-primary/20" 
                      : "bg-background/30 hover:bg-background/60"
                  )}
                  onClick={() => onSelectLead(lead.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={cn(
                          "font-medium truncate text-sm",
                          selectedLeadId === lead.id ? "text-primary" : "text-foreground"
                        )}>
                          {lead.name}
                        </h4>
                        {lead.sentiment && (
                          <span className="text-xs">
                            {lead.sentiment === 'positive' ? '😊' : lead.sentiment === 'negative' ? '😟' : '😐'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{lead.vehicle}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-success">
                          ${lead.value.toLocaleString()}
                        </span>
                        {lead.dealProbability && (
                          <span className="text-xs text-primary">
                            {lead.dealProbability}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", {
                          'bg-hot-lead/20 text-hot-lead': lead.priority === 'hot',
                          'bg-warm-lead/20 text-warm-lead': lead.priority === 'warm',
                          'bg-cold-lead/20 text-cold-lead': lead.priority === 'cold',
                        })}
                      >
                        {lead.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  {lead.timeOnLot && (
                    <div className="mt-2 text-xs text-warning font-medium">
                      🚗 On lot: {lead.timeOnLot}
                    </div>
                  )}
                  
                  {lead.nextFollowUp && (
                    <div className="mt-1 text-xs text-primary">
                      📅 Next: {lead.nextFollowUp}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {isNavCollapsed && selectedLead && (
          <div className="p-2">
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                {currentIndex + 1}/{leads.length}
              </div>
              <div className="space-y-1">
                {prevLead && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSelectLead(prevLead.id)}
                    className="h-8 w-8 p-0"
                    title={prevLead.name}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                )}
                {nextLead && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSelectLead(nextLead.id)}
                    className="h-8 w-8 p-0"
                    title={nextLead.name}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Focus Area */}
      <div className="flex-1 p-6 overflow-auto">
        {selectedLead ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Lead Focus View
                </h1>
                <p className="text-muted-foreground">
                  Lead {currentIndex + 1} of {leads.length} • {selectedLead.name}
                </p>
              </div>
              <div className="flex gap-2">
                {prevLead && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onSelectLead(prevLead.id)}
                    className="gap-2"
                  >
                    <ChevronUp className="h-4 w-4" />
                    Previous
                  </Button>
                )}
                {nextLead && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onSelectLead(nextLead.id)}
                    className="gap-2"
                  >
                    Next
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <LeadCard
              lead={selectedLead}
              onContact={onContact}
              onViewDetails={onViewDetails}
              isCondensed={false}
              isFocused={true}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle className="text-center">Select a Lead</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Choose a lead from the navigation panel to view detailed information and take action.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}