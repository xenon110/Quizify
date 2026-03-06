
'use client';

import {
    Activity,
    BookCheck,
    BarChart,
    FileText,
    Flame,
    Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PerformanceChart } from "./performance-chart";
import { RecentExams } from "./recent-exams";
import { AvailableExams } from "./available-exams";
import { useExams, Exam } from "@/hooks/use-exams";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

type DashboardProps = {
    userName: string;
}

export function Dashboard({ userName }: DashboardProps) {
    const { exams, getAnswers } = useExams();
    const { user } = useAuth();
    const [allScores, setAllScores] = useState<number[]>([]);

    const completedExams = useMemo(() => exams.filter(exam => exam.status === 'Completed'), [exams]);

    useEffect(() => {
        if (!user) {
            setAllScores([]);
            return;
        }

        const scores = completedExams.map(exam => {
            const answers = getAnswers(exam.id);
            let correctCount = 0;
            exam.questions.forEach((q, index) => {
                if (q.correctAnswer && answers[index] && q.correctAnswer.trim().toLowerCase() === answers[index].trim().toLowerCase()) {
                    correctCount++;
                }
            });
            return exam.questions.length > 0 ? (correctCount / exam.questions.length) * 100 : 0;
        });
        setAllScores(scores);
    }, [completedExams, getAnswers, user]);

    const bestScore = useMemo(() => {
        if (allScores.length === 0) return 0;
        return Math.max(...allScores);
    }, [allScores]);
    
    const consistencyStreak = useMemo(() => {
         if (completedExams.length === 0) return 0;
        
        const completionDates = [...new Set(completedExams.map(exam => {
            const date = new Date(parseInt(exam.id.split('-')[1]));
            return date.setHours(0, 0, 0, 0); // Normalize to the start of the day
        }))].sort((a, b) => b - a);

        if (completionDates.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if the most recent exam was today or yesterday
        if (completionDates[0] === today.getTime() || completionDates[0] === today.getTime() - 86400000) {
            streak = 1;
        } else {
            return 0; // Streak is broken
        }

        for (let i = 0; i < completionDates.length - 1; i++) {
            const currentDay = new Date(completionDates[i]);
            const nextDay = new Date(completionDates[i+1]);
            
            const expectedNextDay = new Date(currentDay);
            expectedNextDay.setDate(currentDay.getDate() - 1);

            if (nextDay.getTime() === expectedNextDay.getTime()) {
                streak++;
            } else {
                break; // Streak is broken
            }
        }
        return streak;
    }, [completedExams]);

    
    return (
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-muted/20 min-h-full">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Welcome back, {userName}!</h1>
                <p className="text-muted-foreground text-sm sm:text-base">Ready to continue your learning journey?</p>
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Link href="/upload" className="transform transition-transform duration-300 hover:scale-105">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">PDFs Uploaded</CardTitle>
                            <FileText className="h-4 w-4 text-blue-100" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{exams.length}</div>
                            <p className="text-xs text-blue-200">PDFs converted into tests</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/exams" className="transform transition-transform duration-300 hover:scale-105">
                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
                            <BookCheck className="h-4 w-4 text-green-100" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{completedExams.length}</div>
                            <p className="text-xs text-green-200">How many full tests were finished</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/exams" className="transform transition-transform duration-300 hover:scale-105">
                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
                            <Trophy className="h-4 w-4 text-purple-100" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{bestScore.toFixed(2)}%</div>
                            <p className="text-xs text-purple-200">Your highest score in a test</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/exams" className="transform transition-transform duration-300 hover:scale-105">
                    <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Consistency Streak</CardTitle>
                            <Flame className="h-4 w-4 text-orange-100" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{consistencyStreak} {consistencyStreak === 1 ? 'day' : 'days'}</div>
                            <p className="text-xs text-orange-200">Consecutive days of study</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <PerformanceChart />
                </div>
                <div className="lg:col-span-1">
                    <AvailableExams />
                </div>
            </div>
            <div className="mt-6">
                <RecentExams />
            </div>
        </main>
    )
}
