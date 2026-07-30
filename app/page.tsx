import Dashboard from "@/components/Dashboard";
import { getDashboardData } from "@/lib/data";

export const revalidate = 86400;

export default async function Page() {
  const countries = await getDashboardData();
  return <Dashboard countries={countries} />;
}
