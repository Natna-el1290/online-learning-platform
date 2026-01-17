"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"

export default function QuizPage({ params }: { params: { id: string } }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)

  const quiz = {
    id: params.id,
    title: "HTML & CSS Basics Quiz",
    courseTitle: "Web Development Fundamentals",
    courseId: 1,
    questions: [
      {
        id: 1,
        question: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "High Tech Modern Language",
          "Home Tool Markup Language",
          "Hyperlinks and Text Markup Language",
        ],
        correctAnswer: 0,
      },
      {
        id: 2,
        question: "Which CSS property is used to change the text color of an element?",
        options: ["text-color", "font-color", "color", "text-style"],
        correctAnswer: 2,
      },
      {
        id: 3,
        question: "Which HTML tag is used to define an internal style sheet?",
        options: ["<css>", "<script>", "<style>", "<link>"],
        correctAnswer: 2,
      },
      {
        id: 4,
        question: "What is the correct CSS syntax to make all <p> elements bold?",
        options: ["p {text-weight: bold;}", "p {font-weight: bold;}", "<p style='bold'>", "p {text-style: bold;}"],
        correctAnswer: 1,
      },
    ],
  }

  const handleAnswerSelect = (questionIndex: number, answerIndex: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex,
    })
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const calculateScore = () => {
    let correct = 0
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] !== undefined && Number.parseInt(selectedAnswers[index]) === question.correctAnswer) {
        correct++
      }
    })
    return {
      correct,
      total: quiz.questions.length,
      percentage: Math.round((correct / quiz.questions.length) * 100),
    }
  }

  const score = showResults ? calculateScore() : null

  if (showResults && score) {
    const passed = score.percentage >= 70

    return (
      <div className="min-h-screen">
        <Navbar />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4">
                {passed ? (
                  <CheckCircle2 className="w-20 h-20 text-green-500" />
                ) : (
                  <XCircle className="w-20 h-20 text-destructive" />
                )}
              </div>
              <CardTitle className="text-3xl">{passed ? "Congratulations!" : "Keep Learning!"}</CardTitle>
              <CardDescription className="text-lg">
                {passed ? "You've passed the quiz!" : "You didn't pass this time, but don't give up!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-5xl font-bold text-primary mb-2">{score.percentage}%</div>
                <p className="text-muted-foreground">
                  You got {score.correct} out of {score.total} questions correct
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retake Quiz
                </Button>
                <Button asChild>
                  <Link href={`/courses/${quiz.courseId}`}>Back to Course</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            href={`/courses/${quiz.courseId}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to {quiz.courseTitle}
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardDescription>
                Question {currentQuestion + 1} of {quiz.questions.length}
              </CardDescription>
              <div className="text-sm text-muted-foreground">
                {Object.keys(selectedAnswers).length}/{quiz.questions.length} answered
              </div>
            </div>
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{question.question}</h3>

              <RadioGroup
                value={selectedAnswers[currentQuestion]}
                onValueChange={(value) => handleAnswerSelect(currentQuestion, value)}
              >
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between pt-6 border-t">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
                Previous
              </Button>

              {currentQuestion === quiz.questions.length - 1 ? (
                <Button onClick={handleSubmit} disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}>
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={handleNext}>Next</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
