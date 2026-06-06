import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.sejongcook.co.kr';

  const routes = [
    '',
    '/about/intro',
    '/about/location',
    '/about/teachers',
    '/about/facility',
    '/course/national',
    '/course/certificate',
    '/course/baking',
    '/course/oneday',
    '/course/hobby',
    '/community/notice',
    '/community/qna',
    '/job/openings',
    '/consult/online',
    '/consult/faq',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
