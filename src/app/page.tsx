
'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Dashboard } from "@/components/dashboard/dashboard";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppHeader } from "@/components/layout/app-header";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
    }
  }, [user, loading, router]);

  return (
    <SidebarProvider>
      {loading || !user ? (
        <div className="flex min-h-screen bg-muted/20">
          <div className="hidden md:flex md:flex-col p-2 w-64 border-r">
            <div className="flex items-center gap-3 p-2">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-6 w-32" />
            </div>
            <div className="p-2 flex flex-col gap-2 mt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <main className="flex-1 p-6 md:p-8">
              <AppHeader />
              <Skeleton className="w-1/2 h-8 mb-4" />
              <Skeleton className="w-1/3 h-6 mb-8" />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Skeleton className="h-80" />
                </div>
                <div className="lg:col-span-1">
                  <Skeleton className="h-80" />
                </div>
              </div>
          </main>
        </div>
      ) : (
        <div className="flex min-h-screen">
          <AppSidebar />
          <SidebarInset>
              <AppHeader />
              <Dashboard userName={user.displayName || user.email || 'User'} />
          </SidebarInset>
        </div>
      )}
    </SidebarProvider>
  );
}
