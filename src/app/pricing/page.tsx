
'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PricingPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
           <main className="p-4 sm:p-6 md:p-8 flex items-center justify-center">
                <Card>
                    <CardHeader>
                        <CardTitle>Unlimited Access</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>The pricing section has been disabled. You now have unlimited access.</p>
                    </CardContent>
                </Card>
           </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
