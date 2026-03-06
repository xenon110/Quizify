
'use client';

import { useState, useEffect } from 'react';
import { useExams } from '@/hooks/use-exams';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Timer, Calculator, Bookmark, CheckCircle, Circle, ArrowLeft, ArrowRight, BookCheck, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';

export default function ExamClient({ examId }: { examId: string }) {
  const router = useRouter();
  const { getExamById, updateExamStatus, saveAnswers, getAnswers, loading: examsLoading } = useExams();
  const { user } = useAuth();
  
  const exam = getExamById(examId);
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

  const [hasStarted, setHasStarted] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [bookmarks, setBookmarks] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (examsLoading) return;
    const examData = getExamById(examId);
    if (!examData) {
      router.push('/exams');
      return;
    }
     if (examData.status === 'Completed') {
      router.push(`/results/${examData.id}`);
      return;
    }
    if (examData.status === 'In Progress') {
        setHasStarted(true);
        setTimeLeft(examData.duration * 60);
    }
    const savedAnswers = getAnswers(examId);
    setAnswers(savedAnswers);
    setLoading(false);
  }, [examId, examsLoading, getExamById, getAnswers, router]);

  useEffect(() => {
    if (hasStarted && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => (prev ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [hasStarted, timeLeft]);

  const handleStartExam = () => {
    const selectedDuration = duration || exam?.duration || 60;
    setTimeLeft(selectedDuration * 60);
    setHasStarted(true);
    updateExamStatus(examId, 'In Progress');
  };

  const handleNext = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSaveAndNext = () => {
    saveAnswers(examId, answers);
    handleNext();
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({...prev, [currentQuestionIndex]: value}));
  };

  const toggleBookmark = () => {
    setBookmarks(prev => ({...prev, [currentQuestionIndex]: !prev[currentQuestionIndex]}));
  };
  
  const handleSubmit = () => {
    saveAnswers(examId, answers);
    updateExamStatus(examId, 'Completed');
    router.push(`/results/${examId}`);
  };

  if (loading || examsLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }
  
  if (!exam) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <p>Exam not found.</p>
        </div>
    );
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const attemptedCount = Object.keys(answers).length;
  const bookmarkedCount = Object.values(bookmarks).filter(Boolean).length;
  const totalQuestions = exam.questions.length;
  const leftCount = totalQuestions - attemptedCount;
  const currentQuestion = exam.questions[currentQuestionIndex];
  const isMultipleChoice = currentQuestion.options && currentQuestion.options.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      {!hasStarted ? (
        <Dialog open={!hasStarted} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Start Exam: {exam.title}</DialogTitle>
              <DialogDescription>
                Select the duration for your test session. The timer will start once you begin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration
                </Label>
                <Select onValueChange={(value) => setDuration(Number(value))} defaultValue={String(exam.duration)}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                        <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => router.back()}>Cancel</Button>
              <Button onClick={handleStartExam} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">Start Exam</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <>
          <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between h-auto md:h-16 px-4 py-2 md:px-6 bg-background border-b">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {user && (
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL || userAvatar?.imageUrl} />
                    <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
              )}
              <h1 className="font-semibold text-lg truncate">{exam.title}</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium w-full md:w-auto justify-around md:justify-end mt-2 md:mt-0">
                <div className="flex items-center gap-1.5 text-primary">
                  <Timer className="h-5 w-5" />
                  <span>{timeLeft !== null ? formatTime(timeLeft) : formatTime(exam.duration * 60)}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Attempted">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="hidden sm:inline">Att:</span>
                  <span>{attemptedCount}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Bookmarked">
                  <Bookmark className="h-5 w-5 text-blue-500" />
                  <span className="hidden sm:inline">Mark:</span>
                  <span>{bookmarkedCount}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Remaining">
                  <Circle className="h-5 w-5 text-muted-foreground" />
                  <span className="hidden sm:inline">Left:</span>
                  <span>{leftCount}</span>
                </div>
                <Button variant="outline" size="icon">
                  <Calculator className="h-5 w-5" />
                </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-4xl">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle>Question {currentQuestionIndex + 1}/{totalQuestions}</CardTitle>
                   <Button variant={bookmarks[currentQuestionIndex] ? 'default' : 'outline'} size="sm" onClick={toggleBookmark}>
                      <Bookmark className="mr-2 h-4 w-4" />
                      {bookmarks[currentQuestionIndex] ? 'Bookmarked' : 'Bookmark'}
                   </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-base sm:text-lg font-medium">{currentQuestion.questionText}</p>
                  
                  {isMultipleChoice ? (
                    <RadioGroup value={answers[currentQuestionIndex] || ''} onValueChange={handleAnswerChange}>
                      {currentQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors">
                              <RadioGroupItem value={option} id={`option-${index}`} />
                              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-sm sm:text-base">{option}</Label>
                          </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-2">
                        <Label htmlFor="numeric-answer">Your Answer</Label>
                        <Input
                            id="numeric-answer"
                            type="text"
                            placeholder="Enter your answer"
                            value={answers[currentQuestionIndex] || ''}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                        />
                    </div>
                  )}

                </CardContent>
              </Card>
            </div>
          </main>
          <footer className="sticky bottom-0 z-10 flex flex-col sm:flex-row items-center justify-between h-auto sm:h-20 px-4 py-3 sm:px-6 bg-background border-t gap-2">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button variant="secondary" onClick={handleSaveAndNext} className="flex-1 sm:flex-initial">
                    Save & Next
                  </Button>
                  <Button onClick={handleNext} disabled={currentQuestionIndex === totalQuestions - 1} className="flex-1 sm:flex-initial">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
              </div>
               <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <BookCheck className="mr-2 h-4 w-4" /> Submit Test
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. You will not be able to change your answers after submitting.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          </footer>
        </>
      )}
    </div>
  );
}
