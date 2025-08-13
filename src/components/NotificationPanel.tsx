import { useState } from 'react';
import { X, Phone, Mail, MessageCircle, User, Calendar, DollarSign, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Lead } from './LeadCard';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLead?: Lead;
  onContact: (leadId: string, method: 'phone' | 'email' | 'text') => void;
}

const statusStyles = {
  new: 'bg-status-new text-white',
  contacted: 'bg-status-contacted text-white',
  qualified: 'bg-status-qualified text-white',
  closed: 'bg-status-closed text-white'
};

export function NotificationPanel({ isOpen, onClose, selectedLead, onContact }: NotificationPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'notes'>('overview');

  if (!isOpen) return null;

  return (
    <div className={cn(
      'fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-strong z-50 transition-transform duration-300',
      isOpen ? 'translate-x-0' : 'translate-x-full'
    )}>
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Lead Details</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {selectedLead ? (
        <ScrollArea className="h-full pb-20">
          <div className="p-4 space-y-4">
            {/* Lead Header */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedLead.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedLead.email}</p>
                    <p className="text-sm text-muted-foreground">{selectedLead.phone}</p>
                  </div>
                  <Badge className={statusStyles[selectedLead.status]} variant="secondary">
                    {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedLead.vehicle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-success" />
                    <span>${selectedLead.value.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedLead.lastActivity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedLead.source}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start gap-3 bg-gradient-primary hover:opacity-90"
                  onClick={() => onContact(selectedLead.id, 'phone')}
                >
                  <Phone className="h-4 w-4" />
                  Call {selectedLead.name}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                  onClick={() => onContact(selectedLead.id, 'text')}
                >
                  <MessageCircle className="h-4 w-4" />
                  Send Text Message
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                  onClick={() => onContact(selectedLead.id, 'email')}
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </Button>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              {['overview', 'history', 'notes'].map((tab) => (
                <button
                  key={tab}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
                    activeTab === tab 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => setActiveTab(tab as any)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <Card>
              <CardContent className="pt-6">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Lead Priority</h4>
                      <Badge 
                        className={cn(
                          'text-white',
                          selectedLead.priority === 'hot' && 'bg-hot-lead',
                          selectedLead.priority === 'warm' && 'bg-warm-lead',
                          selectedLead.priority === 'cold' && 'bg-cold-lead'
                        )}
                      >
                        {selectedLead.priority.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                    
                    {selectedLead.timeOnLot && (
                      <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
                        <h4 className="font-medium text-warning mb-1">Customer on Lot</h4>
                        <p className="text-sm text-warning/80">{selectedLead.timeOnLot}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Vehicle Interest</h4>
                      <p className="text-sm text-muted-foreground">{selectedLead.vehicle}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Estimated Value</h4>
                      <p className="text-lg font-semibold text-success">
                        ${selectedLead.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-3">
                    <div className="border-l-2 border-status-new pl-3">
                      <p className="text-sm font-medium">Lead Created</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    <div className="border-l-2 border-status-contacted pl-3">
                      <p className="text-sm font-medium">First Contact Attempted</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                    <div className="border-l-2 border-warning pl-3">
                      <p className="text-sm font-medium">Customer Visited Website</p>
                      <p className="text-xs text-muted-foreground">30 minutes ago</p>
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="space-y-3">
                    <textarea 
                      className="w-full h-32 p-3 border border-input rounded-md text-sm resize-none"
                      placeholder="Add notes about this lead..."
                      defaultValue={selectedLead.notes || ''}
                    />
                    <Button size="sm" className="w-full">
                      Save Notes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Select a lead to view details</p>
        </div>
      )}
    </div>
  );
}