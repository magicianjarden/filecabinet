'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { HardDrive, ArrowUpFromLine, ArrowDownFromLine } from "lucide-react"
import { formatFileSize } from "@/lib/utils/format"
import { Skeleton } from "../ui/skeleton";

export interface SizeAnalyticsProps {
  bySize: Record<string, number>;
  totalSize: number;
  isLoading?: boolean;
}

export function SizeAnalytics({ bySize, totalSize, isLoading }: SizeAnalyticsProps) {
  const total = Object.values(bySize || {}).reduce((sum, count) => sum + count, 0);
  const sortedSizes = Object.entries(bySize || {})
    .sort((a, b) => {
      const sizes = ['< 1MB', '1-5MB', '5-10MB', '10-50MB', '> 50MB'];
      return sizes.indexOf(a[0]) - sizes.indexOf(b[0]);
    });

  // Add null checks and default values
  const mostCommon = sortedSizes.length > 0 
    ? [...sortedSizes].sort((a, b) => b[1] - a[1])[0] 
    : ['No data', 0];
    
  const leastCommon = sortedSizes.length > 0
    ? [...sortedSizes].sort((a, b) => a[1] - b[1])[0]
    : ['No data', 0];

  // Only show top 5 size categories
  const topSizes = Object.entries(bySize || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const otherSizes = Object.entries(bySize || {})
    .sort((a, b) => b[1] - a[1])
    .slice(5)
    .reduce((sum, [_, count]) => sum + count, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Size Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Processed
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
          </CardContent>
        </Card>

        {/* Most Common Size Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Common
            </CardTitle>
            <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostCommon[0]}</div>
            <p className="text-xs text-muted-foreground">
              {mostCommon[1].toLocaleString()} files
            </p>
          </CardContent>
        </Card>

        {/* Least Common Size Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Least Common
            </CardTitle>
            <ArrowDownFromLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leastCommon[0]}</div>
            <p className="text-xs text-muted-foreground">
              {leastCommon[1].toLocaleString()} files
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Size Distribution Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Size Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {topSizes.map(([size, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            
            return (
              <div key={size} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{size}</span>
                    <span className="text-muted-foreground">
                      ({count.toLocaleString()} files)
                    </span>
                  </div>
                  <span className="font-medium">{percentage.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2" 
                />
              </div>
            );
          })}
          
          {otherSizes > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Other</span>
                  <span className="text-muted-foreground">
                    ({otherSizes.toLocaleString()} files)
                  </span>
                </div>
                <span className="font-medium">
                  {((otherSizes / total) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={(otherSizes / total) * 100} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 