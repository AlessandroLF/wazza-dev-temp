import "@/app/globals.css";
import { Urbanist } from "next/font/google";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-urbanist",
});

export const metadata = {
  title: "wazzap!!",
  description: "Landing + app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={urbanist.variable}>
      <body className={`${urbanist.className} min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
