import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  onLogin,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }

    // Simple mock authentication
    if (isRegistering) {
      toast.success(
        "Account created successfully! You are now logged in.",
      );
    } else {
      toast.success("Logged in successfully!");
    }
    onLogin(email);
    setEmail("");
    setPassword("");
    setIsRegistering(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onClose();
        if (!open) setIsRegistering(false);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isRegistering ? "Create an Account" : "Login"}
          </DialogTitle>
          <DialogDescription>
            {isRegistering
              ? "Create a new account to save and manage your trip plans"
              : "Sign in to save and manage multiple trip plans"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {isRegistering ? "Register" : "Login"}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-[#004DB6] hover:underline"
            >
              {isRegistering
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Demo mode: Use any email/password to{" "}
            {isRegistering ? "register" : "login"}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}