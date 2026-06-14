"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Target, Users, Zap, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface Overview {
  totalRevenue: number;
  totalCustomers: number;
  activeCampaigns: number;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  opportunityScore: number;
  potentialRevenue: number;
  estimatedConversion: number;
  confidenceScore: number;
  recommendedChannel: string;
}

export default function MissionControlPage() {
  const { data: overview, isLoading: loadingOverview } = useQuery<Overview>({
    queryKey: ["analytics", "overview"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/analytics/overview`);
      return res.json();
    },
  });

  const { data: opportunities, isLoading: loadingOpps } = useQuery<Opportunity[]>({
    queryKey: ["analytics", "opportunities"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/analytics/opportunities`);
      return res.json();
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-700 slide-in-from-bottom-4">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-800 text-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.2)] transition-all duration-500 hover:-translate-y-1 group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-indigo-200 text-sm font-semibold flex items-center tracking-wider uppercase">
              <Zap className="w-4 h-4 mr-2 text-blue-400 group-hover:text-yellow-400 transition-colors" />
              Total Platform Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            {loadingOverview ? (
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            ) : (
              <div className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                ₹{overview?.totalRevenue.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90 transition-all duration-500 hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-500 text-sm font-semibold flex items-center tracking-wider uppercase">
              <Users className="w-4 h-4 mr-2 text-indigo-500" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOverview ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
            ) : (
              <div className="text-4xl font-black text-slate-800 tracking-tighter">
                {overview?.totalCustomers.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90 transition-all duration-500 hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-500 text-sm font-semibold flex items-center tracking-wider uppercase">
              <Target className="w-4 h-4 mr-2 text-emerald-500" />
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOverview ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
            ) : (
              <div className="text-4xl font-black text-slate-800 tracking-tighter">
                {overview?.activeCampaigns}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Opportunities Section */}
      <div className="pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 mr-2 drop-shadow-sm">
                AI-Discovered
              </span>
              Opportunities
            </h2>
            <p className="text-slate-500 text-base mt-2 max-w-2xl font-medium">
              GrowthOS continually analyzes your data to surface high-converting revenue opportunities.
            </p>
          </div>
          <Link
            href="/goal"
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-indigo-600 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all duration-300 text-center w-full md:w-auto shrink-0 flex items-center justify-center gap-2"
          >
            Create Custom Goal <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingOpps ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-48 animate-pulse bg-white/50 backdrop-blur-sm border-white/40 shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {opportunities?.map((opp) => (
              <Card key={opp.id} className="relative overflow-hidden bg-white/60 backdrop-blur-xl border-white/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90 transition-all duration-500 group cursor-pointer hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                        <Badge variant="outline" className={cn(
                          "shadow-sm border-none font-bold tracking-wide",
                          opp.opportunityScore > 90 
                            ? "bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20" 
                            : "bg-slate-100 text-slate-700 ring-1 ring-slate-900/10"
                        )}>
                          Score: {opp.opportunityScore}
                        </Badge>
                        <Badge variant="outline" className="bg-indigo-50/80 text-indigo-700 border-indigo-200/50 font-semibold uppercase tracking-wider text-[10px]">
                          {opp.recommendedChannel}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl md:text-2xl font-bold pt-1 text-slate-800 group-hover:text-indigo-600 transition-colors truncate md:whitespace-normal leading-tight">
                        {opp.title}
                      </CardTitle>
                    </div>
                    <Link
                      href={`/goal?template=${encodeURIComponent(opp.title)}`}
                      className="p-3 rounded-full bg-slate-100/80 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] group-hover:-rotate-12 transition-all duration-300 shrink-0"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </Link>
                  </div>
                  <CardDescription className="text-slate-500 mt-3 line-clamp-2 text-sm md:text-base leading-relaxed font-medium">
                    {opp.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="grid grid-cols-2 gap-6 pt-5 mt-2 border-t border-slate-200/50">
                    <div>
                      <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">
                        Potential Revenue
                      </p>
                      <p className="text-lg md:text-2xl font-black text-emerald-600 tracking-tighter">
                        ₹{opp.potentialRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">
                        Expected Conv.
                      </p>
                      <p className="text-lg md:text-2xl font-black text-slate-800 tracking-tighter">
                        {(opp.estimatedConversion * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
