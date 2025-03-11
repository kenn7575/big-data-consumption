import { cookies } from "next/headers";

import { AppSidebar } from "@/components/AppSidebar";
import DynamicBreadcrumbs from "@/components/DynamicBreadcrumbs";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { LayoutProps } from "@/types/Layout";

export default async function DashboardLayout({ children }: LayoutProps) {
  const cookieStore = await cookies();

  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen} className="sticky top-0">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumbs />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
