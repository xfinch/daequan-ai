'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar';

export default function BroadbandCalculator() {
  const [monthlyUsageGB, setMonthlyUsageGB] = useState<number>(500);
  const [hoursPerDay, setHoursPerDay] = useState<number>(8);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(30);
  
  const [results, setResults] = useState({
    totalMB: 0,
    mbPerDay: 0,
    mbPerHour: 0,
    mbPerSecond: 0,
    mbps: 0
  });

  useEffect(() => {
    calculateBroadband();
  }, [monthlyUsageGB, hoursPerDay, daysPerMonth]);

  const calculateBroadband = () => {
    // Step 1: Convert monthly GB to MB
    // 1 GB = 1024 MB
    const totalMB = monthlyUsageGB * 1024;
    
    // Step 2: Calculate MB per day
    const mbPerDay = totalMB / daysPerMonth;
    
    // Step 3: Calculate MB per hour
    const mbPerHour = mbPerDay / hoursPerDay;
    
    // Step 4: Calculate MB per second
    // 1 hour = 3600 seconds
    const mbPerSecond = mbPerHour / 3600;
    
    // Step 5: Convert MB/s to Mbps
    // 1 MB = 8 megabits (Mb)
    const mbps = mbPerSecond * 8;
    
    setResults({
      totalMB,
      mbPerDay,
      mbPerHour,
      mbPerSecond,
      mbps
    });
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20 px-4 pb-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Broadband Usage Calculator</h1>
            <p className="text-muted-foreground">
              Calculate your actual bandwidth needs based on monthly data usage
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Your Usage</h2>
            
            <div className="space-y-6">
              {/* Monthly Usage */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Monthly Data Usage (GB)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="5000"
                    step="10"
                    value={monthlyUsageGB}
                    onChange={(e) => setMonthlyUsageGB(Number(e.target.value))}
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <input
                    type="number"
                    value={monthlyUsageGB}
                    onChange={(e) => setMonthlyUsageGB(Number(e.target.value))}
                    className="w-24 px-3 py-2 bg-background border border-border rounded-lg text-center"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Typical range: 100-1000 GB for small business
                </p>
              </div>

              {/* Hours Per Day */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Hours of Usage Per Day
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="24"
                    step="1"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(Number(e.target.value))}
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <input
                    type="number"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(Number(e.target.value))}
                    className="w-24 px-3 py-2 bg-background border border-border rounded-lg text-center"
                  />
                </div>
              </div>

              {/* Days Per Month */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Days Per Month
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="31"
                    step="1"
                    value={daysPerMonth}
                    onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <input
                    type="number"
                    value={daysPerMonth}
                    onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                    className="w-24 px-3 py-2 bg-background border border-border rounded-lg text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Calculation Breakdown</h2>
            
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent font-semibold text-sm shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium">Convert to Megabytes</p>
                  <p className="text-sm text-muted-foreground">
                    {monthlyUsageGB} GB × 1,024 = <span className="text-foreground font-medium">{formatNumber(results.totalMB, 0)} MB</span>
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent font-semibold text-sm shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium">Daily Usage</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(results.totalMB, 0)} MB ÷ {daysPerMonth} days = <span className="text-foreground font-medium">{formatNumber(results.mbPerDay, 2)} MB/day</span>
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent font-semibold text-sm shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium">Hourly Usage</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(results.mbPerDay, 2)} MB ÷ {hoursPerDay} hours = <span className="text-foreground font-medium">{formatNumber(results.mbPerHour, 2)} MB/hour</span>
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent font-semibold text-sm shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <p className="font-medium">Per Second Usage</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(results.mbPerHour, 2)} MB ÷ 3,600 seconds = <span className="text-foreground font-medium">{formatNumber(results.mbPerSecond, 3)} MB/second</span>
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent font-semibold text-sm shrink-0">
                  5
                </div>
                <div className="flex-1">
                  <p className="font-medium">Convert to Megabits</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(results.mbPerSecond, 3)} MB × 8 = <span className="text-foreground font-medium">{formatNumber(results.mbps, 2)} Mbps</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Final Answer */}
          <div className="bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Average Bandwidth Need</p>
            <p className="text-5xl font-bold text-accent mb-2">
              {formatNumber(results.mbps, 2)} Mbps
            </p>
            <p className="text-sm text-muted-foreground">
              Based on {monthlyUsageGB} GB/month, {hoursPerDay} hours/day usage
            </p>
          </div>

          {/* Usage Presets */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Presets</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => { setMonthlyUsageGB(100); setHoursPerDay(8); }}
                className="p-3 bg-card border border-border rounded-lg hover:border-accent/50 transition-colors text-sm"
              >
                <span className="font-medium">Light</span>
                <span className="block text-xs text-muted-foreground">100 GB/mo</span>
              </button>
              <button
                onClick={() => { setMonthlyUsageGB(500); setHoursPerDay(8); }}
                className="p-3 bg-card border border-border rounded-lg hover:border-accent/50 transition-colors text-sm"
              >
                <span className="font-medium">Standard</span>
                <span className="block text-xs text-muted-foreground">500 GB/mo</span>
              </button>
              <button
                onClick={() => { setMonthlyUsageGB(1000); setHoursPerDay(10); }}
                className="p-3 bg-card border border-border rounded-lg hover:border-accent/50 transition-colors text-sm"
              >
                <span className="font-medium">Heavy</span>
                <span className="block text-xs text-muted-foreground">1 TB/mo</span>
              </button>
              <button
                onClick={() => { setMonthlyUsageGB(2500); setHoursPerDay(12); }}
                className="p-3 bg-card border border-border rounded-lg hover:border-accent/50 transition-colors text-sm"
              >
                <span className="font-medium">Enterprise</span>
                <span className="block text-xs text-muted-foreground">2.5 TB/mo</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Note for Sales Conversations:</p>
            <p>
              This calculation shows average sustained bandwidth needs. For business applications, 
              recommend 2-3x this number to account for peak usage, multiple users, and overhead. 
              Example: If calculation shows 5 Mbps, recommend 15-25 Mbps service.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
