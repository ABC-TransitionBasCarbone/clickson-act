import { getMessages } from "next-intl/server";
import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/(layout)/Layout";
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
  const messages = await getMessages();

  return (
    <html data-theme="light">
      <body>
        <UserProvider>
          <Layout messages={messages}>{children}</Layout>
        </UserProvider>
      </body>
    </html>
  );
}
