import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";

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
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
