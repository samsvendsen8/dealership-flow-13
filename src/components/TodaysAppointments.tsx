import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Plus, Car, Phone, Mail, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Lead } from './LeadCard';

interface Appointment {
  id: string;
  leadId: string;
  customerName: string;
  vehicle: string;
  date: string;
  time: string;
  type: 'test_drive' | 'consultation' | 'delivery' | 'service';
  status: 'confirmed' | 'pending' | 'cancelled';
  phone: string;
  email: string;
  notes?: string;
}

interface TodaysAppointmentsProps {
  onAppointmentClick: (appointment: Appointment) => void;
  selectedAppointmentId?: string;
  onScheduleNew: () => void;
}

const appointmentTypes = {
  test_drive: { label: 'Test Drive', color: 'bg-blue-500' },
  consultation: { label: 'Consultation', color: 'bg-green-500' },
  delivery: { label: 'Delivery', color: 'bg-purple-500' },
  service: { label: 'Service', color: 'bg-orange-500' }
};

const statusColors = {
  confirmed: 'bg-success text-white',
  pending: 'bg-warning text-white',
  cancelled: 'bg-destructive text-white'
};

// Mock appointments data
const mockAppointments: Appointment[] = [
  {
    id: '1',
    leadId: 'lead-1',
    customerName: 'Sarah Johnson',
    vehicle: '2024 Honda Accord',
    date: 'Today',
    time: '9:00 AM',
    type: 'test_drive',
    status: 'confirmed',
    phone: '(555) 123-4567',
    email: 'sarah.johnson@email.com',
    notes: 'Interested in hybrid features'
  },
  {
    id: '2',
    leadId: 'lead-2',
    customerName: 'Mike Chen',
    vehicle: '2024 Toyota Camry',
    date: 'Today',
    time: '11:30 AM',
    type: 'consultation',
    status: 'confirmed',
    phone: '(555) 987-6543',
    email: 'mike.chen@email.com',
    notes: 'First-time buyer, needs financing help'
  },
  {
    id: '3',
    leadId: 'lead-3',
    customerName: 'Emily Rodriguez',
    vehicle: '2024 Mazda CX-5',
    date: 'Today',
    time: '2:15 PM',
    type: 'test_drive',
    status: 'pending',
    phone: '(555) 456-7890',
    email: 'emily.rodriguez@email.com',
    notes: 'Comparing with other SUVs'
  },
  {
    id: '4',
    leadId: 'lead-4',
    customerName: 'David Wilson',
    vehicle: '2024 Subaru Outback',
    date: 'Today',
    time: '4:00 PM',
    type: 'delivery',
    status: 'confirmed',
    phone: '(555) 321-0987',
    email: 'david.wilson@email.com',
    notes: 'Final paperwork and key handover'
  },
  {
    id: '5',
    leadId: 'lead-5',
    customerName: 'Lisa Thompson',
    vehicle: '2024 Nissan Rogue',
    date: 'Today',
    time: '5:30 PM',
    type: 'consultation',
    status: 'confirmed',
    phone: '(555) 654-3210',
    email: 'lisa.thompson@email.com',
    notes: 'Trade-in evaluation needed'
  }
];

export function TodaysAppointments({ 
  onAppointmentClick, 
  selectedAppointmentId, 
  onScheduleNew 
}: TodaysAppointmentsProps) {
  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader className="pb-2 pt-4 px-3 sm:px-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm sm:text-base font-semibold">Today's Appointments</CardTitle>
            <p className="text-xs text-muted-foreground">{mockAppointments.length} scheduled</p>
          </div>
          <Button 
            size="sm" 
            onClick={onScheduleNew}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Schedule New
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 h-[calc(100%-4rem)]">
        <div className="space-y-1 px-2 sm:px-3 pb-2 overflow-y-auto h-full">
          {mockAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className={cn(
                'border border-border/50 rounded-md px-3 py-2.5 cursor-pointer transition-all duration-200 hover:bg-card hover:border-border hover:shadow-sm group touch-manipulation min-h-[60px]',
                selectedAppointmentId === appointment.id ? 
                  'ring-1 ring-primary bg-primary/5 shadow-sm border-primary/30 scale-[1.02]' : 
                  'hover:scale-[1.005] active:scale-[0.98]'
              )}
              onClick={() => onAppointmentClick(appointment)}
            >
              {/* Selection indicator */}
              {selectedAppointmentId === appointment.id && (
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-primary rounded-full border border-background"></div>
                </div>
              )}
              
              <div className="space-y-2">
                {/* Header Row - Time and Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-primary font-semibold">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{appointment.time}</span>
                    </div>
                    <div className={cn('w-2 h-2 rounded-full', appointmentTypes[appointment.type].color)} />
                  </div>
                  <Badge className={cn('text-xs px-2 py-0.5', statusColors[appointment.status])}>
                    {appointment.status}
                  </Badge>
                </div>

                {/* Customer and Vehicle Row */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-sm text-foreground truncate">
                      {appointment.customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">
                      {appointment.vehicle}
                    </span>
                  </div>
                </div>

                {/* Appointment Type */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {appointmentTypes[appointment.type].label}
                  </Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <Mail className="h-3 w-3" />
                  </div>
                </div>

                {/* Notes Preview */}
                {appointment.notes && (
                  <div className="text-xs text-muted-foreground truncate">
                    Note: {appointment.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {mockAppointments.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No appointments scheduled for today</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onScheduleNew}
                className="mt-2 gap-2"
              >
                <Plus className="h-4 w-4" />
                Schedule First Appointment
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}