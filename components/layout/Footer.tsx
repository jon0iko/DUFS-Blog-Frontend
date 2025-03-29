import Link from 'next/link';
import { navigation, socialLinks } from '@/data/dummy-data';
import { X } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-200 dark:border-gray-700 pb-8">
          <div className=''>
            <div className="flex items-center space-x-2 mb-4">
              <X className="h-5 w-5" />
              <span className="text-sm">@dufsblog</span>
            </div>
            {/* <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg">
              Notebook is a daily, international film publication. Our mission is to guide film lovers searching, lost
              or adrift in an overwhelming sea of content. We offer text, images, sounds and video as critical maps, 
              passways and illuminations to the worlds of contemporary and classic film.
            </p> */}
            <div className="space-x-4 mt-4">
            <Link href={'https://dufs.org'} className="text-sm text-black dark:text-gray-400 hover:underline">
              DUFS
            </Link>
            <Link href={'https://dufs.org'} className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              IIUSFF
            </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-4">Contact</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                If you're interested in contributing to the blog, please see our{' '}
                <Link href="/pitching-guidelines" className="font-bold hover:underline">
                  Contribution Section.
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-6">
          <nav className="mb-4 md:mb-0">
            <ul className="flex flex-wrap gap-4 text-sm">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="flex space-x-4">
            {socialLinks.map((link) => (
              <Link
                key={link.platform}
                href={link.href}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={`Visit our ${link.platform} page`}
              >
                <div className="w-5 h-5">
                  {/* SVG icons rendered here similar to sidebar */}
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Dhaka University Film Society. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}