'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { HardDrive } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export interface SizeAnalyticsProps {
  bySize: Record<string, number>;
  totalSize: number;
  isLoading?: boolean;
}

export function SizeAnalytics({ bySize, totalSize, isLoading }: SizeAnalyticsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Size Distribution</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const total = Object.values(bySize).reduce((sum, count) => sum + count, 0);
  const sortedSizes = Object.entries(bySize)
    .sort((a, b) => {
      const sizes = ['< 1MB', '1-5MB', '5-10MB', '10-50MB', '> 50MB'];
      return sizes.indexOf(a[0]) - sizes.indexOf(b[0]);
    });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Size Distribution</CardTitle>
        <HardDrive className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedSizes.map(([size, count]) => {
          const percentage = (count / total) * 100;
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
      </CardContent>
    </Card>
  );
} 