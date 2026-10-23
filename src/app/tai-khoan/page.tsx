import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AccountView from "@/components/account/AccountView";

export const metadata: Metadata = {
  title: "Tài khoản — KhaiHoanShop",
  description: "Quản lý thông tin tài khoản và đơn hàng của bạn tại KhaiHoanShop.",
};

export default function AccountPage() {
  return (
    <>
      <Header currentPath="/tai-khoan" />
      <main
        id="main-content"
        className="py-10 lg:py-16"
      >
        <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
          <h1 className="mb-8 font-display text-3xl font-semibold leading-tight text-ink md:text-title">
            Tài khoản của tôi
          </h1>
          <AccountView />
        </div>
      </main>
      <Footer />
    </>
  );
}
