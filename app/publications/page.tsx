import PublicationsSection from '../../components/home/PublicationsSection';
import { serverStrapiAPI } from '@/lib/server-api';
import type { Publication } from '@/types';

export default async function PublicationsPage() {
  let publications: Publication[] = [];

  try {
    const response = await serverStrapiAPI.getPublications();
    publications = response.data.filter((item) => !item.Hide);
  } catch (error) {
    console.error('Failed to load publications page data:', error);
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background patterns */}
      <div
        className="pointer-events-none absolute -inset-52 select-none z-0 dark:hidden"
        style={{ backgroundImage: "url(/images/bgpaper.jpg)", backgroundRepeat: "repeat" }}
      />
      <div
        className="bg-pattern-dark pointer-events-none absolute -inset-52 hidden select-none z-0 dark:block"
        style={{
          backgroundImage: "url(/images/bgpaper_dark.jpg)",
          backgroundRepeat: "repeat",
          backgroundSize: "1667px 1200px",
        }}
      />
      
      <div className="relative z-10 pt-10">
        <PublicationsSection publications={publications} />
      </div>
    </div>
  );
}
