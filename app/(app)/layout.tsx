import "@/app/theme-transition.css";   // the hex pattern + view transitions
import "@/app/dialog-styles.css";      // dialog sheet for tag triggers, etc.
import { ThemeProvider } from "@/components/theme-provider";
import { FallbackThemeToggle } from "@/components/fallback-theme-toggle";
import { Toaster } from "@/components/ui/toaster";

export default function AppAreaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <head>
        {/* view transitions only for the app area */}
        <meta name="view-transition" content="same-origin" />
      </head>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <FallbackThemeToggle />
        {children}
        <Toaster />
      </ThemeProvider>
    </>
  );
}
