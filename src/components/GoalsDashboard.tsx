import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, DollarSign, Target, TrendingUp, TrendingDown, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalsDashboardProps {
  className?: string;
}

export function GoalsDashboard({ className }: GoalsDashboardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock data - in real app this would come from your CRM/sales data
  const currentMonth = {
    goal: 30,
    achieved: 17,
    daysInMonth: 30,
    daysPassed: 12,
    daysRemaining: 18,
    averageGrossPerDeal: 3200,
    totalGross: 54400
  };

  const lastMonth = {
    achieved: 28,
    totalGross: 89600
  };

  const yearToDate = {
    goal: 360, // 30 per month * 12 months
    achieved: 145,
    totalGross: 464000
  };

  const calculatePacing = () => {
    const remaining = currentMonth.goal - currentMonth.achieved;
    const dailyPace = remaining / currentMonth.daysRemaining;
    const weeklyPace = dailyPace * 7;
    
    return {
      remaining,
      dailyPace: Math.ceil(dailyPace),
      weeklyPace: Math.ceil(weeklyPace)
    };
  };

  const pacing = calculatePacing();
  const monthProgress = (currentMonth.achieved / currentMonth.goal) * 100;
  const ytdProgress = (yearToDate.achieved / yearToDate.goal) * 100;
  const monthComparison = ((currentMonth.achieved - lastMonth.achieved) / lastMonth.achieved) * 100;

  if (!isExpanded) {
    // Compact view
    return (
      <Card className={cn("mb-6", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">Monthly Goal</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{currentMonth.achieved} / {currentMonth.goal}</span>
                    <Badge variant={pacing.remaining <= 5 ? "default" : "secondary"}>
                      {pacing.remaining} to go
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex-1 max-w-xs">
                <Progress value={monthProgress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{Math.round(monthProgress)}% complete</span>
                  <span>{pacing.dailyPace}/day needed</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">${currentMonth.totalGross.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Gross</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="ml-4"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
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
            Sales Dashboard
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Month Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Monthly Progress</span>
                <Badge variant={monthProgress >= 75 ? "default" : monthProgress >= 50 ? "secondary" : "outline"}>
                  {Math.round(monthProgress)}%
                </Badge>
              </div>
              <Progress value={monthProgress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{currentMonth.achieved} / {currentMonth.goal} deals</span>
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weekly needed:</span>
                <span className="font-medium">{pacing.weeklyPace} deals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days remaining:</span>
                <span className="font-medium">{currentMonth.daysRemaining} days</span>
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
                <span className="font-medium">${currentMonth.totalGross.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg per deal:</span>
                <span className="font-medium">${currentMonth.averageGrossPerDeal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Projected:</span>
                <span className="font-medium">${Math.round((currentMonth.totalGross / currentMonth.achieved) * currentMonth.goal).toLocaleString()}</span>
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
                  <CardTitle className="text-base">This Month Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Deals Closed</span>
                      <span className="font-semibold">{currentMonth.achieved}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Goal Progress</span>
                      <span className="font-semibold">{Math.round(monthProgress)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Days Worked</span>
                      <span className="font-semibold">{currentMonth.daysPassed} / {currentMonth.daysInMonth}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average/Day</span>
                      <span className="font-semibold">{(currentMonth.achieved / currentMonth.daysPassed).toFixed(1)}</span>
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
                      <span className="font-semibold">${currentMonth.totalGross.toLocaleString()}</span>
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
                      <span className="font-semibold">${(currentMonth.averageGrossPerDeal * currentMonth.goal).toLocaleString()}</span>
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
                    Month over Month
                    {monthComparison > 0 ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">This Month</span>
                      <span className="font-semibold">{currentMonth.achieved} deals</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Month</span>
                      <span className="font-semibold">{lastMonth.achieved} deals</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Difference</span>
                      <Badge variant={monthComparison > 0 ? "default" : "destructive"}>
                        {monthComparison > 0 ? '+' : ''}{monthComparison.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Revenue vs Last</span>
                      <span className="font-semibold">${(currentMonth.totalGross - lastMonth.totalGross).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Same Month Last Year</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">This Year</span>
                      <span className="font-semibold">{currentMonth.achieved} deals</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Year</span>
                      <span className="font-semibold">22 deals</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Growth</span>
                      <Badge variant="default">
                        +{(((currentMonth.achieved - 22) / 22) * 100).toFixed(1)}%
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
                    <Progress value={ytdProgress} className="h-3" />
                    <div className="flex justify-between text-sm">
                      <span>{yearToDate.achieved} / {yearToDate.goal} deals</span>
                      <span>{Math.round(ytdProgress)}% complete</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Average</span>
                      <span className="font-semibold">{(yearToDate.achieved / 12).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Projected Year-End</span>
                      <span className="font-semibold">{Math.round((yearToDate.achieved / 12) * 12)} deals</span>
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
                      <span className="font-semibold">${yearToDate.totalGross.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average per Deal</span>
                      <span className="font-semibold">${Math.round(yearToDate.totalGross / yearToDate.achieved).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Avg Revenue</span>
                      <span className="font-semibold">${Math.round(yearToDate.totalGross / 12).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Projected Year-End</span>
                      <span className="font-semibold">${Math.round((yearToDate.totalGross / 12) * 12).toLocaleString()}</span>
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