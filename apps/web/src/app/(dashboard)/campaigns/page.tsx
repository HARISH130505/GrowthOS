"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, Plus, Target, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface Campaign {
  id: string;
  name: string;
  status: "DRAFT" | "SCHEDULED" | "RUNNING" | "PAUSED" | "COMPLETED" | "FAILED";
  channel: string;
  createdAt: string;
  segment: {
    name: string;
    size: number;
  };
  actualSent: number;
  actualDelivered: number;
  actualOpened: number;
  actualClicked: number;
}

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/campaigns`);
      return res.json();
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Campaigns</h1>
          <p className="text-slate-500 mt-1">Manage and monitor all your AI-generated growth campaigns.</p>
        </div>
        <Link
          href="/goal"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Link>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Card key={i} className="h-32 animate-pulse bg-slate-100 border-none" />)}
          </div>
        ) : campaigns?.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 bg-white text-center border-dashed border-2">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">No campaigns yet</h3>
            <p className="text-slate-500 mt-2 max-w-sm">Use the AI Goal Planner to design and launch your first targeted campaign.</p>
            <Link href="/goal" className="mt-6 text-blue-600 font-medium hover:underline">
              Go to Goal Planner &rarr;
            </Link>
          </Card>
        ) : (
          campaigns?.map(campaign => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group border-slate-200">
                <CardContent className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4 md:space-x-6 w-full md:w-auto">
                    <div className="space-y-2">
                      <h3 className="text-base md:text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {campaign.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs md:text-sm text-slate-500">
                        <span className="flex items-center">
                          <Target className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
                          {campaign.channel}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
                          {campaign.segment.name} ({campaign.segment.size})
                        </span>
                        <span>
                          {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto space-x-4 md:space-x-8 pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                    {/* Mini metrics for running campaigns */}
                    {campaign.status !== "DRAFT" && (
                      <div className="flex space-x-4 md:space-x-6 text-sm">
                        <div className="text-center">
                          <p className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase mb-1">Sent</p>
                          <p className="font-bold text-slate-900">{campaign.actualSent}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase mb-1">Opened</p>
                          <p className="font-bold text-slate-900">{campaign.actualOpened}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase mb-1">Conv.</p>
                          <p className="font-bold text-emerald-600">{campaign.actualClicked}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 shrink-0">
                      <Badge variant={
                        campaign.status === "RUNNING" ? "default" :
                        campaign.status === "COMPLETED" ? "secondary" : "outline"
                      } className={campaign.status === "RUNNING" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                        {campaign.status}
                      </Badge>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
