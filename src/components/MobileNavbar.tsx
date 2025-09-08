import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Eye, List, Target, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MobileNavbarProps {
  viewMode: 'list' | 'focus';
  onViewModeChange: (mode: 'list' | 'focus') => void;
  onNotificationToggle: () => void;
  isNotificationPanelOpen: boolean;
}

export function MobileNavbar({ 
  viewMode, 
  onViewModeChange, 
  onNotificationToggle, 
  isNotificationPanelOpen 
}: MobileNavbarProps) {
  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-2 lg:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-background/95 backdrop-blur border">
              <DropdownMenuItem asChild>
                <Link to="/" className="flex items-center gap-2 w-full">
                  <List className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/leads" className="flex items-center gap-2 w-full">
                  <Target className="h-4 w-4" />
                  All Leads
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewModeChange(viewMode === 'list' ? 'focus' : 'list')}>
                <div className="flex items-center gap-2 w-full">
                  <Eye className="h-4 w-4" />
                  {viewMode === 'list' ? 'Focus View' : 'List View'}
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <h1 className="text-sm font-semibold truncate">Dealership CRM</h1>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={isNotificationPanelOpen ? "default" : "outline"}
            size="sm"
            onClick={onNotificationToggle}
            className="h-8 w-8 p-0"
          >
            <Bell className="h-3 w-3" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}