
'use client';

import { useState, useMemo } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Search, Clock, HelpCircle, CheckCircle, Play, ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import { useExams, Exam } from "@/hooks/use-exams";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from '@/components/layout/app-header';

const getStatusStyles = (status: Exam['status']) => {
    switch (status) {
        case 'Not Started':
            return {
                badge: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                buttonIcon: <Play className="mr-2 h-4 w-4" />,
                href: (id: string) => `/exam/${id}`
            };
        case 'In Progress':
            return {
                badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
                buttonIcon: <Play className="mr-2 h-4 w-4" />,
                href: (id: string) => `/exam/${id}`
            };
        case 'Completed':
            return {
                badge: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
                buttonIcon: <ArrowRight className="ml-2 h-4 w-4" />,
                href: (id: string) => `/results/${id}`
            };
        default:
            return {
                badge: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                buttonIcon: <Play className="mr-2 h-4 w-4" />,
                href: (id: string) => `/exam/${id}`
            };
    }
};

const getButtonLabel = (status: Exam['status']) => {
    if (status === 'Completed') return 'View Results';
    if (status === 'In Progress') return 'Continue Exam';
    return 'Start Exam';
}

const getStatusLabel = (status: Exam['status']) => {
    if (status === 'Not Started') return 'Available';
    return status;
}

export default function ExamsPage() {
  const { exams } = useExams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
        const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'all' || exam.status.toLowerCase().replace(' ', '') === activeFilter;
        return matchesSearch && matchesFilter;
    });
  }, [exams, searchQuery, activeFilter]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="p-4 sm:p-6 md:p-8">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary">My Exams</h1>
                <p className="text-muted-foreground text-sm sm:text-base">Choose an exam to start or continue your assessment</p>
            </div>
            
            <Card className="mb-6">
                <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search exams..." 
                            className="pl-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                        <Button variant={activeFilter === 'all' ? 'default' : 'outline'} onClick={() => setActiveFilter('all')}>All</Button>
                        <Button variant={activeFilter === 'notstarted' ? 'default' : 'outline'} onClick={() => setActiveFilter('notstarted')}>Available</Button>
                        <Button variant={activeFilter === 'inprogress' ? 'default' : 'outline'} onClick={() => setActiveFilter('inprogress')}>In Progress</Button>
                        <Button variant={activeFilter === 'completed' ? 'default' : 'outline'} onClick={() => setActiveFilter('completed')}>Completed</Button>
                    </div>
                </CardContent>
            </Card>

            {filteredExams.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredExams.map((exam) => {
                        const statusInfo = getStatusStyles(exam.status);
                        const buttonLabel = getButtonLabel(exam.status);
                        
                        return (
                            <Card key={exam.id} className="flex flex-col">
                                <CardContent className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold">{exam.title}</h3>
                                        <Badge className={`${statusInfo.badge} shrink-0`}>{getStatusLabel(exam.status)}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4 flex-grow">{exam.description}</p>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground mb-6">
                                        <div className="flex items-center gap-2"><Clock className="h-4 w-4"/><span>{exam.duration} min</span></div>
                                        <div className="flex items-center gap-2"><HelpCircle className="h-4 w-4"/><span>{exam.questions.length} questions</span></div>
                                        <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4"/><span>Pass: {exam.passingScore}%</span></div>
                                        <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4"/><span>{exam.type}</span></div>
                                    </div>
                                    <div className="mt-auto">
                                        <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                            <Link href={statusInfo.href(exam.id)}>
                                                {statusInfo.buttonIcon}
                                                {buttonLabel}
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                 <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Info className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium text-muted-foreground">No Exams Found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Your search and filter combination did not return any results.
                    </p>
                     <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}>
                        Clear Filters
                    </Button>
                </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
