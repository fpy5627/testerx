"use client";

import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Nav } from "@/types/blocks/base";
import { Link } from "@/i18n/navigation";
import Icon from "@/components/icon";

export function BottomNav({
  nav,
  ...props
}: {
  nav: Nav;
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {nav.items?.map((item, index) => {
            if (!item.url || !item.url.trim()) return null;
            return (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton asChild>
                  <Link href={item.url.trim() as any} target={item.target || "_self"}>
                    {item.icon && <Icon name={item.icon} />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
