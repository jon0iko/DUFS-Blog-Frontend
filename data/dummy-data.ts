import { Article, NavItem, SocialLink } from "@/types";

export const navigation: NavItem[] = [
  { title: 'Log In', href: '/login' },
  { title: 'Home', href: '/' },
  { title: 'Option1', href: '/Option' },
  { title: 'Option2', href: '/Option' },
  { title: 'Option3', href: '/Option' },
  { title: 'Option4', href: '/Option' },
  { title: 'Option5', href: '/Option' },
  { title: 'Option6', href: '/Option' },
];

export const socialLinks: SocialLink[] = [
  { platform: 'youtube', href: 'https://youtube.com/@dufsbfbv', icon: 'images/social/youtube.svg' },
  { platform: 'twitter', href: 'https://x.com/DUFS_DU', icon: '/images/social/x.svg' },
  { platform: 'instagram', href: 'https://instagram.com/dhakauniversityfilmsociety', icon: '/images/social/instagram.svg' },
  { platform: 'facebook', href: 'https://facebook.com/dufs.du', icon: '/images/social/facebook.svg' },
];

export const featuredArticles: Article[] = [
  {
    id: '1',
    title: 'The Traveler and the World: Miguel Gomes\'s "Grand Tour"',
    isBengali: false,
    slug: 'traveler-world-miguel-gomes-grand-tour',
    excerpt: 'The celebrated travelogue dresses the present up as the past, evoking the unreality of a fading colonial world.',
    imageSrc: '/images/hero.jpg',
    category: 'Category',
    author: {
      name: 'Robert Rubsam',
    },
    publishedAt: '27 MAR 2025',
  },
  {
    id: '2',
    title: 'Rushes | Hamdan Ballal Attacked, Miami Beach Mayor Relents, White Roadshow Bankrupt',
    isBengali: false,
    slug: 'rushes-hamdan-ballal-miami-beach',
    excerpt: 'The latest essential film news, articles, sounds, videos, and more from the film world.',
    imageSrc: '/images/hero.jpg',
    category: 'CategoryA',
    author: {
      name: 'Notebook',
    },
    publishedAt: '26 MAR 2025',
  },
  {
    id: '3',
    title: 'Sympathy for the Robot',
    isBengali: false,
    slug: 'sympathy-for-the-robot',
    excerpt: 'Rashidat Newsome designed an artificial intelligence to help humans decolonize their minds. What could go wrong?',
    imageSrc: '/images/hero.jpg',
    category: 'CategoryB',
    author: {
      name: 'Jillian Steinhauer',
    },
    publishedAt: '25 MAR 2025',
  },
  {
    id: '4',
    title: 'In the Hot Seat: On the 4D Experience',
    isBengali: false,
    slug: 'hot-seat-4d-experience',
    excerpt: 'The promise of a new sensory cinema calls upon almost every trick from over a half-century of big-screen novelties.',
    imageSrc: '/images/hero.jpg',
    category: 'CategoryC',
    author: {
      name: 'Gabriel Winslow-Yost',
    },
    publishedAt: '23 MAR 2025',
  },
];

export const editorsChoiceArticles: Article[] = [
  {
    id: '5',
    title: 'সবুজ পেশার দেশ: ভিয়েতনাম',
    isBengali: true,
    slug: 'vietnam-green-profession',
    excerpt: 'A detailed look at Vietnam\'s emerging environmental practices in film production.',
    imageSrc: '/images/hero.jpg',
    category: 'Editors Choice',
    author: {
      name: 'DUFS_ADMIN',
    },
    publishedAt: 'NOVEMBER 24, 2023',
  },
  {
    id: '6',
    title: '"ভাষা তো সত্যজিৎ রায়ের নাম জানতেন"—সত্যজিৎ রায়',
    isBengali: true,
    slug: 'satyajit-ray-language',
    excerpt: 'Exploring the linguistic contributions of Satyajit Ray to cinema.',
    imageSrc: '/images/hero.jpg',
    category: 'Editors Choice',
    author: {
      name: 'DUFS_ADMIN',
    },
    publishedAt: 'MAY 31, 2023',
  },
  {
    id: '7',
    title: 'বাংলাদেশে ওটিটি প্ল্যাটফর্ম: বাস্তবতার আলোকে নিরীক্ষা',
    isBengali: true,
    slug: 'bangladesh-ott-platforms',
    excerpt: 'An examination of OTT platforms in Bangladesh and their impact on local cinema.',
    imageSrc: '/images/hero.jpg',
    category: 'Editors Choice',
    author: {
      name: 'DUFS_ADMIN',
    },
    publishedAt: 'SEPTEMBER, 27, 2022',
  },
  {
    id: '8',
    title: 'আনুপ রাজ্জাক: টিপিকাল এর যুবকের বাংলা জয়',
    isBengali: true,
    slug: 'anup-razzak-bengali-triumph',
    excerpt: 'A profile of Anup Razzak and his contribution to Bengali cinema.',
    imageSrc: '/images/hero.jpg',
    category: 'Editors Choice',
    author: {
      name: 'ADMIN',
    },
    publishedAt: 'JULY 11, 2023',
  },
];

export const heroArticle: Article = {
  id: '0',
  title: 'থ্রো আওয়ে ইয়োর বুকস: কৈশোর ও আধুনিকতার দ্বন্দ্ব',
  isBengali: true,
  slug: 'traveler-and-world-main',
  excerpt: '',
  imageSrc: '/images/hero.jpg',
  category: 'Feature',
  author: {
    name: 'Miguel Gomes',
  },
  publishedAt: '28 MAR 2025',
};