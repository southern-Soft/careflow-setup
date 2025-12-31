"use client";

import { BadgeCheck, Bell, ChevronRightIcon, CreditCard, LogOut, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import * as React from "react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ProfileDialog } from "@/components/profile-dialog";
import { getInitials } from "@/services/utils";

export default function UserMenu() {
  const { user, logout, isLoading } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  console.log("[UserMenu] Rendered - isLoading:", isLoading, "user:", user?.username);

  const handleLogout = () => {
    logout();
  };

  // Show loading skeleton while loading
  if (isLoading) {
    return (
      <div className="h-10 w-10 animate-pulse rounded-lg bg-muted"></div>
    );
  }

  // Don't show anything if no user
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
            {getInitials(user.full_name || user.username)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-60" align="end">
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar>
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                {getInitials(user.full_name || user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.full_name || user.username}</span>
              <span className="text-muted-foreground truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setProfileOpen(true)} className="cursor-pointer">
            <User />
            Profile
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </DropdownMenu>
  );
}
