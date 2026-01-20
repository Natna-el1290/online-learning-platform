import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SignUpForm from "@/app/ui/SignUpForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <Card className="w-full max-w-md border-indigo-100 shadow-xl dark:border-indigo-900">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-indigo-600 p-3 text-white">
              <GraduationCap className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your information to get started today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignUpForm />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500 dark:bg-slate-950">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="border-slate-200 hover:bg-slate-50 bg-transparent"
            >
              Google
            </Button>
            <Button
              variant="outline"
              className="border-slate-200 hover:bg-slate-50 bg-transparent"
            >
              GitHub
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-1 text-sm text-slate-500">
          Already have an account?
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
