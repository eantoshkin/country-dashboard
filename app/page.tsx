import Dashboard from "@/components/Dashboard";
import { getDashboardData, getRankingData } from "@/lib/data";

export const revalidate = 86400;

export default async function Page() {
  const [countries, ranking] = await Promise.all([
    getDashboardData(),
    getRankingData(),
  ]);
  return <Dashboard countries={countries} ranking={ranking} />;
}
