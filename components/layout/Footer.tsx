'use client'
import Link from 'next/link';
import { socialLinks } from '@/data/dummy-data';
import {Badge} from '@/components/ui/badge';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-800 py-8">
      <div className="container">
        <div className="grid grid-cols-1 place-items-center md:grid-cols-3 gap-8 border-b border-gray-200 dark:border-gray-700 pb-8">
          <div className='flex flex-col items-center text-center'>
            <div className='space-x-4'>
            <Link href={'https://dufs.org'} className="text-sm text-black dark:text-gray-400 hover:underline">
            <Badge>DUFS</Badge>
            </Link>
            <Link href={'https://iiusff.dufs.org'} className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            <Badge>IIUSFF</Badge>
            </Link>
            </div>
          </div>

          <div className='text-center'>
          <p className="text-sm font-light text-gray-600 dark:text-gray-200">
                If you&apos;re interested in contributing to the blog,<br></br> please see our{' '}
                <Link href="/pitching-guidelines" className="font-bold hover:underline">
                  Contribution Section.
                </Link>
              </p>
          </div>
          
          <div>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <Link
                  key={link.platform}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Visit our ${link.platform} page`}
                >
                  {link.icon ? (
                      <Image
                        src={link.icon} alt={`${link.platform} icon`}
                        width={24} height={24} className="h-6 w-6"
                      />
                  ) : (
                    <span className='uppercase text-xs'>{link.platform}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
        

        
        <div className="mt-4 text-center text-xs font-light text-gray-800 dark:text-gray-200">
          <p>© {new Date().getFullYear()} Dhaka University Film Society. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}