"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Target, Sparkles, CheckCircle2, CircleDashed, Loader2, Play, Users, MessageSquare, Send } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export default function GoalPlannerPage() {
  const searchParams = useSearchParams();
  const templateGoal = searchParams.get("template") || "";
  const { user } = useUser();
  
  const [goal, setGoal] = useState(templateGoal);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [agentStatus, setAgentStatus] = useState<Record<string, "pending" | "running" | "completed">>({
    planner: "pending",
    audience: "pending",
    channel: "pending",
    copy: "pending"
  });
  
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;

    setIsOrchestrating(true);
    setResult(null);
    setAgentStatus({
      planner: "running",
      audience: "pending",
      channel: "pending",
      copy: "pending"
    });

    try {
      const response = await fetch(`${API_URL}/agents/orchestrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, userId: user?.id || "demo_user_001" }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader available");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "");
            if (dataStr) {
              try {
                const { event, data } = JSON.parse(dataStr);
                
                if (event === "PLANNER_COMPLETE") setAgentStatus(prev => ({ ...prev, planner: "completed", audience: "running" }));
                if (event === "AUDIENCE_COMPLETE") setAgentStatus(prev => ({ ...prev, audience: "completed", channel: "running" }));
                if (event === "CHANNEL_COMPLETE") setAgentStatus(prev => ({ ...prev, channel: "completed", copy: "running" }));
                if (event === "COPY_COMPLETE") setAgentStatus(prev => ({ ...prev, copy: "completed" }));
                
                if (event === "ORCHESTRATION_COMPLETE") {
                  setResult(data);
                  setIsOrchestrating(false);
                }
              } catch (e) {
                console.error("Error parsing SSE:", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Orchestration failed", error);
      setIsOrchestrating(false);
    }
  };

  const launchCampaign = async () => {
    if (!result?.campaignId) return;
    try {
      const response = await fetch(`${API_URL}/campaigns/${result.campaignId}/launch`, {
        method: "POST",
      });
      if (response.ok) {
        window.location.href = `/campaigns/${result.campaignId}`;
      }
    } catch (e) {
      console.error("Launch failed", e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Goal Planner</h1>
        <p className="text-slate-500">
          State your business goal and the Orchestrator AI will design, segment, and draft the perfect campaign.
        </p>
      </div>

      <Card className="bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-white/50 relative overflow-hidden group focus-within:shadow-[0_8px_30px_rgb(99,102,241,0.15)] transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-blue-500/5 to-emerald-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="pt-6 relative z-10">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 group/input">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Target className="h-5 w-5 text-indigo-400 group-focus-within/input:text-indigo-600 transition-colors" />
              </div>
              <Input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Increase repeat purchases from dormant customers by 15%"
                className="pl-12 h-14 text-base md:text-lg bg-white/50 border-slate-200/60 shadow-inner focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 transition-all placeholder:text-slate-400"
                disabled={isOrchestrating}
              />
            </div>
            <Button 
              type="submit" 
              className="h-14 px-6 md:px-8 bg-slate-900 hover:bg-indigo-600 text-white font-semibold w-full sm:w-auto shadow-md hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300 hover:-translate-y-0.5 rounded-xl text-base"
              disabled={isOrchestrating || !goal}
            >
              {isOrchestrating ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin text-indigo-200" /> Orchestrating...</>
              ) : (
                <><Sparkles className="mr-2 h-5 w-5 text-emerald-400" /> Generate Plan</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isOrchestrating && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AgentStatusCard title="Planner Agent" status={agentStatus.planner} icon={Target} />
          <AgentStatusCard title="Audience Agent" status={agentStatus.audience} icon={Users} />
          <AgentStatusCard title="Channel Agent" status={agentStatus.channel} icon={Send} />
          <AgentStatusCard title="Copy Agent" status={agentStatus.copy} icon={MessageSquare} />
        </div>
      )}

      {result && !isOrchestrating && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900">Campaign Proposal</h2>
            <Button onClick={launchCampaign} className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
              <Play className="mr-2 h-4 w-4" /> Launch Campaign
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Strategy & Audience */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Strategy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Objective</h4>
                    <p className="text-slate-900">{result.plan.objective}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Approach</h4>
                    <p className="text-slate-900">{result.plan.strategy}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg text-blue-900 text-sm">
                    <strong>AI Rationale:</strong> {result.plan.rationale}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Audience Segment: {result.audience.segmentName}</span>
                    <Badge variant="secondary">{result.audience.size} customers</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 italic">"{result.audience.insights}"</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-md">
                      <p className="text-xs text-slate-500 font-semibold mb-1">Average Spend</p>
                      <p className="font-medium">₹{result.audience.avgSpend}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-md">
                      <p className="text-xs text-slate-500 font-semibold mb-1">Top Cities</p>
                      <p className="font-medium text-sm truncate">{result.audience.topCities.join(", ")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Copy & KPIs */}
            <div className="space-y-6">
              <Card className="border-emerald-200">
                <CardHeader className="bg-emerald-50 rounded-t-xl pb-4">
                  <CardTitle className="text-emerald-900 flex items-center justify-between">
                    Expected KPIs
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Estimated Revenue</span>
                      <span className="font-bold text-emerald-600">₹{result.plan.expectedKPIs.revenueImpact.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Conversion Rate</span>
                      <span className="font-medium">{(result.plan.expectedKPIs.conversionRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Open Rate</span>
                      <span className="font-medium">{(result.plan.expectedKPIs.openRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Message Preview
                    <Badge>{result.channel.channel}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-slate-100 rounded-lg whitespace-pre-wrap text-sm text-slate-800">
                    {result.channel.channel === "WHATSAPP" && result.copy.whatsapp}
                    {result.channel.channel === "SMS" && result.copy.sms}
                    {result.channel.channel === "EMAIL" && (
                      <div className="flex flex-col">
                        <div className="mb-2">
                          <strong>Subj:</strong> {result.copy.emailSubject}
                        </div>
                        <hr className="my-2 border-slate-200" />
                        <div dangerouslySetInnerHTML={{ __html: result.copy.emailBody }} className="prose prose-sm max-w-none prose-p:leading-relaxed" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-3 flex items-start">
                    <Target className="h-4 w-4 mr-1 shrink-0" />
                    Channel selected because: {result.channel.reasoning}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AgentStatusCard({ title, status, icon: Icon }: { title: string, status: "pending" | "running" | "completed", icon: any }) {
  return (
    <Card className={cn(
      "border-2 transition-all duration-500 relative overflow-hidden",
      status === "running" ? "border-indigo-400/50 bg-indigo-50/80 shadow-[0_0_20px_rgba(99,102,241,0.2)] scale-105 z-10" : 
      status === "completed" ? "border-emerald-200 bg-emerald-50/50" : 
      "border-slate-100 bg-white/50 opacity-60"
    )}>
      {status === "running" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite]"></div>
      )}
      <CardContent className="p-4 flex items-center space-x-3 relative z-10">
        <div className={cn(
          "p-2 rounded-xl transition-colors duration-500",
          status === "running" ? "bg-indigo-100 text-indigo-600 shadow-inner" :
          status === "completed" ? "bg-emerald-100 text-emerald-600" :
          "bg-slate-100 text-slate-400"
        )}>
          {status === "running" ? <Loader2 className="h-5 w-5 animate-spin" /> :
           status === "completed" ? <CheckCircle2 className="h-5 w-5" /> :
           <Icon className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <p className={cn("font-bold truncate", status === "running" ? "text-indigo-900" : "text-slate-700")}>{title}</p>
          <p className={cn("text-xs capitalize font-medium", 
            status === "running" ? "text-indigo-500 animate-pulse" : "text-slate-500"
          )}>{status}</p>
        </div>
      </CardContent>
    </Card>
  );
}
