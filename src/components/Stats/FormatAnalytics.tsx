'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileType } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface FormatAnalyticsProps {
  popularConversions: Array<{
    from: string;
    to: string;
    count: number;
  }>;
}

export function FormatAnalytics({ popularConversions }: FormatAnalyticsProps) {
  const total = popularConversions.reduce((sum, conv) => sum + conv.count, 0);

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="flex items-center space-x-2">
          <FileType className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-medium">Popular Conversions</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Count</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {popularConversions
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map((conversion, index) => {
                const percentage = (conversion.count / total) * 100;
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {conversion.from.toUpperCase()}
                    </TableCell>
                    <TableCell>{conversion.to.toUpperCase()}</TableCell>
                    <TableCell>{conversion.count.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {percentage.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 