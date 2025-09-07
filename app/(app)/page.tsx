import HomePage from "@/components/HomePage";
import { getRecentProjects } from "@/db";

export default async function Home() {
  const projectsArray = await getRecentProjects();

  return (
    <div className="w-full flex flex-col gap-16">
      <HomePage projectsArray={projectsArray} />
    </div>
  );
}
