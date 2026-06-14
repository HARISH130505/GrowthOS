"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Target, BarChart3, Settings, Menu, X, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignInButton, SignUpButton, Show, UserButton, useUser } from "@clerk/nextjs";

const navigation = [
  { name: "Mission Control", href: "/", icon: LayoutDashboard },
  { name: "Goal Planner", href: "/goal", icon: Target },
  { name: "Campaigns", href: "/campaigns", icon: BarChart3 },
  { name: "Analytics", href: "/analytics", icon: MessageSquareText },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-slate-800/50",
        "bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-emerald-950/20 text-slate-100 shadow-2xl",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            GrowthOS
          </span>
          <button className="md:hidden text-slate-400 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  isActive
                    ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/10"
                    : "text-slate-400 hover:bg-white/5 hover:text-white hover:scale-[1.02]",
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ease-out"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "text-slate-500 group-hover:text-emerald-400",
                    "mr-3 flex-shrink-0 h-5 w-5 transition-all duration-300"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10 shrink-0 bg-black/20 backdrop-blur-md">
          <Show when="signed-in">
            <div className="flex items-center space-x-3 p-2 bg-slate-800/50 rounded-lg">
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-white truncate">{user?.fullName || "Your Account"}</span>
                <span className="text-xs text-slate-400 truncate">{user?.primaryEmailAddress?.emailAddress || ""}</span>
              </div>
            </div>
          </Show>
          <Show when="signed-out">
            <div className="flex flex-col space-y-2">
              <SignInButton mode="modal">
                <button className="w-full bg-slate-800 text-white hover:bg-slate-700 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="w-full bg-emerald-600 text-white hover:bg-emerald-500 py-2 rounded-md text-sm font-medium transition-colors shadow-sm border border-emerald-500">
                  Create Account
                </button>
              </SignUpButton>
            </div>
          </Show>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 shadow-sm sticky top-0 z-30">
          <button 
            className="md:hidden mr-4 text-slate-600 hover:text-slate-900"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900 truncate">
            {navigation.find((item) => item.href === pathname)?.name || "Dashboard"}
          </h1>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
