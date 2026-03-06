'use client';

import {
  BookOpenCheck,
  LayoutDashboard,
  LogOut,
  Settings,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '../ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth } from '@/hooks/use-auth';
import { BrainCircuit } from 'lucide-react';

export function AppSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/exams', label: 'My Exams', icon: BookOpenCheck },
    { href: '/upload', label: 'Upload PDF', icon: Upload },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BrainCircuit className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-semibold">Quizify</h1>
        </div>
      </SidebarHeader>
      <SidebarMenu className="p-2">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton asChild className="h-10" isActive={pathname === item.href}>
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
          <div className="flex flex-col gap-2 p-2">
             <Button variant="ghost" className="justify-start" asChild>
                <Link href="/settings">
                    <Settings />
                    <span>Settings</span>
                </Link>
            </Button>
            <Button variant="ghost" className="justify-start" onClick={signOut}>
                <LogOut />
                <span>Sign Out</span>
            </Button>
            {user && (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                  <Avatar>
                      <AvatarImage src={user.photoURL || userAvatar?.imageUrl} data-ai-hint={userAvatar?.imageHint} />
                      <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                      <span className="font-semibold truncate">{user.displayName || user.email}</span>
                      <span className="text-sm text-muted-foreground truncate">{user.email}</span>
                  </div>
              </div>
            )}
          </div>
      </SidebarFooter>
    </Sidebar>
  );
}
