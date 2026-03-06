
'use client';

import type { ExtractQuizDataFromPdfOutput } from '@/ai/flows/extract-quiz-data-from-pdf';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './use-auth';

type ExamQuestion = ExtractQuizDataFromPdfOutput['questions'][0];

export interface Exam {
  id: string;
  title: string;
  description: string;
  questions: ExamQuestion[];
  status: 'Not Started' | 'In Progress' | 'Completed';
  duration: number; // in minutes
  passingScore: number; // percentage
  type: 'exam' | 'practice';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subject: string;
}

interface ExamContextType {
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'description' | 'duration' | 'passingScore' | 'type' | 'difficulty' | 'subject'>) => void;
  updateExamStatus: (examId: string, status: Exam['status']) => void;
  getExamById: (examId: string) => Exam | undefined;
  saveAnswers: (examId: string, answers: Record<number, string>) => void;
  getAnswers: (examId: string) => Record<number, string>;
  loading: boolean;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

const initialExams: Omit<Exam, 'id'>[] = [];

export function ExamProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    if (typeof window === 'undefined' || authLoading) {
      // Don't do anything on the server or while auth is loading.
      return;
    }
    
    if (!user) {
        setExams([]);
        setLoading(false);
        return;
    }
    
    const userExamsKey = `exams-${user.uid}`;
    
    try {
      const savedExams = localStorage.getItem(userExamsKey);
      if (savedExams) {
        setExams(JSON.parse(savedExams));
      } else {
        const examsWithIds = initialExams.map((exam, index) => ({
          ...exam,
          id: `${exam.title.toLowerCase().replace(/\s/g, '-')}-${Date.now() + index}`,
        }));
        localStorage.setItem(userExamsKey, JSON.stringify(examsWithIds));
        setExams(examsWithIds);
      }
    } catch (error) {
      console.error('Failed to load exams from localStorage', error);
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (typeof window !== 'undefined' && user && !loading) {
      const userExamsKey = `exams-${user.uid}`;
      try {
        localStorage.setItem(userExamsKey, JSON.stringify(exams));
      } catch (error) {
        console.error('Failed to save exams to localStorage', error);
      }
    }
  }, [exams, user, loading]);

  const addExam = (exam: Omit<Exam, 'description' | 'duration' | 'passingScore' | 'type' | 'difficulty' | 'subject'>) => {
    if (!user) return;
    const newExam = {
      ...exam,
      description: 'A newly generated exam from your PDF.',
      duration: Math.floor(exam.questions.length * 1.5), // 1.5 mins per question
      passingScore: 70,
      type: 'exam' as const,
      subject: 'Mixed',
      difficulty: 'Medium' as const,
    };
    setExams(prevExams => [...prevExams, newExam]);
  };

  const updateExamStatus = (examId: string, status: Exam['status']) => {
    setExams(prevExams => 
      prevExams.map(exam => 
        exam.id === examId ? { ...exam, status } : exam
      )
    );
  };
  
  const saveAnswers = (examId: string, answers: Record<number, string>) => {
    if (!user) return;
    try {
      localStorage.setItem(`answers-${user.uid}-${examId}`, JSON.stringify(answers));
    } catch (error) {
      console.error('Failed to save answers to localStorage', error);
    }
  }
  
  const getAnswers = (examId: string): Record<number, string> => {
    if (typeof window === 'undefined' || !user) return {};
    try {
      const savedAnswers = localStorage.getItem(`answers-${user.uid}-${examId}`);
      return savedAnswers ? JSON.parse(savedAnswers) : {};
    } catch (error) {
      console.error('Failed to load answers from localStorage', error);
      return {};
    }
  }

  const getExamById = (examId: string) => {
    return exams.find(exam => exam.id === examId);
  }

  return (
    <ExamContext.Provider value={{ exams, addExam, updateExamStatus, getExamById, saveAnswers, getAnswers, loading: authLoading || loading }}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExams() {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExams must be used within an ExamProvider');
  }
  return context;
}
