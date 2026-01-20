import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BookOpen, CheckCircle2, ShieldCheck, Clock, Users } from "lucide-react";
import Link from "next/link";
import { EnrollButton } from "@/components/enroll-button";

export default async function EnrollPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/login");
    }

    const { id } = await params;

    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            _count: {
                select: { lessons: true, enrollments: true },
            },
        },
    });

    if (!course) {
        return notFound();
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: session.user.id,
                courseId: id,
            },
        },
    });

    if (existingEnrollment) {
        redirect(`/courses/${id}`);
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 py-20">
                <div className="space-y-8 text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-4">
                        <ShieldCheck className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Confirm Your Enrollment</h1>
                    <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                        You're about to start your journey in <span className="text-foreground font-bold">{course.title}</span>.
                        Confirm below to get immediate access to all lessons and materials.
                    </p>
                </div>

                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="bg-primary/5 p-8 border-b border-primary/10">
                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-10 h-10 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm font-bold text-primary uppercase tracking-wider">{course.category}</div>
                                <h2 className="text-2xl font-bold leading-tight">{course.title}</h2>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" /> {course.duration}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4" /> {course._count.enrollments} Students
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-8 space-y-6">
                        <h3 className="font-bold text-lg">What you'll get:</h3>
                        <ul className="grid gap-4">
                            <li className="flex items-center gap-3 font-medium">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                Full access to {course._count.lessons} comprehensive lessons
                            </li>
                            <li className="flex items-center gap-3 font-medium">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                Hands-on quizzes and assessments
                            </li>
                            <li className="flex items-center gap-3 font-medium">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                Verified certificate upon completion
                            </li>
                            <li className="flex items-center gap-3 font-medium">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                Lifetime access to course materials
                            </li>
                        </ul>
                    </CardContent>

                    <CardFooter className="p-8 bg-muted/30 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <EnrollButton courseId={id} />
                        </div>
                        <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl font-bold" asChild>
                            <Link href={`/courses/${id}`}>Cancel</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>

            <Footer />
        </div>
    );
}
