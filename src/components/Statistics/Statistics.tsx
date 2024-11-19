'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatFileSize } from '../../lib/utils/format';

interface StatisticsProps {
  totalConversions: number;
  totalSize: number;
  averageTime: number;
  conversionRate: number;
  conversionTimes: number[];
}

export function Statistics({
  totalConversions,
  totalSize,
  averageTime,
  conversionRate,
  conversionTimes
}: StatisticsProps) {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Conversion Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Conversions</p>
            <p className="text-2xl font-bold">{totalConversions}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Size Processed</p>
            <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Time</p>
            <p className="text-2xl font-bold">{averageTime.toFixed(2)}s</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-2xl font-bold">{conversionRate}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 