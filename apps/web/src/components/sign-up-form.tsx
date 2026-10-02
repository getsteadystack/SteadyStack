import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { recordReferralSignup } from "@/actions/referrals";
import { Gift, X } from "lucide-react";

import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function SignUpForm({
  onSwitchToSignIn,
  deal: propDeal,
  plan: propPlan,
}: {
  onSwitchToSignIn: () => void;
  deal?: string;
  plan?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deal = propDeal || searchParams?.get("deal");
  const plan = propPlan || searchParams?.get("plan");
  const [isPending, setIsPending] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check URL query param ?ref=
    const queryRef = searchParams?.get("ref");
    if (queryRef) {
      setRefCode(queryRef);
      return;
    }

    // 2. Fallback to steadystack_ref cookie
    if (typeof document !== "undefined") {
      const match = document.cookie.split("; ").find((row) => row.startsWith("steadystack_ref="));
      if (match) {
        try {
          const cookieVal = decodeURIComponent(match.split("=")[1]);
          const parsed = JSON.parse(cookieVal);
          if (parsed?.code) {
            setRefCode(parsed.code);
          }
        } catch {
          const raw = match.split("=")[1];
          if (raw) setRefCode(raw);
        }
      }
    }
  }, [searchParams]);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      setIsPending(true);
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: async (ctx: any) => {
            const userId = ctx?.data?.user?.id || ctx?.data?.id;
            if (refCode) {
              try {
                await recordReferralSignup(refCode, userId, value.email);
              } catch (e) {
                console.error("Failed to attribute referral:", e);
              }
              // Clear cookie upon successful registration
              if (typeof document !== "undefined") {
                document.cookie = "steadystack_ref=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              }
            }

            if (deal) {
              router.push(`/dashboard/settings?tab=billing&deal=${encodeURIComponent(deal)}`);
            } else if (plan) {
              router.push(`/dashboard/settings?tab=billing&plan=${encodeURIComponent(plan)}`);
            } else {
              router.push("/dashboard");
            }
            toast.success("Sign up successful");
          },
          onError: (error) => {
            setIsPending(false);
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {refCode && (
        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-mono">
          <div className="flex items-center gap-2">
            <Gift className="size-4 shrink-0 text-primary animate-pulse" />
            <span>
              Referred by partner code{" "}
              <strong className="font-bold underline decoration-dotted">{refCode}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setRefCode(null);
              if (typeof document !== "undefined") {
                document.cookie = "steadystack_ref=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              }
            }}
            className="text-primary/60 hover:text-primary transition-colors p-1 rounded hover:bg-primary/20"
            title="Remove referral code"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className="text-[13px] font-semibold text-foreground/80"
                >
                  Name
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="John Doe"
                  className="bg-white/5 border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-12 px-4 shadow-sm"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500 font-medium text-xs mt-1">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className="text-[13px] font-semibold text-foreground/80"
                >
                  Email
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="name@company.com"
                  className="bg-white/5 border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-12 px-4 shadow-sm"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500 font-medium text-xs mt-1">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className="text-[13px] font-semibold text-foreground/80"
                >
                  Password
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-12 px-4 shadow-sm"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500 font-medium text-xs mt-1">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full bg-primary text-black font-semibold rounded-full hover:bg-primary/90 transition-all border border-transparent h-12 mt-6 shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:shadow-[0_0_20px_rgba(57,255,20,0.3)]"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="text-center pt-2">
        <span className="text-sm text-muted-foreground font-medium">Already have an account? </span>
        <Button
          variant="link"
          onClick={onSwitchToSignIn}
          className="text-primary hover:text-primary/90 font-semibold text-sm h-auto p-0"
        >
          Log in
        </Button>
      </div>
    </div>
  );
}
