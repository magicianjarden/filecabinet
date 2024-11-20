'use client';

import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Activity,
  Clock,
  Users,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConversionStats } from '@/types/stats';

interface ConversionTrendsProps {
  stats: ConversionStats;
}

export function ConversionTrends({ stats }: ConversionTrendsProps) {
  const chartData = stats.totalConversions === 0 ? [
    { name: 'No data', value: 0 }
  ] : Object.entries(stats.hourlyActivity).map(([hour, count]) => ({
    name: `${hour}:00`,
    value: count
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 border border-slate-200 bg-white/50">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg shrink-0">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">
                Total Conversions
              </p>
              <div className="flex items-center gap-1.5">
                <p className="text-lg sm:text-2xl font-bold text-slate-900">
                  {stats.totalConversions.toLocaleString()}
                </p>
                <span className="flex items-center text-xs font-medium text-green-600">
                  <ArrowUpIcon className="w-3 h-3" />
                  {stats.conversionRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 border border-slate-200 bg-white/50">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">
                Average Time
              </p>
              <div className="flex items-center gap-1.5">
                <p className="text-lg sm:text-2xl font-bold text-slate-900">2.3s</p>
                <span className="flex items-center text-xs font-medium text-green-600">
                  <ArrowDownIcon className="w-3 h-3" />
                  8%
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 border border-slate-200 bg-white/50">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">
                Active Users
              </p>
              <div className="flex items-center gap-1.5">
                <p className="text-lg sm:text-2xl font-bold text-slate-900">89</p>
                <span className="flex items-center text-xs font-medium text-green-600">
                  <ArrowUpIcon className="w-3 h-3" />
                  24%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-3 sm:p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Conversion Activity</h3>
          <Select defaultValue="week">
            <SelectTrigger className="w-full sm:w-[180px] h-8 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="h-[200px] sm:h-[300px] -mx-3 sm:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getDummyData()}>
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8"
                fontSize={10}
                tickMargin={8}
                axisLine={false}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="conversions" 
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function getDummyData() {
  return [
    { name: 'Mon', conversions: 120 },
    { name: 'Tue', conversions: 132 },
    { name: 'Wed', conversions: 145 },
    { name: 'Thu', conversions: 134 },
    { name: 'Fri', conversions: 156 },
    { name: 'Sat', conversions: 139 },
    { name: 'Sun', conversions: 142 },
  ];
} 