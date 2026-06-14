"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Activity, Mail, Users, Target, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useUser();

  const { data: campaign, isLoading, refetch } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/campaigns/${id}`);
      return res.json();
    },
    refetchInterval: (query) => ((query.state.data as any)?.status === "RUNNING" ? 3000 : false),
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading campaign data...</div>;
  if (!campaign) return <div>Campaign not found</div>;

  const funnelData = [
    { name: "Target", value: campaign.segment.size },
    { name: "Sent", value: campaign.actualSent },
    { name: "Delivered", value: campaign.actualDelivered },
    { name: "Opened", value: campaign.actualOpened },
    { name: "Clicked", value: campaign.actualClicked },
    { name: "Purchased", value: campaign.actualPurchased },
  ];

  const handleLaunch = async () => {
    try {
      await fetch(`${API_URL}/campaigns/${id}/launch`, { method: "POST" });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center space-x-4 text-slate-500 mb-2">
        <Link href="/campaigns" className="hover:text-slate-900 transition-colors flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Campaigns
        </Link>
      </div>

      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{campaign.name}</h1>
            <Badge variant={campaign.status === "RUNNING" ? "default" : "outline"} className={campaign.status === "RUNNING" ? "bg-emerald-500" : ""}>
              {campaign.status}
            </Badge>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">{campaign.channel}</Badge>
          </div>
          <p className="text-slate-600 max-w-2xl">{campaign.goal}</p>
        </div>

        {campaign.status === "DRAFT" && (
          <Button onClick={handleLaunch} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6">
            <Play className="w-4 h-4 mr-2" /> Launch Now
          </Button>
        )}
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Targeted" value={campaign.segment.size} icon={Users} />
        <MetricCard title="Messages Sent" value={campaign.actualSent} icon={Mail} />
        <MetricCard 
          title="Open Rate" 
          value={campaign.actualSent > 0 ? `${Math.round((campaign.actualOpened / campaign.actualSent) * 100)}%` : "0%"} 
          subValue={`Target: ${Math.round((campaign.estimatedOpenRate || 0) * 100)}%`}
          icon={Activity} 
        />
        <MetricCard 
          title="Conversion Rate" 
          value={campaign.actualSent > 0 ? `${Math.round((campaign.actualPurchased / campaign.actualSent) * 100)}%` : "0%"} 
          subValue={`Target: ${Math.round((campaign.estimatedConversionRate || 0) * 100)}%`}
          icon={Target} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Chart */}
        <div className="lg:col-span-2">
          <Card className="h-full border-slate-200">
            <CardHeader>
              <CardTitle>Delivery & Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Info */}
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-blue-200 flex items-center text-sm">
                <Sparkles className="w-4 h-4 mr-2" /> AI Predictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Expected Revenue</p>
                <p className="text-2xl font-bold text-emerald-400">₹{campaign.estimatedRevenue?.toLocaleString()}</p>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-3">
                <div>
                  <p className="text-slate-400 text-xs">Confidence</p>
                  <p className="font-semibold">{Math.round((campaign.confidenceScore || 0) * 100)}%</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Segment</p>
                  <p className="font-semibold">{campaign.segment.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Message Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-slate-50 rounded-md text-sm text-slate-700 whitespace-pre-wrap">
                {campaign.channel === "EMAIL" ? (
                  <div dangerouslySetInnerHTML={{ __html: campaign.messageTemplate.emailBody }} className="prose prose-sm max-w-none prose-p:leading-relaxed" />
                ) : (
                  <div className="font-mono">
                    {campaign.messageTemplate.whatsapp || campaign.messageTemplate.sms}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subValue, icon: Icon }: any) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-500">{title}</h3>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
