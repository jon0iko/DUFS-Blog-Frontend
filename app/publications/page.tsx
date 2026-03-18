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
  <PublicationsSection publications={publications} />
  );
}
