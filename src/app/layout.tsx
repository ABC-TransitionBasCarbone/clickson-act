import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";

const manrope = Manrope({
  subsets: ["latin", "latin-ext", "greek"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClicksOnAct Calculator",
  description: "ClicksOnAct Calculator",
  icons: {
    icon: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html data-theme="light">
      <body className={manrope.className}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
