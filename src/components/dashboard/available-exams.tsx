
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowRight, Info, Book, Brain, Atom } from "lucide-react";
import Link from "next/link";
import { useExams, Exam } from "@/hooks/use-exams";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

const getSubjectMeta = (subject: string) => {
    const lowerSubject = subject.toLowerCase();
    if (lowerSubject.includes('math')) {
        return { icon: <Brain className="h-8 w-8 text-blue-500" />, color: 'from-blue-500/10' };
    }
    if (lowerSubject.includes('science')) {
        return { icon: <Atom className="h-8 w-8 text-green-500" />, color: 'from-green-500/10' };
    }
    return { icon: <Book className="h-8 w-8 text-purple-500" />, color: 'from-purple-500/10' };
}


export function AvailableExams() {
    const { exams } = useExams();
    const [availableExams, setAvailableExams] = useState<Exam[]>([]);

    useEffect(() => {
        const uncompletedExams = exams.filter(exam => exam.status !== 'Completed');
        const shuffled = [...uncompletedExams].sort(() => 0.5 - Math.random());
        setAvailableExams(shuffled.slice(0, 2));
    }, [exams]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Available Exams</CardTitle>
                <CardDescription>Challenge yourself with one of these exams.</CardDescription>
            </CardHeader>
            <CardContent>
                {availableExams.length > 0 ? (
                    <div className="space-y-4">
                        {availableExams.map((exam) => {
                             const subjectMeta = getSubjectMeta(exam.subject);
                             return (
                                <div key={exam.id} className={`p-4 rounded-lg border bg-gradient-to-br ${subjectMeta.color} to-transparent`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {subjectMeta.icon}
                                            <div>
                                                <h4 className="font-semibold text-base">{exam.title}</h4>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                    <Badge variant="outline">{exam.subject}</Badge>
                                                    <Badge variant="outline">{exam.difficulty}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <Button asChild size="sm">
                                            <Link href={`/exam/${exam.id}`}>
                                                Start <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8 border-2 border-dashed rounded-lg">
                         <Info className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium text-muted-foreground">No Exams Available</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Upload a PDF to create your first exam.
                        </p>
                         <Button asChild className="mt-4">
                            <Link href="/upload">Upload PDF</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
