"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Trophy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface Question {
    id: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
}

interface QuizTakerProps {
    quizId: string;
    questions: Question[];
    courseId: string;
    lessonId?: string;
}

export function QuizTaker({ quizId, questions, courseId, lessonId }: QuizTakerProps) {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ score: number; details: any[] } | null>(null);
    const router = useRouter();

    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers({ ...answers, [questionId]: answer });
    };

    const handleSubmit = async () => {
        // Check if all questions are answered
        const unanswered = questions.filter(q => !answers[q.id]);
        if (unanswered.length > 0) {
            toast({
                title: "Incomplete",
                description: `Please answer all questions (${unanswered.length} remaining)`,
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/quiz/${quizId}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers }),
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
                toast({
                    title: "Quiz Submitted!",
                    description: `You scored ${data.score}%`,
                });
            } else {
                const err = await res.json().catch(() => null);
                toast({
                    title: "Submission failed",
                    description: err?.error || "Something went wrong",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Network error",
                description: "Failed to submit quiz",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (result) {
        return (
            <div className="space-y-6">
                <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <Trophy className="w-6 h-6" />
                            Quiz Complete!
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold mb-2">{result.score}%</p>
                        <p className="text-muted-foreground">
                            You got {result.details.filter(d => d.correct).length} out of {questions.length} correct
                        </p>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Review Your Answers</h3>
                    {result.details.map((detail, index) => (
                        <Card key={index} className={detail.correct ? "border-green-200" : "border-red-200"}>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    {detail.correct ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-600" />
                                    )}
                                    Question {index + 1}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="font-medium">{detail.questionText}</p>
                                <div className="space-y-2">
                                    <p className="text-sm">
                                        <span className="font-semibold">Your answer:</span>{" "}
                                        <span className={detail.correct ? "text-green-600" : "text-red-600"}>
                                            {detail.userAnswer} - {detail.userAnswerText}
                                        </span>
                                    </p>
                                    {!detail.correct && (
                                        <p className="text-sm">
                                            <span className="font-semibold">Correct answer:</span>{" "}
                                            <span className="text-green-600">
                                                {detail.correctAnswer} - {detail.correctAnswerText}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex gap-3">
                    <Button onClick={() => { setResult(null); setAnswers({}); }}>
                        Retake Quiz
                    </Button>
                    <Button variant="outline" onClick={() => router.push(lessonId ? `/courses/${courseId}/lessons/${lessonId}` : `/courses/${courseId}`)}>
                        Back to {lessonId ? "Lesson" : "Course"}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {questions.map((question, index) => (
                <Card key={question.id}>
                    <CardHeader>
                        <CardTitle className="text-base">Question {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="font-medium">{question.questionText}</p>
                        <RadioGroup
                            value={answers[question.id] || ""}
                            onValueChange={(value) => handleAnswerChange(question.id, value)}
                        >
                            {["A", "B", "C", "D"].map((option) => (
                                <div key={option} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                                    <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                                    <Label htmlFor={`${question.id}-${option}`} className="flex-1 cursor-pointer">
                                        <span className="font-semibold mr-2">{option}.</span>
                                        {question[`option${option}` as keyof Question]}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </CardContent>
                </Card>
            ))}

            <div className="flex justify-end gap-3">
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || Object.keys(answers).length !== questions.length}
                    size="lg"
                >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </Button>
            </div>
        </div>
    );
}
