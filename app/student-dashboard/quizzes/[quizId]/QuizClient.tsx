// app/student-dashboard/quizzes/[quizId]/QuizClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  totalQuestions: number;
  course: {
    id: string;
    title: string;
  };
  lesson?: {
    id: string;
    title: string;
  };
  questions: Question[];
  totalPoints: number;
}

interface QuizResult {
  id: string;
  score: number;
  answers: any;
  timeTaken?: number;
  date: Date;
}

interface QuizClientProps {
  quiz: Quiz;
  hasAttempted: boolean;
  previousResult: QuizResult | null;
  justSubmitted: boolean;
}

export default function QuizClient({
  quiz,
  hasAttempted,
  previousResult,
  justSubmitted,
}: QuizClientProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(justSubmitted);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(answers).length;
  const progressPercentage = (answeredQuestions / quiz.questions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (hasAttempted || showResults) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasAttempted, showResults]);

  // Show success toast if just submitted
  useEffect(() => {
    if (justSubmitted && previousResult) {
      toast.success("Quiz submitted successfully!", {
        description: `Your score: ${previousResult.score}/${quiz.totalPoints}`,
      });
    }
  }, [justSubmitted, previousResult, quiz.totalPoints]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Prepare answers in the expected format
      const formattedAnswers = quiz.questions.map((question) => ({
        questionId: question.id,
        selected: answers[question.id] || null,
        points: question.points,
      }));

      const response = await fetch(`/api/quizzes/${quiz.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: formattedAnswers,
          timeTaken: 3600 - timeRemaining,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Quiz submitted successfully!", {
          description: `Score: ${result.score}/${quiz.totalPoints}`,
        });

        // Refresh to show results
        router.push(`/student-dashboard/quizzes/${quiz.id}?submitted=true`);
        router.refresh();
      } else {
        const error = await response.json();
        toast.error("Failed to submit quiz", {
          description: error.message || "Please try again",
        });
      }
    } catch (error) {
      toast.error("An error occurred", {
        description: "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // If quiz has been attempted, show results
  if (hasAttempted && previousResult && !showResults) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() =>
            router.push(`/student-dashboard/courses/${quiz.course.id}`)
          }
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Quiz Already Attempted
            </CardTitle>
            <CardDescription>
              You have already completed this quiz. View your results below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {previousResult.score}/{quiz.totalPoints}
                    </div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {Math.round(
                        (previousResult.score / quiz.totalPoints) * 100,
                      )}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Percentage
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {quiz.questions.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Questions
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {previousResult.timeTaken && (
              <div className="mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatTime(previousResult.timeTaken)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Time Taken
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>
                You can only attempt this quiz once. Your score has been
                recorded.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/student-dashboard/courses/${quiz.course.id}`)
              }
            >
              Return to Course
            </Button>
            <Button onClick={() => setShowResults(true)}>
              View Detailed Results
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If showing detailed results
  if (showResults && previousResult) {
    const parsedAnswers = Array.isArray(previousResult.answers)
      ? previousResult.answers
      : JSON.parse((previousResult.answers as string) || "[]");

    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() =>
              router.push(`/student-dashboard/courses/${quiz.course.id}`)
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Button>
          <Button variant="outline" onClick={() => setShowResults(false)}>
            Back to Summary
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quiz Results: {quiz.title}</CardTitle>
            <CardDescription>
              Submitted on {new Date(previousResult.date).toLocaleDateString()}
              {previousResult.timeTaken &&
                ` • Time taken: ${formatTime(previousResult.timeTaken)}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {parsedAnswers.map((answer: any, index: number) => {
              const question = quiz.questions.find(
                (q) => q.id === answer.questionId,
              );
              if (!question) return null;

              const isCorrect = answer.isCorrect;

              return (
                <Card
                  key={answer.questionId}
                  className={`mb-4 ${isCorrect ? "border-green-200" : "border-red-200"}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={isCorrect ? "default" : "destructive"}>
                          {isCorrect ? "Correct" : "Incorrect"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {answer.points} point{answer.points !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-semibold mb-4">
                      Question {index + 1}: {question.questionText}
                    </h4>

                    <div className="space-y-2">
                      <div
                        className={`p-3 rounded ${answer.selected === "A" ? (isCorrect && answer.selected === "A" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200") : "bg-gray-50"}`}
                      >
                        A: {question.optionA}
                      </div>
                      <div
                        className={`p-3 rounded ${answer.selected === "B" ? (isCorrect && answer.selected === "B" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200") : "bg-gray-50"}`}
                      >
                        B: {question.optionB}
                      </div>
                      <div
                        className={`p-3 rounded ${answer.selected === "C" ? (isCorrect && answer.selected === "C" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200") : "bg-gray-50"}`}
                      >
                        C: {question.optionC}
                      </div>
                      <div
                        className={`p-3 rounded ${answer.selected === "D" ? (isCorrect && answer.selected === "D" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200") : "bg-gray-50"}`}
                      >
                        D: {question.optionD}
                      </div>
                    </div>

                    {!isCorrect && (
                      <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Correct answer: {answer.correct}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main quiz interface - First attempt
  return (
    <div className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={() =>
          router.push(`/student-dashboard/courses/${quiz.course.id}`)
        }
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Course
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quiz info sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Course: {quiz.course.title}</span>
                  </div>
                  {quiz.lesson && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Lesson: {quiz.lesson.title}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Time remaining: {formatTime(timeRemaining)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Progress</h3>
                <Progress value={progressPercentage} className="mb-2" />
                <div className="text-sm text-muted-foreground">
                  {answeredQuestions} of {quiz.questions.length} questions
                  answered
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Questions</h3>
                <div className="grid grid-cols-5 gap-2">
                  {quiz.questions.map((_, index) => (
                    <Button
                      key={index}
                      variant={
                        currentQuestionIndex === index
                          ? "default"
                          : answers[quiz.questions[index].id]
                            ? "secondary"
                            : "outline"
                      }
                      size="sm"
                      className="h-8"
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting || answeredQuestions === 0}
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Main quiz content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>
                    Question {currentQuestionIndex + 1} of{" "}
                    {quiz.questions.length}
                  </CardTitle>
                  <CardDescription>
                    {currentQuestion.points} point
                    {currentQuestion.points !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <Badge variant="outline">{formatTime(timeRemaining)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">
                  {currentQuestion.questionText}
                </h3>

                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) =>
                    handleAnswerSelect(currentQuestion.id, value)
                  }
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                    <RadioGroupItem
                      value="A"
                      id={`option-a-${currentQuestion.id}`}
                    />
                    <Label
                      htmlFor={`option-a-${currentQuestion.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {currentQuestion.optionA}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                    <RadioGroupItem
                      value="B"
                      id={`option-b-${currentQuestion.id}`}
                    />
                    <Label
                      htmlFor={`option-b-${currentQuestion.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {currentQuestion.optionB}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                    <RadioGroupItem
                      value="C"
                      id={`option-c-${currentQuestion.id}`}
                    />
                    <Label
                      htmlFor={`option-c-${currentQuestion.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {currentQuestion.optionC}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                    <RadioGroupItem
                      value="D"
                      id={`option-d-${currentQuestion.id}`}
                    />
                    <Label
                      htmlFor={`option-d-${currentQuestion.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {currentQuestion.optionD}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === quiz.questions.length - 1}
              >
                Next
              </Button>
            </CardFooter>
          </Card>

          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Make sure to answer all questions before submitting. You can
              navigate between questions using the number grid.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
