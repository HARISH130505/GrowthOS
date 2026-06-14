"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface Customer {
  id: string;
  name: string;
  email: string;
  city: string | null;
  totalSpent: number;
  lastPurchaseDate: string | null;
  preferredChannel: string;
}

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<{ data: Customer[]; meta: any }>({
    queryKey: ["customers", page],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/customers?page=${page}&limit=20`);
      return res.json();
    },
  });

  const filteredCustomers = data?.data.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Customers</h1>
          <p className="text-slate-500 mt-1">
            Total of {data?.meta?.total?.toLocaleString() || "..."} profiles synced from your platform.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 w-full"
            />
          </div>
          <Badge variant="outline" className="text-slate-500 shrink-0">
            <Filter className="w-3 h-3 mr-1" />
            Filtered View
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/80">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">City</th>
                  <th className="px-6 py-4 font-medium">Total Spend</th>
                  <th className="px-6 py-4 font-medium">Last Purchase</th>
                  <th className="px-6 py-4 font-medium">Pref. Channel</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded animate-pulse w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded animate-pulse w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded animate-pulse w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded animate-pulse w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded animate-pulse w-20"></div></td>
                    </tr>
                  ))
                ) : (
                  filteredCustomers?.map((customer) => (
                    <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{customer.name}</div>
                        <div className="text-xs text-slate-500">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{customer.city || "-"}</td>
                      <td className="px-6 py-4 font-medium text-emerald-600">₹{customer.totalSpent.toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {customer.lastPurchaseDate 
                          ? new Date(customer.lastPurchaseDate).toLocaleDateString('en-IN')
                          : "Never"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {customer.preferredChannel}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
