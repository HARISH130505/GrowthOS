"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Store, MessageSquareText, Bell, Users } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Workspace Settings</h1>
        <p className="text-slate-500">
          Manage your brand identity, AI preferences, and team configurations.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Brand & Store Profile */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Store className="w-5 h-5 mr-2 text-blue-600" />
              Brand Profile
            </CardTitle>
            <CardDescription>
              This information helps the AI understand your business context when generating strategies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Store Name</label>
                <Input defaultValue="GrowthOS Demo Store" className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Industry</label>
                <select className="flex h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950">
                  <option>E-Commerce & Retail</option>
                  <option>SaaS & Software</option>
                  <option>Healthcare</option>
                  <option>Education</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Target Audience Description</label>
              <textarea 
                className="flex w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 min-h-[80px]"
                defaultValue="Urban millennials interested in premium, sustainable lifestyle products."
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">Save Brand Profile</Button>
          </CardContent>
        </Card>

        {/* AI Copywriting Preferences */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <MessageSquareText className="w-5 h-5 mr-2 text-emerald-600" />
              AI Copywriting Preferences
            </CardTitle>
            <CardDescription>
              Configure the default tone of voice and guidelines for the Copy Agent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Default Tone of Voice</label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="px-4 py-2 text-sm cursor-pointer hover:bg-slate-200">Professional</Badge>
                <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-4 py-2 text-sm cursor-pointer border-emerald-200">Playful & Witty</Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm cursor-pointer hover:bg-slate-200">Urgent & Direct</Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm cursor-pointer hover:bg-slate-200">Empathetic</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Custom Instructions (Optional)</label>
              <textarea 
                className="flex w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 min-h-[80px]"
                placeholder="e.g., Never use emojis. Always mention our 30-day return policy."
              />
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700">Update Preferences</Button>
          </CardContent>
        </Card>

        {/* Team Access */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              Team Access
            </CardTitle>
            <CardDescription>
              Manage who can view analytics and approve AI campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                    {user?.fullName?.substring(0, 2) || "DU"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user?.fullName || "Demo User"} (You)
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.primaryEmailAddress?.emailAddress || "demo@growthos.ai"}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">Owner</Badge>
              </div>
              <Button variant="outline" className="w-full border-dashed">
                + Invite Team Member
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
