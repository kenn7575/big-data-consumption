"use client";

import * as React from "react";

import { NavMain } from "@/components/NavMain";
import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";

import { Music } from "lucide-react";

const data = {
  navMain: [
    {
      title: "Songs",
      icon: Music,
      items: [
        { title: "All songs", url: "/dashboard/songs" },
        { title: "Bar race", url: "/dashboard/race" },
        { title: "Map", url: "/dashboard/map" },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
