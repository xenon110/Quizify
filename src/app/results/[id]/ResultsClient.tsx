
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useExams } from '@/hooks/use-exams';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, HelpCircle, Loader2, Sparkles, Home } from 'lucide-react';
import { generateAnswerExplanation } from '@/ai/flows/generate-answer-explanations';
import { Progress } from '@/components/ui/progress';
import { AppHeader } from '@/components/layout/app-header';

export default function ResultsClient({ examId }: { examId: string }) {
  const router = useRouter();
  const { getExamById, getAnswers, loading: examsLoading } = useExams();
  const { user } = useAuth();
  
  const exam = getExamById(examId);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadingExplanation, setLoadingExplanation] = useState<number | null>(null);

  useEffect(() => {
    if (examsLoading) return;
    const storedAnswers = getAnswers(examId);
    setAnswers(storedAnswers);
    setLoading(false);
  }, [examId, getAnswers, examsLoading]);

  const { correctAnswers, totalQuestions, scorePercentage, attemptedQuestions } = useMemo(() => {
    if (!exam) {
      return { correctAnswers: 0, totalQuestions: 0, scorePercentage: 0, attemptedQuestions: 0 };
    }
    let correctCount = 0;
    exam.questions.forEach((q, index) => {
      if (q.correctAnswer && answers[index] && q.correctAnswer.trim().toLowerCase() === answers[index].trim().toLowerCase()) {
        correctCount++;
      }
    });
    const total = exam.questions.length;
    const score = total > 0 ? (correctCount / total) * 100 : 0;
    const attempted = Object.keys(answers).length;

    return { correctAnswers: correctCount, totalQuestions: total, scorePercentage: score, attemptedQuestions: attempted };
  }, [exam, answers]);
  
  const handleShowExplanation = async (questionIndex: number) => {
    if (explanations[questionIndex] || !exam) return;

    setLoadingExplanation(questionIndex);
    try {
      const question = exam.questions[questionIndex];
      const result = await generateAnswerExplanation({
        question: question.questionText,
        answer: answers[questionIndex] || "Not Answered",
        correctAnswer: question.correctAnswer || "N/A",
        subject: exam.title,
      });
      setExplanations(prev => ({...prev, [questionIndex]: result.explanation}));
    } catch (error) {
      console.error("Error generating explanation:", error);
      setExplanations(prev => ({...prev, [questionIndex]: "Could not generate an explanation at this time."}));
    } finally {
      setLoadingExplanation(null);
    }
  }

  const getQuestionStatus = (index: number) => {
    const question = exam?.questions[index];
    const userAnswer = answers[index];
    if (!question) {
        return { icon: <HelpCircle className="h-5 w-5 text-muted-foreground" />, text: 'Not Answered', color: 'bg-muted/20' };
    }
    if (!userAnswer) {
      return { icon: <HelpCircle className="h-5 w-5 text-muted-foreground" />, text: 'Not Answered', color: 'bg-muted/20' };
    }
    if (question.correctAnswer?.trim().toLowerCase() === userAnswer.trim().toLowerCase()) {
      return { icon: <CheckCircle2 className="h-5 w-5 text-green-500" />, text: 'Correct', color: 'bg-green-500/10' };
    }
    return { icon: <XCircle className="h-5 w-5 text-red-500" />, text: 'Incorrect', color: 'bg-red-500/10' };
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="p-4 sm:p-6 md:p-8">
            {loading || examsLoading ? (
               <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
               </div>
            ) : !exam ? (
               <p>Exam results not found.</p>
            ) : (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <CardTitle className="text-xl sm:text-2xl font-bold">Results for: {exam.title}</CardTitle>
                                    <CardDescription>Here's a detailed breakdown of your performance.</CardDescription>
                                </div>
                                <Button onClick={() => router.push('/')} className="w-full sm:w-auto">
                                    <Home className="mr-2 h-4 w-4" /> Go to Dashboard
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                <Card className="flex flex-col items-center justify-center p-4 sm:p-6 bg-primary/5">
                                    <CardTitle className="text-sm font-medium text-primary mb-2">SCORE</CardTitle>
                                    <p className="text-4xl font-bold text-primary">{scorePercentage.toFixed(2)}%</p>
                                    <p className="text-muted-foreground text-sm">{correctAnswers} / {totalQuestions} correct</p>
                                </Card>
                                 <Card className="p-4 sm:p-6">
                                    <CardTitle className="text-sm font-medium mb-4">Summary</CardTitle>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Correct Answers</span>
                                            <span className="font-semibold">{correctAnswers}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Incorrect Answers</span>
                                            <span className="font-semibold">{attemptedQuestions - correctAnswers}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Not Attempted</span>
                                            <span className="font-semibold">{totalQuestions - attemptedQuestions}</span>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="p-4 sm:p-6">
                                    <CardTitle className="text-sm font-medium mb-2">Accuracy</CardTitle>
                                    <Progress value={scorePercentage} className="h-3 mb-2" />
                                    <p className="text-sm text-muted-foreground text-center">{scorePercentage.toFixed(2)}% of questions answered correctly</p>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl sm:text-2xl">Question Analysis</CardTitle>
                            <CardDescription>Review each question with detailed explanations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {exam.questions.map((question, index) => {
                                    const status = getQuestionStatus(index);
                                    return (
                                    <AccordionItem key={index} value={`item-${index}`} className={`border-l-4 rounded-r-md mb-2 ${status.color}`} style={{borderColor: status.color.startsWith('bg-green') ? 'hsl(var(--primary))' : status.color.startsWith('bg-red') ? 'hsl(var(--destructive))' : 'hsl(var(--muted))'}}>
                                        <AccordionTrigger className="p-4 hover:no-underline">
                                            <div className="flex items-center gap-4 w-full text-left">
                                                {status.icon}
                                                <span className="font-semibold text-sm sm:text-base flex-1">Question {index + 1}</span>
                                                <Badge variant="outline" className="ml-auto shrink-0">{status.text}</Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-4 pt-0 space-y-4">
                                            <p className="font-medium text-base">{question.questionText}</p>
                                            <div className="space-y-2">
                                                <p className="text-sm">
                                                    <strong>Your Answer:</strong>
                                                    <span className={`ml-2 font-semibold ${
                                                        status.text === 'Correct' ? 'text-green-600' : 
                                                        status.text === 'Incorrect' ? 'text-destructive' : 
                                                        'text-muted-foreground'
                                                    }`}>
                                                        {answers[index] || 'Not Answered'}
                                                    </span>
                                                </p>
                                                {status.text !== 'Correct' && (
                                                    <p className="text-sm">
                                                        <strong>Correct Answer:</strong>
                                                        <span className="ml-2 font-semibold text-green-600">
                                                            {question.correctAnswer}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Button variant="secondary" size="sm" onClick={() => handleShowExplanation(index)} disabled={loadingExplanation === index}>
                                                    {loadingExplanation === index ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                                                    {explanations[index] ? 'Show Explanation' : 'Generate Explanation'}
                                                </Button>
                                                {explanations[index] && (
                                                    <Card className="mt-4 bg-muted/30">
                                                        <CardContent className="p-4 text-sm prose prose-sm max-w-none dark:prose-invert">
                                                            <p>{explanations[index]}</p>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )})}
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
