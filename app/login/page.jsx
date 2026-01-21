"use client";
import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!validateEmail(email)) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Invalid input",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Authentication Failed",
          description: "Incorrect credentials. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Poll getSession for a short period so the session has time to initialize
      let session = await getSession();
      const maxAttempts = 10;
      let attempt = 0;

      while (!session && attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 250));
        session = await getSession();
        attempt += 1;
      }

      const role = session?.user?.role;
      if (role === "ADMIN") {
        router.push("/admin-dashboard");
      } else if (role === "STUDENT") {
        router.push("/student-dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Login error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

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
            Welcome back
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCredentialsLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  disabled={isLoading}
                  className="border-slate-200 focus-visible:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  type="password"
                  required
                  disabled={isLoading}
                  className="border-slate-200 focus-visible:ring-indigo-500"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>
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
          Don&apos;t have an account?
          <Link
            href="/signup"
            className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
