import { LoginForm } from "@/components/admin/LoginForm";
import { HexaLogo } from "@/components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Login | HexaNovaUpdates" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand/5 via-background to-muted/20 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <HexaLogo size={52} />
          </div>
          <h1 className="text-2xl font-extrabold">
            <span className="text-brand">Hexa</span>Nova<span className="text-muted-foreground font-normal">Updates</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Admin Panel — Sign in to continue</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
