import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, DollarSign, Target, TrendingUp, TrendingDown, Clock, ChevronDown, ChevronUp, Sun, CalendarDays, CalendarRange } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalsDashboardProps {
  className?: string;
}

export function GoalsDashboard({ className }: GoalsDashboardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeGoalPeriod, setActiveGoalPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  // Mock data for different time periods
  const goalData = {
    daily: {
      goal: 2,
      achieved: 1,
      daysInPeriod: 1,
      daysPassed: 0.6, // Assuming it's afternoon
      daysRemaining: 0.4,
      averageGrossPerDeal: 3200,
      totalGross: 3200,
      previousPeriod: { achieved: 3, totalGross: 9600 },
      yearToDate: { goal: 720, achieved: 145, totalGross: 464000 } // 2 per day * 360 working days
    },
    monthly: {
      goal: 30,
      achieved: 17,
      daysInPeriod: 30,
      daysPassed: 12,
      daysRemaining: 18,
      averageGrossPerDeal: 3200,
      totalGross: 54400,
      previousPeriod: { achieved: 28, totalGross: 89600 },
      yearToDate: { goal: 360, achieved: 145, totalGross: 464000 }
    },
    yearly: {
      goal: 360,
      achieved: 145,
      daysInPeriod: 365,
      daysPassed: 120, // Assuming we're 4 months in
      daysRemaining: 245,
      averageGrossPerDeal: 3200,
      totalGross: 464000,
      previousPeriod: { achieved: 320, totalGross: 1024000 },
      yearToDate: { goal: 360, achieved: 145, totalGross: 464000 }
    }
  };

  const currentData = goalData[activeGoalPeriod];

  const calculatePacing = () => {
    const remaining = currentData.goal - currentData.achieved;
    let dailyPace, weeklyPace, periodPace;
    
    if (activeGoalPeriod === 'daily') {
      dailyPace = remaining;
      weeklyPace = remaining * 7;
      periodPace = remaining;
    } else if (activeGoalPeriod === 'monthly') {
      dailyPace = remaining / currentData.daysRemaining;
      weeklyPace = dailyPace * 7;
      periodPace = remaining;
    } else { // yearly
      dailyPace = remaining / currentData.daysRemaining;
      weeklyPace = dailyPace * 7;
      const monthsRemaining = Math.ceil(currentData.daysRemaining / 30);
      periodPace = remaining / monthsRemaining;
    }
    
    return {
      remaining,
      dailyPace: Math.ceil(dailyPace),
      weeklyPace: Math.ceil(weeklyPace),
      periodPace: Math.ceil(periodPace)
    };
  };

  const pacing = calculatePacing();
  const progress = (currentData.achieved / currentData.goal) * 100;
  const comparison = ((currentData.achieved - currentData.previousPeriod.achieved) / currentData.previousPeriod.achieved) * 100;

  const getPeriodLabel = () => {
    switch (activeGoalPeriod) {
      case 'daily': return 'Today';
      case 'monthly': return 'This Month';
      case 'yearly': return 'This Year';
    }
  };

  const getPacingLabel = () => {
    switch (activeGoalPeriod) {
      case 'daily': return 'Hours left';
      case 'monthly': return 'Days left';
      case 'yearly': return 'Days left';
    }
  };

  if (!isExpanded) {
    // Compact view with goal period tabs
    return (
      <Card className={cn("mb-6", className)}>
        <CardContent className="p-4">
          {/* Goal Period Tabs */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setActiveGoalPeriod('daily')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors",
                  activeGoalPeriod === 'daily' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sun className="h-3 w-3" />
                Daily
              </button>
              <button
                onClick={() => setActiveGoalPeriod('monthly')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors",
                  activeGoalPeriod === 'monthly' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CalendarDays className="h-3 w-3" />
                Monthly
              </button>
              <button
                onClick={() => setActiveGoalPeriod('yearly')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors",
                  activeGoalPeriod === 'yearly' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CalendarRange className="h-3 w-3" />
                Yearly
              </button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Compact Goal Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">{getPeriodLabel()} Goal</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{currentData.achieved} / {currentData.goal}</span>
                    <Badge variant={pacing.remaining <= (activeGoalPeriod === 'daily' ? 1 : 5) ? "default" : "secondary"}>
                      {pacing.remaining} to go
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex-1 max-w-xs">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{Math.round(progress)}% complete</span>
                  <span>
                    {activeGoalPeriod === 'daily' 
                      ? `${pacing.dailyPace}/day needed`
                      : activeGoalPeriod === 'monthly'
                      ? `${pacing.dailyPace}/day needed`
                      : `${pacing.periodPace}/month needed`
                    }
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">${currentData.totalGross.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Gross</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Expanded view with full dashboard
  return (
    <Card className={cn("mb-6", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Sales Dashboard - {getPeriodLabel()}
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Goal Period Tabs in Expanded View */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg mr-4">
              <button
                onClick={() => setActiveGoalPeriod('daily')}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors",
                  activeGoalPeriod === 'daily' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sun className="h-3 w-3" />
                Daily
              </button>
              <button
                onClick={() => setActiveGoalPeriod('monthly')}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors",
                  activeGoalPeriod === 'monthly' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CalendarDays className="h-3 w-3" />
                Monthly
              </button>
              <button
                onClick={() => setActiveGoalPeriod('yearly')}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors",
                  activeGoalPeriod === 'yearly' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CalendarRange className="h-3 w-3" />
                Yearly
              </button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Period Overview - Dynamic based on selected period */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{getPeriodLabel()} Progress</span>
                <Badge variant={progress >= 75 ? "default" : progress >= 50 ? "secondary" : "outline"}>
                  {Math.round(progress)}%
                </Badge>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{currentData.achieved} / {currentData.goal} deals</span>
                <span>{pacing.remaining} remaining</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Pacing</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily needed:</span>
                <span className="font-medium">{pacing.dailyPace} deals</span>
              </div>
              {activeGoalPeriod !== 'daily' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weekly needed:</span>
                  <span className="font-medium">{pacing.weeklyPace} deals</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{getPacingLabel()}:</span>
                <span className="font-medium">
                  {activeGoalPeriod === 'daily' 
                    ? `${Math.round(currentData.daysRemaining * 24)} hours`
                    : `${Math.round(currentData.daysRemaining)} days`
                  }
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Revenue</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total gross:</span>
                <span className="font-medium">${currentData.totalGross.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg per deal:</span>
                <span className="font-medium">${currentData.averageGrossPerDeal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Projected:</span>
                <span className="font-medium">
                  ${Math.round((currentData.totalGross / currentData.achieved) * currentData.goal).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Detailed View */}
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monthly">Month-to-Date</TabsTrigger>
            <TabsTrigger value="comparison">Comparisons</TabsTrigger>
            <TabsTrigger value="ytd">Year-to-Date</TabsTrigger>
          </TabsList>
          
          <TabsContent value="monthly" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{getPeriodLabel()} Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Deals Closed</span>
                      <span className="font-semibold">{currentData.achieved}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Goal Progress</span>
                      <span className="font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {activeGoalPeriod === 'daily' ? 'Hours Worked' : 
                         activeGoalPeriod === 'monthly' ? 'Days Worked' : 'Months Worked'}
                      </span>
                      <span className="font-semibold">
                        {activeGoalPeriod === 'daily' ? `${Math.round(currentData.daysPassed * 24)} / 24` :
                         activeGoalPeriod === 'monthly' ? `${Math.round(currentData.daysPassed)} / ${currentData.daysInPeriod}` :
                         `${Math.round(currentData.daysPassed / 30)} / 12`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        Average/{activeGoalPeriod === 'yearly' ? 'Month' : 'Day'}
                      </span>
                      <span className="font-semibold">
                        {activeGoalPeriod === 'yearly' 
                          ? (currentData.achieved / Math.max(1, Math.round(currentData.daysPassed / 30))).toFixed(1)
                          : (currentData.achieved / Math.max(1, Math.round(currentData.daysPassed))).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Gross</span>
                      <span className="font-semibold">${currentData.totalGross.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Highest Deal</span>
                      <span className="font-semibold">$5,200</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Lowest Deal</span>
                      <span className="font-semibold">$1,800</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Goal Revenue</span>
                      <span className="font-semibold">${(currentData.averageGrossPerDeal * currentData.goal).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="comparison" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    Period Comparison
                    {comparison > 0 ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{getPeriodLabel()}</span>
                      <span className="font-semibold">{currentData.achieved} deals</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Previous {activeGoalPeriod === 'daily' ? 'Day' : activeGoalPeriod === 'monthly' ? 'Month' : 'Year'}</span>
                      <span className="font-semibold">{currentData.previousPeriod.achieved} deals</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Difference</span>
                      <Badge variant={comparison > 0 ? "default" : "destructive"}>
                        {comparison > 0 ? '+' : ''}{comparison.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Revenue vs Previous</span>
                      <span className="font-semibold">
                        ${(currentData.totalGross - currentData.previousPeriod.totalGross).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Same Period Last Year</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">This Year</span>
                      <span className="font-semibold">{currentData.achieved} deals</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Year</span>
                      <span className="font-semibold">22 deals</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Growth</span>
                      <Badge variant="default">
                        +{(((currentData.achieved - 22) / 22) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Revenue Growth</span>
                      <span className="font-semibold text-success">+$8,400</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="ytd" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Year-to-Date Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={(currentData.yearToDate.achieved / currentData.yearToDate.goal) * 100} className="h-3" />
                    <div className="flex justify-between text-sm">
                      <span>{currentData.yearToDate.achieved} / {currentData.yearToDate.goal} deals</span>
                      <span>{Math.round((currentData.yearToDate.achieved / currentData.yearToDate.goal) * 100)}% complete</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Average</span>
                      <span className="font-semibold">{(currentData.yearToDate.achieved / 12).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Projected Year-End</span>
                      <span className="font-semibold">{Math.round((currentData.yearToDate.achieved / 12) * 12)} deals</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">YTD Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total YTD Gross</span>
                      <span className="font-semibold">${currentData.yearToDate.totalGross.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average per Deal</span>
                      <span className="font-semibold">${Math.round(currentData.yearToDate.totalGross / currentData.yearToDate.achieved).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Avg Revenue</span>
                      <span className="font-semibold">${Math.round(currentData.yearToDate.totalGross / 12).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Projected Year-End</span>
                      <span className="font-semibold">${Math.round((currentData.yearToDate.totalGross / 12) * 12).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}