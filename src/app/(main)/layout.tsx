import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { redirect } from "next/navigation";
import { getUserData } from "@/lib/data";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserData();
  if (!user) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
