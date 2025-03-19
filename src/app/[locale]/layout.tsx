import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Layout from "@/components/(layout)/Layout";
import { locales } from "@/i18n/config";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return <Layout messages={messages}>{children}</Layout>;
}
