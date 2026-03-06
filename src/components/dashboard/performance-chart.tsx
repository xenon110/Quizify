
'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig
} from '@/components/ui/chart';
import { useExams } from '@/hooks/use-exams';
import { Info, Loader2 } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

const chartConfig = {
  score: {
    label: 'Score',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function PerformanceChart() {
  const { exams, getAnswers } = useExams();
  const [chartData, setChartData] = useState<{ name: string; score: number }[]>([]);

  const completedExams = useMemo(() => exams.filter(exam => exam.status === 'Completed'), [exams]);

  useEffect(() => {
    if (completedExams.length > 0) {
      const data = completedExams.map((exam, index) => {
        const answers = getAnswers(exam.id);
        
        let correctCount = 0;
        exam.questions.forEach((q, i) => {
          if (q.correctAnswer && answers[i] && q.correctAnswer.trim().toLowerCase() === answers[i].trim().toLowerCase()) {
            correctCount++;
          }
        });
        const scorePercentage = exam.questions.length > 0 ? (correctCount / exam.questions.length) * 100 : 0;
        
        return {
          name: `Exam ${index + 1}`,
          score: parseFloat(scorePercentage.toFixed(2)),
        };
      });
      setChartData(data);
    } else {
      setChartData([]);
    }
  }, [completedExams, getAnswers]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trend</CardTitle>
        <CardDescription>Your exam scores over time.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer>
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  unit="%"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[0, 100]}
                />
                <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                <Line
                  dataKey="score"
                  type="monotone"
                  stroke="var(--color-score)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--color-score)",
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[250px] text-center border-2 border-dashed rounded-lg">
             <Info className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-muted-foreground">No Performance Data</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete an exam to see your performance trend.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
