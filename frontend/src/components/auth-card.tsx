"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { WandSparkles } from "lucide-react";
import { FirebaseConfigWarning } from "@/components/firebase-config-warning";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

export function AuthCard({ mode }: { mode: "login" | "signup" | "forgot" }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";
  const configured = isFirebaseConfigured();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) return;

    setIsSubmitting(true);
    setMessage("");
    try {
      const auth = getFirebaseAuth();
      if (isForgot) {
        await sendPasswordResetEmail(auth, email);
        setMessage("Password reset email sent.");
        return;
      }

      if (isSignup) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (fullName.trim()) {
          await updateProfile(credential.user, { displayName: fullName.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <WandSparkles className="h-5 w-5" />
        </div>
        <CardTitle>{isForgot ? "Reset password" : isSignup ? "Create your account" : "Welcome back"}</CardTitle>
        <p className="text-sm text-muted-foreground">Firebase Authentication powers secure sign up, login, and password reset.</p>
      </CardHeader>
      <CardContent>
        {!configured ? <FirebaseConfigWarning /> : null}
        <form className="mt-4 space-y-3" onSubmit={submit}>
          {isSignup ? <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Full name" autoComplete="name" /> : null}
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" autoComplete="email" required />
          {!isForgot ? (
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
            />
          ) : null}
          <Button className="w-full" type="submit" disabled={!configured || isSubmitting}>
            {isSubmitting ? "Working..." : isForgot ? "Send reset link" : isSignup ? "Sign up" : "Log in"}
          </Button>
        </form>
        {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
          <Link href="/login">Login</Link>
          <Link href="/signup">Sign up</Link>
          <Link href="/forgot-password">Forgot?</Link>
        </div>
      </CardContent>
    </Card>
  );
}
