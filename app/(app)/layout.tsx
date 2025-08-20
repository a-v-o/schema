import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="w-full flex">
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger className="absolute md:relative" />
        <div className="w-full flex justify-start px-6">{children}</div>
      </SidebarProvider>
    </section>
  );
}
