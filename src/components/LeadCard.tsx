import { useState } from 'react';
import { Phone, Mail, MessageCircle, Clock, DollarSign, Car, ArrowRight, ChevronDown, Calendar, MapPin, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  priority: 'hot' | 'warm' | 'cold';
  lastActivity: string;
  value: number;
  source: string;
  timeOnLot?: string;
  notes?: string;
  journeyStage: 'inquiry' | 'engaged' | 'visit' | 'test-drive' | 'proposal' | 'financing' | 'sold' | 'delivered';
  stageProgress: number; // 0-100 percentage
}

interface LeadCardProps {
  lead: Lead;
  onContact: (leadId: string, method: 'phone' | 'email' | 'text') => void;
  onViewDetails: (leadId: string) => void;
  isCondensed?: boolean;
}

const priorityStyles = {
  hot: 'border-l-hot-lead bg-gradient-to-r from-hot-lead/5 to-transparent',
  warm: 'border-l-warm-lead bg-gradient-to-r from-warm-lead/5 to-transparent',
  cold: 'border-l-cold-lead bg-gradient-to-r from-cold-lead/5 to-transparent'
};

const statusStyles = {
  new: 'bg-status-new text-white',
  contacted: 'bg-status-contacted text-white',
  qualified: 'bg-status-qualified text-white',
  closed: 'bg-status-closed text-white'
};

const priorityLabels = {
  hot: '🔥 Hot Lead',
  warm: '⚡ Warm Lead',
  cold: '❄️ Cold Lead'
};

const journeyStages = {
  inquiry: { label: 'Inquiry', icon: '💬', color: 'bg-blue-500' },
  engaged: { label: 'Engaged', icon: '🎯', color: 'bg-teal-500' },
  visit: { label: 'Visit', icon: '🏢', color: 'bg-purple-500' },
  'test-drive': { label: 'Test Drive', icon: '🚗', color: 'bg-orange-500' },
  proposal: { label: 'Proposal', icon: '📄', color: 'bg-yellow-500' },
  financing: { label: 'Financing', icon: '🏦', color: 'bg-indigo-500' },
  sold: { label: 'Sold', icon: '✅', color: 'bg-green-500' },
  delivered: { label: 'Delivered', icon: '🎉', color: 'bg-emerald-500' }
};

