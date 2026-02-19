import { serverStrapiAPI } from '@/lib/server-api'
import BrowseContentSection from './BrowseContentSection'

export default async function BrowseContentSectionWrapper() {
  try {
    const categoriesResponse = await serverStrapiAPI.getCategories()
    const categories = categoriesResponse.data || []

    if (categories.length === 0) {
      return (
        <section className="py-12 md:py-16 bg-background">
          <div className="container">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
              <h2 className="text-xl font-bold mb-2">No Categories Available</h2>
              <p className="text-gray-600 dark:text-gray-400">Add some categories in Strapi CMS to display articles by category.</p>
            </div>
          </div>
        </section>
      )
    }

    return <BrowseContentSection initialCategories={categories} />
  } catch (error) {
    console.error('Failed to load categories:', error)
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="container">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold mb-2 text-red-900 dark:text-red-200">Error Loading Categories</h2>
            <p className="text-gray-700 dark:text-gray-300">Failed to connect to the server. Please check your connection.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </div>
      </section>
    )
  }
}
