'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar';

export default function BroadbandCalculator() {
  const [monthlyUsageGB, setMonthlyUsageGB] = useState<number>(1300);
  const [hoursPerDay, setHoursPerDay] = useState<number>(10);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(22);
  const [peakMultiplier, setPeakMultiplier] = useState<number>(5);
  
  const [results, setResults] = useState({
    totalMB: 0,
    mbPerDay: 0,
    mbPerHour: 0,
    mbPerSecond: 0,
    mbps: 0,
    peakMbps: 0,
    recommendedTier: ''
  });

  useEffect(() => {
    calculateBroadband();
  }, [monthlyUsageGB, hoursPerDay, daysPerMonth, peakMultiplier]);

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
    
    // Step 6: Calculate peak usage (4-5x average)
    const peakMbps = mbps * peakMultiplier;
    
    // Step 7: Determine recommended tier
    const recommendedTier = getRecommendedTier(peakMbps);
    
    setResults({
      totalMB,
      mbPerDay,
      mbPerHour,
      mbPerSecond,
      mbps,
      peakMbps,
      recommendedTier
    });
  };

  const getRecommendedTier = (peakMbps: number): string => {
    if (peakMbps <= 25) return '25/25 Mbps';
    if (peakMbps <= 50) return '50/50 Mbps';
    if (peakMbps <= 100) return '100/100 Mbps';
    if (peakMbps <= 200) return '200/200 Mbps';
    if (peakMbps <= 500) return '500/500 Mbps';
    return '1 Gbps/1 Gbps';
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
            <h1 className="text-3xl font-bold mb-2">DI Sales Calculator</h1>
            <p className="text-muted-foreground">
              Comcast methodology: From usage data to recommended tier
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
                  Business Days Per Month
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
                <p className="text-xs text-muted-foreground mt-1">
                  Check daily graph to see actual business days
                </p>
              </div>

              {/* Peak Multiplier */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Peak Multiplier (4-5x)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="4"
                    max="5"
                    step="1"
                    value={peakMultiplier}
                    onChange={(e) => setPeakMultiplier(Number(e.target.value))}
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <input
                    type="number"
                    value={peakMultiplier}
                    onChange={(e) => setPeakMultiplier(Number(e.target.value))}
                    className="w-24 px-3 py-2 bg-background border border-border rounded-lg text-center"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Peak = 4-5x average (when all employees + guests are online)
                </p>
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
                    {formatNumber(results.mbPerSecond, 3)} MB × 8 = <span className="text-foreground font-medium">{formatNumber(results.mbps, 2)} Mbps average</span>
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent font-semibold text-sm shrink-0">
                  6
                </div>
                <div className="flex-1">
                  <p className="font-medium">Calculate Peak Usage</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(results.mbps, 2)} Mbps × {peakMultiplier} = <span className="text-foreground font-medium">{formatNumber(results.peakMbps, 2)} Mbps peak</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Final Answer */}
          <div className="bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">Recommended DI Tier</p>
            <p className="text-5xl font-bold text-accent mb-2">
              {results.recommendedTier}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Peak: {formatNumber(results.peakMbps, 2)} Mbps (rounded up)
            </p>
            <p className="text-xs text-muted-foreground">
              Based on {monthlyUsageGB} GB/mo, {hoursPerDay} hrs/day, {daysPerMonth} days/mo
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

          {/* Validation Section */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Validation Check (During Site Visit):</p>
            <p className="mb-2">
              "Your peak is ~{formatNumber(results.peakMbps, 0)} Mbps. Let's verify: How many devices do you have?"
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Cameras: ___ × 2-4 Mbps each</li>
              <li>Computers: ___ × 1-2 Mbps each</li>
              <li>Guest WiFi devices: ___</li>
              <li>Streaming TVs: ___ × 5-10 Mbps each</li>
            </ul>
            <p className="mt-2 text-xs italic">
              If device count doesn't match the calculation → investigate secondary internet accounts or usage patterns.
            </p>
          </div>

          {/* Sales Methodology */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm">
            <p className="font-medium text-foreground mb-2">Sales Approach:</p>
            <p className="text-muted-foreground mb-2">
              "I use a formula that gives us a good idea — it's not an exact science. We take your data usage, 
              estimate your peak, then compare that to what we observe in your business."
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Key principle:</strong> Sell from justification, not greed. Show them where they are and where they need to be.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
