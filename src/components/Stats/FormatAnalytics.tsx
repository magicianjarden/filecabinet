'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileType } from "lucide-react"
import { Skeleton } from "../ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FormatAnalyticsProps {
  popularConversions: Array<{
    from: string;
    to: string;
    count: number;
  }>;
  isLoading?: boolean;
}

export function FormatAnalytics({ popularConversions, isLoading }: FormatAnalyticsProps) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const total = popularConversions.length;
  const totalPages = Math.ceil(total / itemsPerPage);

  const paginatedConversions = popularConversions
    .sort((a, b) => b.count - a.count)
    .slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Popular Conversions
          </CardTitle>
          <FileType className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Popular Conversions
        </CardTitle>
        <FileType className="h-4 w-4 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">
          Showing {paginatedConversions.length} of {total}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[600px] sm:min-w-full p-4 sm:p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedConversions.map((conversion, index) => {
                  const percentage = (conversion.count / total) * 100;
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {conversion.from.toUpperCase()}
                      </TableCell>
                      <TableCell>{conversion.to.toUpperCase()}</TableCell>
                      <TableCell className="w-[40%]">
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="h-2" />
                          <span className="text-sm text-muted-foreground w-12">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {conversion.count.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-2 px-4 sm:px-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 