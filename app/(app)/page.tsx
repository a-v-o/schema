import HomePage from "@/components/HomePage";
import { getProjects } from "@/db";

export default async function Home() {
  const projectsArray = await getProjects();

  return (
    <div className="w-full flex flex-col gap-16">
      <HomePage projectsArray={projectsArray} />
    </div>
  );
}
