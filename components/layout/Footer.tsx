'use client'
import Link from 'next/link';
import { socialLinks } from '@/data/dummy-data';
import {Badge} from '@/components/ui/badge';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary dark:bg-brand-black py-8">
      <div className="container">
        <div className="grid grid-cols-1 place-items-center md:grid-cols-3 gap-8 border-b border-border pb-8">
          <div className='flex flex-col items-center text-center'>
            <div className='space-x-4'>
            <Link href={'https://dufs.org'} className="text-sm text-foreground hover:underline">
            <Badge>DUFS</Badge>
            </Link>
            <Link href={'https://iiusff.dufs.org'} className="text-sm text-muted-foreground mt-4">
            <Badge>IIUSFF</Badge>
            </Link>
            </div>
          </div>

          <div className='text-center md:text-left'>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Address:</span> 1st floor, TSC, University of Dhaka<br />
            Dhaka 1000, Bangladesh.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-semibold text-foreground">Phone:</span> +880 1558641981
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-semibold text-foreground">Email:</span>{' '}
            <a href="mailto:info@dufs.org" className="hover:underline">info@dufs.org</a>
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
        

        
        <div className="mt-4 text-center text-xs font-light text-muted-foreground">
          <p>© {new Date().getFullYear()} Dhaka University Film Society. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}