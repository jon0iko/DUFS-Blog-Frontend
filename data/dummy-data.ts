import { Article, categories, NavItem, SocialLink } from "@/types";

export const navigation: NavItem[] = [
  { title: 'Log In', href: '/login' },
  { title: 'Home', href: '/' },
  { title: 'Browse', href: '/browse' },
  { title: 'Option1', href: '/Option' },
  { title: 'Option2', href: '/Option' },
  { title: 'Option3', href: '/Option' },
  { title: 'Option4', href: '/Option' },
  { title: 'Option5', href: '/Option' },
];

export const category: categories[] = [
  { Name: 'সিনেমালাপ', slug: '/সিনেমালাপ' },
  { Name: 'আলাপ-সালাপ', slug: '/আলাপ-সালাপ' },
  { Name: 'চিত্রনাট্য', slug: '/চিত্রনাট্য' },
  { Name: 'কারিগর', slug: '/কারিগর'},
  { Name: 'বিবিধ', slug: '/বিবিধ'},
  { Name: 'Reviews', slug: '/reviews'},
  { Name: 'Interviews', slug: '/interviews'},
  { Name: 'Features', slug: '/features'}
]

export const socialLinks: SocialLink[] = [
  { platform: 'youtube', href: 'https://youtube.com/@dufsbfbv', icon: '/images/social/youtube.svg' },
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
    content: `
      <p>Miguel Gomes's <em>Grand Tour</em> begins with a dreamy scene: a man in a white suit sits on a ship departing from Asia, writing a letter to his sister about the sights he has seen.</p>
      
      <p>The film follows Edward Young (Gonçalo Waddington), a globe-trotting Englishman in the late 19th century who travels from Ceylon to Goa, Calcutta, Macao, Hong Kong, and Tokyo. Except the film is set in the present day—the locals Edward meets are present-day inhabitants of these locations; the traffic we hear off-screen is modern.</p>
      
      <h2>The Colonial Gaze</h2>
      
      <p>What Gomes achieves with this anachronistic approach is a thoughtful meditation on the remnants of colonialism and how the Western gaze continues to shape our perception of the East. Edward's journey becomes a metaphor for the way Western culture still views these places through the lens of exoticism and otherness.</p>
      
      <p>The cinematography by Sayombhu Mukdeeprom (who also shot <em>Call Me by Your Name</em>) is breathtaking, using 16mm film to create images that feel both contemporary and like faded photographs from a bygone era. The warm, grainy texture enhances the sense of nostalgia and unreality that permeates the film.</p>
      
      <blockquote>"I do not photograph the Orient, but only what remains of it." — Miguel Gomes</blockquote>
      
      <h2>Performance as History</h2>
      
      <p>Waddington's performance as Edward is crucial to the film's success. He embodies the colonial traveler with just enough self-awareness to make us question his perspective without turning him into a simple caricature. His letters home, read in voiceover, are filled with observations that reveal both wonder and the reductive categorizations typical of colonial writing.</p>
      
      <p>In one remarkable sequence in Calcutta, Edward attends what appears to be a traditional dance performance. The camera stays fixed on his face as he watches, and we only hear the music and performance. This choice forces us to confront how the colonial gaze consumes cultural expression as entertainment, divorced from its context and meaning.</p>
      
      <h2>Time and Memory</h2>
      
      <p>Throughout <em>Grand Tour</em>, Gomes plays with our sense of time. The film is divided into chapters corresponding to Edward's destinations, each with its own visual style and rhythm. As the journey progresses, the distinction between past and present becomes increasingly blurred, suggesting that the legacy of colonialism continues to shape these spaces and relationships.</p>
      
      <p>The film's stunning final act in Tokyo represents the most radical departure, as Edward's narrative begins to fragment and the film takes on a dreamlike quality that questions everything we've seen before. It's a bold move that transforms what might have been simply an interesting formal exercise into something more profound and unsettling.</p>
    `,
    imageSrc: '/images/hero.jpg',
    category: 'features',
    author: {
      name: 'Robert Rubsam',
      avatar: 'https://via.placeholder.com/80?text=RR',
    },
    publishedAt: '27 MAR 2025',
    readTime: 8,
    viewCount: 1243,
    tags: ['cinema', 'film-review', 'colonialism', 'miguel-gomes'],
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Rushes | Hamdan Ballal Attacked, Miami Beach Mayor Relents, White Roadshow Bankrupt',
    isBengali: false,
    slug: 'rushes-hamdan-ballal-miami-beach',
    excerpt: 'The latest essential film news, articles, sounds, videos, and more from the film world.',
    imageSrc: '/images/hero.jpg',
    category: 'reviews',
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
    category: 'interviews',
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
    category: 'reviews',
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
    excerpt: 'ভিয়েতনামের চলচ্চিত্র শিল্পে পরিবেশবান্ধব অনুশীলনের একটি বিস্তারিত অন্বেষণ।',
    content: `
      <p>ভিয়েতনাম এর চলচ্চিত্র শিল্প সম্প্রতি বিশ্বের অন্যতম দ্রুত বর্ধনশীল একটি শিল্প হয়ে উঠেছে। তবে এই অগ্রগতির সাথে সাথে তারা পরিবেশগত দায়িত্বও গুরুত্বের সাথে বিবেচনা করছে।</p>
      
      <h2>সবুজ চলচ্চিত্র নির্মাণ</h2>
      
      <p>ভিয়েতনামে চলচ্চিত্র নির্মাতারা একটি পরিবেশবান্ধব পদ্ধতি গ্রহণ করছেন যা "সবুজ চলচ্চিত্র নির্মাণ" নামে পরিচিত। এই পদ্ধতিতে, নির্মাণ দলগুলি প্লাস্টিকের ব্যবহার কমানো, পুনর্ব্যবহারযোগ্য সেট সামগ্রী ব্যবহার এবং কার্বন পদচিহ্ন কমানোর জন্য স্থানীয় সংস্থাগুলির সাথে অংশীদারি করার মতো সক্রিয় পদক্ষেপ নিচ্ছে।</p>
      
      <p>হানয়ের ফিল্ম স্টুডিওগুলির একটি সমীক্ষায় দেখা গেছে যে গত পাঁচ বছরে তাদের কার্বন নির্গমন ৩০% কমেছে। এটি অর্জন করা হয়েছে সৌর প্যানেল স্থাপন, এনার্জি-এফিসিয়েন্ট লাইটিং ব্যবহার এবং ডিজিটাল ওয়ার্কফ্লো বাস্তবায়ন করে কাগজের ব্যবহার কমিয়ে।</p>
      
      <blockquote>"আমাদের দেশের প্রাকৃতিক সৌন্দর্য সংরক্ষণ করা শুধুমাত্র আমাদের প্রাকৃতিক ঐতিহ্য রক্ষা করার জন্য নয়, বরং আমাদের ফিল্ম ইন্ডাস্ট্রির দীর্ঘমেয়াদী সাফল্যের জন্যও গুরুত্বপূর্ণ।" — নগুয়েন থি থান, ভিয়েতনাম ফিল্ম ইন্সটিটিউট</blockquote>
      
      <h2>সাইলেন্ট হিরো: গ্রিন প্রোডাকশন ম্যানেজাররা</h2>
      
      <p>ভিয়েতনামের চলচ্চিত্র শিল্পের পরিবেশগত রূপান্তরের পিছনে একটি নতুন পেশা উদীয়মান হয়েছে: গ্রিন প্রোডাকশন ম্যানেজার। এই বিশেষজ্ঞরা চলচ্চিত্র নির্মাণের প্রতিটি পর্যায়ে পরিবেশগত প্রভাব কমাতে কাজ করেন।</p>
      
      <p>হো চি মিন সিটিতে অবস্থিত প্রসিদ্ধ এমএম স্টুডিও সম্প্রতি তাদের সমস্ত প্রোডাকশনে একজন সার্টিফায়েড গ্রিন প্রোডাকশন ম্যানেজার নিয়োগ করার নীতি ঘোষণা করেছে। শুধুমাত্র ২০২৫ সালে এবং তার পরে উৎপাদিত চলচ্চিত্রের জন্যই, এই উদ্যোগ শিল্পে স্থায়িত্ব সম্পর্কে একটি গুরুত্বপূর্ণ পরিবর্তন প্রতিনিধিত্ব করে।</p>
      
      <h2>আন্তর্জাতিক সহযোগিতা</h2>
      
      <p>ভিয়েতনামী চলচ্চিত্র নির্মাতারা বিশ্বব্যাপী অন্যান্য স্থায়ী চলচ্চিত্র উদ্যোগগুলির সাথে সক্রিয়ভাবে সহযোগিতা করছেন। ২০২৪ সালে, হানয় ইন্টারন্যাশনাল ফিল্ম ফেস্টিভাল "গ্রিন স্ক্রিন ইনিশিয়েটিভ" চালু করেছিল, যা পরিবেশবান্ধব চলচ্চিত্র নির্মাণ অনুশীলনকে উৎসাহিত করার লক্ষ্যে একটি আন্তর্জাতিক প্রোগ্রাম।</p>
      
      <p>এই প্রোগ্রামের অধীনে, নির্মাতারা পরিবেশবান্ধব চলচ্চিত্র নির্মাণের কৌশলগুলি শিখতে এবং বিশ্বজুড়ে তাদের সমকক্ষদের সাথে ভাল অনুশীলনগুলি ভাগ করে নিতে ওয়ার্কশপ, সেমিনার এবং নেটওয়ার্কিং ইভেন্টগুলিতে অংশগ্রহণ করতে পারেন।</p>
    `,
    imageSrc: '/images/hero.jpg',
    category: 'সিনেমালাপ',
    author: {
      name: 'তানভীর সাকিব',
      avatar: 'https://via.placeholder.com/80?text=TS',
    },
    publishedAt: 'NOVEMBER 24, 2023',
    readTime: 6,
    viewCount: 892,
    tags: ['ভিয়েতনাম', 'পরিবেশ', 'চলচ্চিত্র', 'সবুজ-উদ্যোগ'],
    isEditorsPick: true,
  },
  {
    id: '6',
    title: '"ভাষা তো সত্যজিৎ রায়ের নাম জানতেন"—সত্যজিৎ রায়',
    isBengali: true,
    slug: 'satyajit-ray-language',
    excerpt: 'Exploring the linguistic contributions of Satyajit Ray to cinema.',
    imageSrc: '/images/hero.jpg',
    category: 'আলাপ-সালাপ',
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
    category: 'বিবিধ',
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
    category: 'চিত্রনাট্য',
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

export const bannerData = {
  isActive: true,  // Control from Strapi panel
  headline: "Today is Director X's Birthday",
  postTitle: "The Cinematic Masterpieces of X",
  subtitle: "Read this special post celebrating cinematic excellence and cultural significance.",
  postUrl: "/blog/xx"
};