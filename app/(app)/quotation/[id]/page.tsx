import QuotationPage from "@/components/QuotationPage";
import { getMaterials, getProject, getTasks } from "@/db";

export default async function Quotation({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  const tasksResult = await getTasks(id);
  const tasks = tasksResult.filter((task) => {
    return task.name != "None (Start of project)";
  });
  const promise = tasks.map(async (task) => {
    const materials = await getMaterials(task.id);
    const materialsCost = materials.map((material) => {
      return material.price * material.quantity;
    });
    const totalCost = materialsCost.reduce((totalCost, currentCost) => {
      return totalCost + currentCost;
    }, 0);
    return {
      taskName: task.name,
      materials: materials,
      cost: totalCost,
    };
  });

  const tasksWithMaterials = await Promise.all(promise);

  return (
    <QuotationPage projectName={project.name} quotes={tasksWithMaterials} />
  );
}
