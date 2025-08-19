import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadName: string;
  phoneNumber: string;
}

export function CallSimulationModal({ isOpen, onClose, leadName, phoneNumber }: CallSimulationModalProps) {
  const [callStatus, setCallStatus] = useState<'dialing' | 'connected' | 'ended'>('dialing');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCallStatus('dialing');
      setDuration(0);
      return;
    }

    // Simulate call connecting after 2 seconds
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 2000);

    return () => clearTimeout(connectTimer);
  }, [isOpen]);

  useEffect(() => {
    if (callStatus === 'connected') {
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {callStatus === 'dialing' && 'Calling...'}
            {callStatus === 'connected' && 'In Call'}
            {callStatus === 'ended' && 'Call Ended'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Contact Info */}
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-semibold text-primary">
                {leadName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-lg font-semibold">{leadName}</h3>
            <p className="text-sm text-muted-foreground">{phoneNumber}</p>
          </div>

          {/* Call Status */}
          <div className="text-center">
            {callStatus === 'dialing' && (
              <Badge variant="outline" className="text-primary border-primary">
                <div className="animate-pulse mr-2">●</div>
                Ringing...
              </Badge>
            )}
            {callStatus === 'connected' && (
              <Badge className="bg-success text-white">
                <div className="animate-pulse mr-2">●</div>
                Connected • {formatDuration(duration)}
              </Badge>
            )}
            {callStatus === 'ended' && (
              <Badge variant="outline" className="text-muted-foreground">
                Call ended • {formatDuration(duration)}
              </Badge>
            )}
          </div>

          {/* Call Controls */}
          {callStatus !== 'ended' && (
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={() => setIsMuted(!isMuted)}
                disabled={callStatus === 'dialing'}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-14 h-14"
                disabled={callStatus === 'dialing'}
              >
                <Volume2 className="h-6 w-6" />
              </Button>
              
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={handleEndCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          )}

          {/* Call Notes Area */}
          {callStatus === 'connected' && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quick Notes:</h4>
              <textarea
                className="w-full h-20 p-2 border border-input rounded-md text-sm resize-none"
                placeholder="Take notes during the call..."
              />
            </div>
          )}

          {callStatus === 'ended' && (
            <div className="text-center">
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}