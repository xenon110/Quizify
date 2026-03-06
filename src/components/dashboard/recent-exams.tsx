'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import { useExams } from "@/hooks/use-exams";
import { Info } from "lucide-react";

export function RecentExams() {
  const { exams } = useExams();

  // Sort exams by a pseudo-date from the ID for recentness
  const recentExams = [...exams]
    .filter(exam => exam.status !== 'Not Started')
    .sort((a, b) => {
        const dateA = parseInt(a.id.split('-')[1] || '0');
        const dateB = parseInt(b.id.split('-')[1] || '0');
        return dateB - dateA;
    })
    .slice(0, 5); // show latest 5

  const getBadgeClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300 hover:bg-gray-100";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          An overview of your most recent exams.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentExams.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Exam</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentExams.map((exam) => {
                const examDate = new Date(parseInt(exam.id.split('-')[1] || '0')).toLocaleDateString();
                
                return (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>{examDate}</TableCell>
                    <TableCell>
                      <Badge variant={exam.status === "Completed" ? "secondary" : "outline"} className={getBadgeClass(exam.status)}>
                        {exam.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={exam.status === "Completed" ? `/results/${exam.id}`: `/exam/${exam.id}`}>
                          {exam.status === "Completed" ? "View Results" : "Continue"}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Info className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-muted-foreground">No Recent Activity</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Start an exam to see your activity here.
                </p>
                <Button asChild className="mt-4">
                    <Link href="/exams">Go to My Exams</Link>
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
