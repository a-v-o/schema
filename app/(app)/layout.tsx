import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { getProjects } from "@/db";
import BackButton from "@/components/BackButton";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const projectsArray = await getProjects();
  return (
    <section className="w-full flex">
      <SidebarProvider>
        <AppSidebar projectsArray={projectsArray} />
        <SidebarTrigger className="absolute md:relative" />
        <BackButton />
        <div className="w-full flex justify-start px-6">{children}</div>
      </SidebarProvider>
    </section>
  );
}
