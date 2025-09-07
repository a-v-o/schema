"use client";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import Link from "next/link";
import { PencilIcon, HomeIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { projects } from "@/db/schema";

const items = [
  {
    title: "Home",
    url: "/",
    icon: <HomeIcon size={20} strokeWidth={1.5} />,
  },
  {
    title: "Sketch",
    url: "/draw",
    icon: <PencilIcon size={20} strokeWidth={1.5} />,
  },
];

export default function AppSidebar({
  projectsArray,
}: {
  projectsArray: (typeof projects.$inferSelect)[];
}) {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname == item.url}>
                    <Link href={item.url} className="flex gap-2 items-center">
                      <span>{item.icon}</span>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectsArray.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    isActive={pathname == `/project/${project.id}`}
                  >
                    <Link
                      href={`/project/${project.id}`}
                      className="flex gap-2 items-center"
                    >
                      <span>{project.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
