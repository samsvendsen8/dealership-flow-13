import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Car, 
  MapPin, 
  FileText,
  Edit,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface AppointmentDetailsViewProps {
  appointment: Appointment;
  onBack: () => void;
  onContact?: (method: 'phone' | 'email') => void;
}

const appointmentTypes = {
  test_drive: { 
    label: 'Test Drive', 
    color: 'bg-blue-500', 
    icon: Car,
    description: 'Customer test drive appointment'
  },
  consultation: { 
    label: 'Sales Consultation', 
    color: 'bg-green-500', 
    icon: User,
    description: 'Sales consultation meeting'
  },
  delivery: { 
    label: 'Vehicle Delivery', 
    color: 'bg-purple-500', 
    icon: CheckCircle,
    description: 'Vehicle delivery and paperwork'
  },
  service: { 
    label: 'Service Appointment', 
    color: 'bg-orange-500', 
    icon: FileText,
    description: 'Service department appointment'
  }
};

const statusColors = {
  confirmed: 'bg-success text-white',
  pending: 'bg-warning text-white',
  cancelled: 'bg-destructive text-white'
};

export function AppointmentDetailsView({ 
  appointment, 
  onBack, 
  onContact 
}: AppointmentDetailsViewProps) {
  const appointmentType = appointmentTypes[appointment.type];
  const TypeIcon = appointmentType.icon;

  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader className="pb-2 pt-4 px-3 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-sm sm:text-base font-semibold">Appointment Details</CardTitle>
              <p className="text-xs text-muted-foreground">{appointment.customerName}</p>
            </div>
          </div>
          <Badge className={cn('text-xs px-2 py-1', statusColors[appointment.status])}>
            {appointment.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-4 overflow-y-auto h-[calc(100%-4rem)]">
        <div className="space-y-4">
          {/* Appointment Overview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', appointmentType.color)}>
                  <TypeIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{appointmentType.label}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{appointmentType.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-primary">
                      <Clock className="h-4 w-4" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{appointment.customerName}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{appointment.phone}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onContact?.('phone')}
                    className="h-7 px-2"
                  >
                    Call
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{appointment.email}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onContact?.('email')}
                    className="h-7 px-2"
                  >
                    Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{appointment.vehicle}</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Stock #: VIN123456789 • $32,500 • Automatic • 25 MPG
              </div>
            </CardContent>
          </Card>

          {/* Appointment Notes */}
          {appointment.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{appointment.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Confirm
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Reschedule
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Directions
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-destructive border-destructive">
                  <XCircle className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preparation Checklist */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Preparation Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Vehicle keys ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Insurance documents prepared</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Vehicle inspection (pending)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Welcome packet prepared (pending)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}