import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Header from "./Header";

type MessagesType = Awaited<ReturnType<typeof getMessages>>;

const Layout = ({
  children,
  messages,
}: {
  children: ReactNode;
  messages: MessagesType;
}) => {
  return (
    <NextIntlClientProvider messages={messages}>
      <div className="relative flex flex-col pt-12">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </NextIntlClientProvider>
  );
};

export default Layout;
