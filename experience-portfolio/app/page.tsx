import PortfolioExperience from '@/components/PortfolioExperience'
import { getPortfolioStore } from '@/lib/portfolio-data'

export default async function Home() {
  const store = await getPortfolioStore()
  return <PortfolioExperience content={store.content} />
}
