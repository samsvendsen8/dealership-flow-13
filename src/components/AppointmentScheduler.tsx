import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MapPin, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AppointmentSchedulerProps {
  leadName: string;
  leadId: string;
  vehicle: string;
  onClose: () => void;
  onScheduled: (appointmentDetails: {
    date: string;
    time: string;
    type: string;
    notes: string;
  }) => void;
}

export function AppointmentScheduler({ 
  leadName, 
  leadId, 
  vehicle, 
  onClose, 
  onScheduled 
}: AppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('test_drive');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const appointmentTypes = [
    { value: 'test_drive', label: 'Test Drive', icon: '🚗' },
    { value: 'consultation', label: 'Consultation', icon: '💬' },
    { value: 'vehicle_viewing', label: 'Vehicle Viewing', icon: '👁️' },
    { value: 'delivery', label: 'Vehicle Delivery', icon: '📦' }
  ];

  const availableTimes = [
    '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for the appointment.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const appointmentDetails = {
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        notes: notes
      };
      
      onScheduled(appointmentDetails);
      
      toast({
        title: "Appointment Scheduled",
        description: `${appointmentTypes.find(t => t.value === appointmentType)?.label} scheduled with ${leadName} for ${selectedDate} at ${selectedTime}`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate next 14 days for date selection
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays (day 0)
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
    }
    
    return dates;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Schedule Appointment</CardTitle>
            <p className="text-sm text-muted-foreground">
              with {leadName} for {vehicle}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Appointment Type */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Appointment Type
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {appointmentTypes.map((type) => (
              <Button
                key={type.value}
                variant={appointmentType === type.value ? "default" : "outline"}
                onClick={() => setAppointmentType(type.value)}
                className="justify-start h-auto p-3"
              >
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Select Date
          </Label>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {getAvailableDates().map((date) => (
              <Button
                key={date.value}
                variant={selectedDate === date.value ? "default" : "outline"}
                onClick={() => setSelectedDate(date.value)}
                className="text-xs h-auto py-2"
              >
                {date.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Select Time
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {availableTimes.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                onClick={() => setSelectedTime(time)}
                className="text-xs h-auto py-2"
              >
                {time}
              </Button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes" className="text-sm font-medium">
            Additional Notes (Optional)
          </Label>
          <Textarea
            id="notes"
            placeholder="Any specific requests or information about the appointment..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-2"
          />
        </div>

        {/* Summary */}
        {selectedDate && selectedTime && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">Appointment Summary</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>{leadName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>{new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>{selectedTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{appointmentTypes.find(t => t.value === appointmentType)?.icon}</span>
                <span>{appointmentTypes.find(t => t.value === appointmentType)?.label}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSchedule}
            disabled={isSubmitting || !selectedDate || !selectedTime}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Scheduling...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Schedule Appointment</span>
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}