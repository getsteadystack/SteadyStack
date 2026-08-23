"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { CommandItem } from "../command-item";
import { useCommandPalette } from "../use-command-palette";
import { Sun, Moon, BookOpen, HelpCircle, LogOut } from "lucide-react";
import { toast } from "@/components/ui/sonner";

export function ActionCommands() {
  const router = useRouter();
  const themeContext = useTheme();
  const { close } = useCommandPalette();

  const theme = themeContext?.theme || "dark";
  const setTheme = themeContext?.setTheme || (() => {});

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    toast.success(`Switched to ${theme === "dark" ? "light" : "dark"} mode`);
    close();
  };

  const handleSignOut = () => {
    // Navigate to sign out page
    router.push("/api/auth/sign-out");
    close();
  };

  return (
    <Command.Group heading="Actions">
      <CommandItem
        icon={theme === "dark" ? Sun : Moon}
        label={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        shortcut="⌘T"
        onSelect={toggleTheme}
      />
      <CommandItem
        icon={BookOpen}
        label="View Documentation"
        onSelect={() => {
          window.open("https://docs.steadystack.dev", "_blank");
          close();
        }}
      />
      <CommandItem
        icon={HelpCircle}
        label="Contact Support"
        onSelect={() => {
          window.open("mailto:workinbox69@gmail.com", "_blank");
          close();
        }}
      />
      <CommandItem icon={LogOut} label="Sign Out" onSelect={handleSignOut} />
    </Command.Group>
  );
}
