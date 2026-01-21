import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
        const session = await getServerSession(authOptions);
        const { id: quizId } = await params;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { answers } = await req.json();
        // quizId from route params

        // Fetch quiz with questions
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: true,
            },
        });

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        // Calculate score
        let correctCount = 0;
        const details = quiz.questions.map((question) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            if (isCorrect) correctCount++;

            return {
                questionId: question.id,
                questionText: question.questionText,
                userAnswer,
                userAnswerText: question[`option${userAnswer}` as keyof typeof question],
                correctAnswer: question.correctAnswer,
                correctAnswerText: question[`option${question.correctAnswer}` as keyof typeof question],
                correct: isCorrect,
            };
        });

        const score = Math.round((correctCount / quiz.questions.length) * 100);

        // Save result
        await prisma.quizResult.create({
            data: {
                userId: session.user.id,
                quizId: quiz.id,
                score,
                answers: answers,
            },
        });

        return NextResponse.json({
            score,
            correctCount,
            totalQuestions: quiz.questions.length,
            details,
        });
    } catch (error) {
        console.error("QUIZ_SUBMIT_ERROR", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
