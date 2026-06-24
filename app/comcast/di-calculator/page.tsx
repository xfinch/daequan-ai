'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar';

export default function DICalculator() {
  const [monthlyGB, setMonthlyGB] = useState<number>(1300);
  const [hoursPerDay, setHoursPerDay] = useState<number>(10);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(22);
  const [peakMultiplier, setPeakMultiplier] = useState<number>(5);
  
  const [results, setResults] = useState({
    totalMB: 0,
    mbPerDay: 0,
    mbPerHour: 0,
    mbPerSecond: 0,
    avgMbps: 0,
    peakMbps: 0,
    recommendedTier: '100/100 Mbps'
  });

  useEffect(() => {
    calculate();
  }, [monthlyGB, hoursPerDay, daysPerMonth, peakMultiplier]);

  const calculate = () => {
    const totalMB = monthlyGB * 1024;
    const mbPerDay = totalMB / daysPerMonth;
    const mbPerHour = mbPerDay / hoursPerDay;
    const mbPerSecond = mbPerHour / 3600;
    const avgMbps = mbPerSecond * 8;
    const peakMbps = avgMbps * peakMultiplier;

    setResults({
      totalMB,
      mbPerDay,
      mbPerHour,
      mbPerSecond,
      avgMbps,
      peakMbps,
      recommendedTier: getRecommendedTier(peakMbps)
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

  const formatNumber = (num: number, decimals: number = 0) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const setPreset = (gb: number, hours: number, days: number) => {
    setMonthlyGB(gb);
    setHoursPerDay(hours);
    setDaysPerMonth(days);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20 px-4 pb-12">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold mb-1">🎯 DI Calculator</h1>
            <p className="text-sm text-muted-foreground">
              From usage data to recommended tier
            </p>
          </div>

          {/* Inputs */}
          <div className="bg-card border border-border rounded-xl p-5 mb-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Monthly Usage (GB)
                  <span className="text-xs text-muted-foreground font-normal ml-1">— from Internet diagnostics</span>
                </label>
                <input
                  type="number"
                  value={monthlyGB}
                  onChange={(e) => setMonthlyGB(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-center font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Business Hours/Day
                  <span className="text-xs text-muted-foreground font-normal ml-1">— hours they're actually open</span>
                </label>
                <input
                  type="number"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-center font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Business Days/Month
                  <span className="text-xs text-muted-foreground font-normal ml-1">— check daily graph, not 30</span>
                </label>
                <input
                  type="number"
                  value={daysPerMonth}
                  onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-center font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Peak Multiplier
                  <span className="text-xs text-muted-foreground font-normal ml-1">— 4-5x (when everyone's online)</span>
                </label>
                <select
                  value={peakMultiplier}
                  onChange={(e) => setPeakMultiplier(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-center font-semibold"
                >
                  <option value={4}>4x (Conservative)</option>
                  <option value={5}>5x (Standard)</option>
                </select>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              <button
                onClick={() => setPreset(100, 8, 22)}
                className="p-2 bg-muted border border-border rounded-lg text-xs hover:border-accent/50 transition-colors"
              >
                <span className="font-semibold block">Light</span>
                <span className="text-muted-foreground">100GB</span>
              </button>
              <button
                onClick={() => setPreset(500, 8, 22)}
                className="p-2 bg-muted border border-border rounded-lg text-xs hover:border-accent/50 transition-colors"
              >
                <span className="font-semibold block">Std</span>
                <span className="text-muted-foreground">500GB</span>
              </button>
              <button
                onClick={() => setPreset(1300, 10, 22)}
                className="p-2 bg-muted border border-border rounded-lg text-xs hover:border-accent/50 transition-colors"
              >
                <span className="font-semibold block">Cafe</span>
                <span className="text-muted-foreground">1.3TB</span>
              </button>
              <button
                onClick={() => setPreset(2500, 12, 26)}
                className="p-2 bg-muted border border-border rounded-lg text-xs hover:border-accent/50 transition-colors"
              >
                <span className="font-semibold block">Heavy</span>
                <span className="text-muted-foreground">2.5TB</span>
              </button>
            </div>
          </div>

          {/* Result */}
          <div className="bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 rounded-xl p-6 text-center mb-4">
            <p className="text-sm text-muted-foreground mb-1">Recommended DI Tier</p>
            <p className="text-4xl font-bold text-accent mb-1">
              {results.recommendedTier}
            </p>
            <p className="text-sm text-muted-foreground">
              Peak: {formatNumber(results.peakMbps, 0)} Mbps (rounded up)
            </p>
          </div>

          {/* Math Breakdown */}
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold mb-2">Math Breakdown:</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{formatNumber(monthlyGB, 0)} GB × 1,024 = <span className="text-foreground font-medium">{formatNumber(results.totalMB, 0)}</span> MB</p>
              <p>÷ {daysPerMonth} days = <span className="text-foreground font-medium">{formatNumber(results.mbPerDay, 0)}</span> MB/day</p>
              <p>÷ {hoursPerDay} hrs = <span className="text-foreground font-medium">{formatNumber(results.mbPerHour, 0)}</span> MB/hr</p>
              <p>÷ 3,600 sec = <span className="text-foreground font-medium">{formatNumber(results.mbPerSecond, 2)}</span> MB/s</p>
              <p>× 8 = <span className="text-foreground font-medium">{formatNumber(results.avgMbps, 1)}</span> Mbps average</p>
              <p>× {peakMultiplier} = <span className="text-foreground font-medium">{formatNumber(results.peakMbps, 1)}</span> Mbps peak</p>
            </div>
          </div>

          {/* Validation */}
          <div className="bg-blue-500/10 border-l-4 border-blue-500 rounded-r-xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-blue-600 mb-2">✓ Validation Check</h3>
            <p className="text-sm text-muted-foreground mb-2">
              "Your peak is ~{formatNumber(results.peakMbps, 0)} Mbps. Let's verify device count:"
            </p>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span>Security cameras</span> <span className="text-muted-foreground">___ × 2-4 Mbps</span></div>
              <div className="flex justify-between"><span>Computers/employees</span> <span className="text-muted-foreground">___ × 1-2 Mbps</span></div>
              <div className="flex justify-between"><span>Guest WiFi devices</span> <span className="text-muted-foreground">___</span></div>
              <div className="flex justify-between"><span>Streaming TVs</span> <span className="text-muted-foreground">___ × 5-10 Mbps</span></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">
              If devices don't match → investigate secondary internet or usage patterns
            </p>
          </div>

          {/* Sales Script */}
          <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl p-4">
            <p className="text-sm font-semibold text-amber-700 mb-1">💬 Sales Script:</p>
            <p className="text-sm text-muted-foreground">
              "I use a formula that gives us a good idea — it's not an exact science. We take your data usage, 
              estimate your peak, then compare that to what we observe in your business. This helps us narrow 
              down the right tier for you."
            </p>
          </div>
        </div>
      </div>
    </>
  );
}