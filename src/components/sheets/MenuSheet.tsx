import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, History, Settings, User } from 'lucide-react';
import { HistorySheet } from './HistorySheet';
import { SettingsSheet } from './SettingsSheet';
import { ProfileSheet } from './ProfileSheet';

export const MenuSheet = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const menuItems = [
    { 
      icon: History, 
      label: 'History', 
      onClick: () => {
        setMenuOpen(false);
        setHistoryOpen(true);
      }
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      onClick: () => {
        setMenuOpen(false);
        setSettingsOpen(true);
      }
    },
    { 
      icon: User, 
      label: 'Profile', 
      onClick: () => {
        setMenuOpen(false);
        setProfileOpen(true);
      }
    },
  ];

  return (
    <>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px]">
          <SheetHeader className="mb-6">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-2">
            {menuItems.map(({ icon: Icon, label, onClick }) => (
              <Button
                key={label}
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
                onClick={onClick}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <HistorySheet open={historyOpen} onOpenChange={setHistoryOpen} />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
};
