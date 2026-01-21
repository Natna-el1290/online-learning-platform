"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Question {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
}

export function AddQuizDialog({
  courses,
}: {
  courses: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState<string>(courses[0]?.id ?? "");
  const [lessonId, setLessonId] = useState<string>("none");
  const [questions, setQuestions] = useState<Question[]>([
    {
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableLessons, setAvailableLessons] = useState<
    { id: string; title: string; courseId: string }[]
  >([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  const router = useRouter();

  // Fetch lessons when courseId changes
  useEffect(() => {
    if (!courseId) {
      setAvailableLessons([]);
      return;
    }

    const fetchLessons = async () => {
      setLessonsLoading(true);
      try {
        const res = await fetch(`/api/admin/lessons?courseId=${courseId}`);
        if (!res.ok) throw new Error("Failed to fetch lessons");
        const data = await res.json();
        setAvailableLessons(data);
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "Failed to load lessons for this course",
          variant: "destructive",
        });
        setAvailableLessons([]);
      } finally {
        setLessonsLoading(false);
      }
    };

    fetchLessons();
  }, [courseId]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (
    index: number,
    field: keyof Question,
    value: string,
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Quiz title is required",
        variant: "destructive",
      });
      return;
    }

    if (!courseId) {
      toast({
        title: "Error",
        description: "Please select a course",
        variant: "destructive",
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        title: "Error",
        description: "Add at least one question",
        variant: "destructive",
      });
      return;
    }

    for (const [idx, q] of questions.entries()) {
      if (
        q.questionText.trim().length < 10 ||
        q.optionA.trim().length < 1 ||
        q.optionB.trim().length < 1 ||
        q.optionC.trim().length < 1 ||
        q.optionD.trim().length < 1
      ) {
        toast({
          title: "Incomplete Question",
          description: `Question ${idx + 1}: Please fill in the question and all options (min 10 chars for question)`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        courseId,
        lessonId: lessonId === "none" ? null : lessonId,
        totalQuestions: questions.length,
        questions: questions.map((q) => ({
          questionText: q.questionText.trim(),
          optionA: q.optionA.trim(),
          optionB: q.optionB.trim(),
          optionC: q.optionC.trim(),
          optionD: q.optionD.trim(),
          correctAnswer: q.correctAnswer,
        })),
      };

      const res = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create quiz");
      }

      toast({
        title: "Success",
        description: `Quiz "${title}" created successfully!`,
      });

      setOpen(false);
      router.refresh();

      // Reset form
      setTitle("");
      setCourseId(courses[0]?.id ?? "");
      setLessonId("none");
      setQuestions([
        {
          questionText: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctAnswer: "A",
        },
      ]);
    } catch (error: any) {
      console.error("Quiz creation error:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to create quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Quiz
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle>Create New Quiz</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Fixed top section */}
          <div className="space-y-6 p-6 border-b">
            <div>
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., JavaScript Fundamentals - Midterm Quiz"
                className="mt-1.5"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="course">Associated Course *</Label>
                <Select
                  value={courseId}
                  onValueChange={(val) => {
                    setCourseId(val);
                    setLessonId("none");
                  }}
                >
                  <SelectTrigger id="course" className="mt-1.5">
                    <SelectValue placeholder="Choose course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No courses available
                      </div>
                    ) : (
                      courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lesson">Associated Lesson (optional)</Label>
                <Select
                  value={lessonId}
                  onValueChange={setLessonId}
                  disabled={lessonsLoading || availableLessons.length === 0}
                >
                  <SelectTrigger id="lesson" className="mt-1.5">
                    <SelectValue placeholder="No specific lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {lessonsLoading ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        Loading lessons...
                      </div>
                    ) : availableLessons.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No lessons for selected course
                      </div>
                    ) : (
                      <>
                        <SelectItem value="none">No specific lesson</SelectItem>
                        {availableLessons.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.title}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Scrollable questions */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between sticky top-0 bg-background z-10 pb-2">
              <h3 className="text-lg font-semibold">
                Questions ({questions.length})
              </h3>
              <Button
                type="button"
                onClick={addQuestion}
                size="sm"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Question
              </Button>
            </div>

            {questions.map((question, index) => (
              <Card key={index} className="border shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    Question {index + 1}
                  </CardTitle>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(index)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>

                <CardContent className="space-y-5">
                  <div>
                    <Label>Question Text *</Label>
                    <Textarea
                      value={question.questionText}
                      onChange={(e) =>
                        updateQuestion(index, "questionText", e.target.value)
                      }
                      placeholder="Write a clear question here..."
                      className="mt-1.5 min-h-[90px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(["A", "B", "C", "D"] as const).map((opt) => (
                      <div key={opt}>
                        <Label>Option {opt}</Label>
                        <Input
                          value={
                            question[`option${opt}` as keyof Question] as string
                          }
                          onChange={(e) =>
                            updateQuestion(
                              index,
                              `option${opt}` as keyof Question,
                              e.target.value,
                            )
                          }
                          placeholder={`Option ${opt} text...`}
                          className="mt-1.5"
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label>Correct Answer *</Label>
                    <RadioGroup
                      value={question.correctAnswer}
                      onValueChange={(val) =>
                        updateQuestion(
                          index,
                          "correctAnswer",
                          val as "A" | "B" | "C" | "D",
                        )
                      }
                      className="flex flex-wrap gap-8 mt-3"
                    >
                      {["A", "B", "C", "D"].map((opt) => (
                        <div key={opt} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt} id={`q${index}-${opt}`} />
                          <Label
                            htmlFor={`q${index}-${opt}`}
                            className="cursor-pointer font-medium"
                          >
                            Option {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter className="p-6 border-t bg-muted/30 mt-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Quiz..." : "Create Quiz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