export function LeadCard({ lead, onContact, onViewDetails, isCondensed = false }: LeadCardProps) {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  
  // Get recommended quick actions based on journey stage
  const getQuickActions = () => {
    switch (lead.journeyStage) {
      case 'inquiry':
        return [
          { label: 'Follow up', icon: Phone, action: () => onContact(lead.id, 'phone') },
          { label: 'Send info', icon: Mail, action: () => onContact(lead.id, 'email') }
        ];
      case 'engaged':
        return [
          { label: 'Schedule visit', icon: Calendar, action: () => onViewDetails(lead.id) },
          { label: 'Send location', icon: MapPin, action: () => onContact(lead.id, 'text') }
        ];
      case 'visit':
        return [
          { label: 'Schedule test drive', icon: Car, action: () => onViewDetails(lead.id) },
          { label: 'Quick call', icon: Phone, action: () => onContact(lead.id, 'phone') }
        ];
      case 'test-drive':
        return [
          { label: 'Send proposal', icon: FileText, action: () => onContact(lead.id, 'email') },
          { label: 'Discuss trade-in', icon: Phone, action: () => onContact(lead.id, 'phone') }
        ];
      default:
        return [
          { label: 'Call', icon: Phone, action: () => onContact(lead.id, 'phone') },
          { label: 'Email', icon: Mail, action: () => onContact(lead.id, 'email') }
        ];
    }
  };

  const quickActions = getQuickActions();
  
  if (isCondensed) {
    return (
      <Card 
        className={cn(
          'relative border-l-4 transition-all duration-300 cursor-pointer shadow-soft hover:shadow-medium',
          priorityStyles[lead.priority]
        )}
        onClick={() => onViewDetails(lead.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-semibold text-foreground truncate">{lead.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-xs text-white", journeyStages[lead.journeyStage].color)}>
                    {journeyStages[lead.journeyStage].icon}
                  </div>
                  <span className="font-medium">{journeyStages[lead.journeyStage].label}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Car className="h-3 w-3" />
                  {lead.vehicle}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-success" />
                  ${lead.value.toLocaleString()}
                </span>
                <span>{lead.lastActivity}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={cn(statusStyles[lead.status], "text-xs")} variant="secondary">
                {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
              </Badge>
              
              {/* Quick Actions */}
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                {quickActions.slice(0, 2).map((action, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={action.action}
                    title={action.label}
                  >
                    <action.icon className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {lead.timeOnLot && (
            <div className="mt-2 text-xs text-warning font-medium">
              🚗 On lot: {lead.timeOnLot}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card 
      className={cn(
        'relative border-l-4 transition-all duration-300 cursor-pointer shadow-soft hover:shadow-medium',
        priorityStyles[lead.priority]
      )}
      onClick={() => onViewDetails(lead.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-foreground">{lead.name}</h3>
            <p className="text-sm text-muted-foreground">{lead.email}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={statusStyles[lead.status]} variant="secondary">
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              {priorityLabels[lead.priority]}
            </span>
          </div>
        </div>
        
        {/* Journey Stage Progress */}
        <div className="mt-3 p-2 bg-muted/30 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Journey Stage</span>
            <span className="text-xs text-muted-foreground">{lead.stageProgress}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs text-white", journeyStages[lead.journeyStage].color)}>
              {journeyStages[lead.journeyStage].icon}
            </div>
            <span className="text-sm font-medium">{journeyStages[lead.journeyStage].label}</span>
            <div className="flex-1 mx-2">
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className={cn("h-1.5 rounded-full transition-all duration-500", journeyStages[lead.journeyStage].color)}
                  style={{ width: `${lead.stageProgress}%` }}
                />
              </div>
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Actions Bar */}
        <div className="flex items-center justify-between bg-muted/20 rounded-lg p-2">
          <div className="text-xs font-medium text-muted-foreground">Recommended:</div>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {quickActions.map((action, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs gap-1"
                onClick={action.action}
              >
                <action.icon className="h-3 w-3" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* AI Journey Analysis */}
        <Collapsible open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
          <div className="bg-gradient-to-r from-primary/5 to-hot-lead/5 border border-primary/20 rounded-lg p-3 space-y-2">
            <CollapsibleTrigger 
              className="flex items-center justify-between w-full hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-full bg-gradient-primary text-white">
                  <MessageCircle className="h-3 w-3" />
                </div>
                <h4 className="font-medium text-primary text-sm">AI Journey Analysis</h4>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-primary transition-transform duration-200", isAnalysisOpen && "rotate-180")} />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-2 text-xs">
              <p className="text-foreground">
                <strong>Overview:</strong> {lead.name} has progressed {
                  lead.journeyStage === 'inquiry' ? 'through initial inquiry stage' :
                  lead.journeyStage === 'engaged' ? 'to active engagement with positive responses' :
                  lead.journeyStage === 'visit' ? 'to showroom visit with strong buying signals' :
                  lead.journeyStage === 'test-drive' ? 'to test drive completion with purchase intent' :
                  'through the sales pipeline'
                }.
              </p>
              
              {/* Notable Patterns */}
              {lead.journeyStage === 'engaged' && (
                <div className="bg-success/10 border border-success/20 rounded-md p-2">
                  <p className="text-success text-xs font-medium">✓ Notable: Quick response shows high engagement</p>
                </div>
              )}
              
              {lead.journeyStage === 'visit' && (
                <div className="bg-hot-lead/10 border border-hot-lead/20 rounded-md p-2">
                  <p className="text-hot-lead text-xs font-medium">🔥 Hot Signal: Extended visit with financing questions</p>
                </div>
              )}
              
              {lead.journeyStage === 'test-drive' && (
                <div className="bg-success/10 border border-success/20 rounded-md p-2">
                  <p className="text-success text-xs font-medium">🎯 Purchase Ready: Asked about trade-in - strong buying intent</p>
                </div>
              )}
              
              {lead.priority === 'hot' && (
                <div className="bg-warning/10 border border-warning/20 rounded-md p-2">
                  <p className="text-warning text-xs font-medium">⚠️ Irregular: High-value lead with rapid progression - prioritize follow-up</p>
                </div>
              )}
              
              <p className="text-muted-foreground text-xs">
                <strong>Next action:</strong> {
                  lead.journeyStage === 'inquiry' ? 'Follow up with alternative contact method' :
                  lead.journeyStage === 'engaged' ? 'Confirm weekend appointment details' :
                  lead.journeyStage === 'visit' ? 'Schedule test drive immediately' :
                  lead.journeyStage === 'test-drive' ? 'Present purchase proposal with trade-in evaluation' :
                  'Continue nurturing relationship'
                }
              </p>
            </CollapsibleContent>
          </div>
        </Collapsible>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{lead.vehicle}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-success" />
            <span className="font-medium">${lead.value.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{lead.lastActivity}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Source:</span>
            <span className="text-xs font-medium">{lead.source}</span>
          </div>
        </div>

        {lead.timeOnLot && (
          <div className="bg-warning/10 border border-warning/20 rounded-md p-2">
            <p className="text-xs font-medium text-warning">
              🚗 Customer on lot: {lead.timeOnLot}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => onContact(lead.id, 'phone')}
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => onContact(lead.id, 'text')}
          >
            <MessageCircle className="h-4 w-4" />
            Text
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => onContact(lead.id, 'email')}
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}