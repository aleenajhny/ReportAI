import { AuthCard } from "@/components/auth-card";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <AuthCard mode="forgot" />
    </main>
  );
}
