import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Calendar, BookOpen, Trophy } from "lucide-react";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default async function StudentDetailPage(props: {
    params: Promise<{ id: string }>;
}) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") redirect("/login");

    const student = await prisma.user.findUnique({
        where: { id: params.id },
        include: {
            enrollments: {
                include: { course: true },
                orderBy: { lastAccessed: "desc" },
            },
            quizResults: {
                include: { quiz: true },
                orderBy: { date: "desc" },
            },
            certificates: true,
        },
    });

    if (!student) notFound();

    // Basic stats
    const completedCourses = student.enrollments.filter(
        (e) => e.progressPercent === 100
    ).length;
    const avgQuizScore =
        student.quizResults.length > 0
            ? Math.round(
                student.quizResults.reduce((acc, curr) => acc + curr.score, 0) /
                student.quizResults.length
            )
            : 0;

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent">
                        <Link href="/admin-dashboard/students" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Students
                        </Link>
                    </Button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {student.firstName} {student.lastName}
                            </h1>
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {student.email}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Joined {new Date(student.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <Badge variant={student.emailVerified ? "default" : "secondary"}>
                            {student.emailVerified ? "Verified" : "Unverified"}
                        </Badge>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{student.enrollments.length}</div>
                            <p className="text-xs text-muted-foreground">{completedCourses} completed</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
                            <Trophy className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{student.quizResults.length}</div>
                            <p className="text-xs text-muted-foreground">{avgQuizScore}% avg. score</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
                            <Trophy className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{student.certificates.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Course Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle>Course Progress</CardTitle>
                        <CardDescription>Detailed progress for enrolled courses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {student.enrollments.length === 0 ? (
                            <p className="text-muted-foreground">No enrollments yet.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Course Title</TableHead>
                                        <TableHead>Progress</TableHead>
                                        <TableHead>Lessons Completed</TableHead>
                                        <TableHead>Last Accessed</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {student.enrollments.map((enrollment) => (
                                        <TableRow key={enrollment.id}>
                                            <TableCell className="font-medium">{enrollment.course.title}</TableCell>
                                            <TableCell className="w-[200px]">
                                                <div className="flex items-center gap-2">
                                                    <Progress value={enrollment.progressPercent} className="h-2" />
                                                    <span className="text-xs text-muted-foreground w-8">{enrollment.progressPercent}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{enrollment.completedLessons}</TableCell>
                                            <TableCell>{new Date(enrollment.lastAccessed).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Quiz Results */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quiz Performance</CardTitle>
                        <CardDescription>Recent quiz results</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {student.quizResults.length === 0 ? (
                            <p className="text-muted-foreground">No quizzes taken yet.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Quiz Title</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {student.quizResults.map((result) => (
                                        <TableRow key={result.id}>
                                            <TableCell className="font-medium">{result.quiz.title}</TableCell>
                                            <TableCell>
                                                <Badge variant={result.score >= 70 ? "default" : "destructive"}>
                                                    {result.score}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(result.date).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
