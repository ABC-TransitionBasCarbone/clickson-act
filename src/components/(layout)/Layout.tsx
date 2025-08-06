import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Header from "./Header/Header";
import Footer from "./Footer";
import { ToastProvider } from "../../context/ToastContext";

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
      <ToastProvider>
        <div className="relative flex min-h-screen flex-col pt-20">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </ToastProvider>
    </NextIntlClientProvider>
  );
};

export default Layout;
