'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileType } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface FormatAnalyticsProps {
  popularConversions: Array<{
    from: string;
    to: string;
    count: number;
  }>;
  isLoading?: boolean;
}

export function FormatAnalytics({ popularConversions, isLoading }: FormatAnalyticsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Popular Formats</CardTitle>
          <FileType className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalConversions = popularConversions.reduce((sum, conv) => sum + conv.count, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Popular Formats</CardTitle>
        <FileType className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {popularConversions.map((conversion, index) => {
          const percentage = (conversion.count / totalConversions) * 100;
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {conversion.from.toUpperCase()} → {conversion.to.toUpperCase()}
                  </span>
                  <span className="text-muted-foreground">
                    ({conversion.count} conversions)
                  </span>
                </div>
                <span className="font-medium">{percentage.toFixed(1)}%</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
} 