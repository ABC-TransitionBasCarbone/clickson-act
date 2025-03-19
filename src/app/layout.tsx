import { getMessages } from "next-intl/server";
import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/(layout)/Layout";

export const metadata: Metadata = {
  title: "ClicksOnAct Calculator",
  description: "ClicksOnAct Calculator",
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
        <Layout messages={messages}>{children}</Layout>
      </body>
    </html>
  );
}
