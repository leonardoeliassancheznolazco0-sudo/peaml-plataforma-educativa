import Sidebar from "./Sidebar";
import Head from "next/head";

export default function DashboardLayout({ children, title = "PEAML" }) {
  return (
    <>
      <Head>
        <title>{title} | PEAML</title>
      </Head>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </>
  );
}