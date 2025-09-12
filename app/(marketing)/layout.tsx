import { ThemeProvider } from "@/components/theme-provider";

// No <html>/<body> here; only the root layout renders those.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  // Keep a simple theme context (no floating toggle, no extra CSS)
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
