import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '요리기능사 자격증반 | 세종요리제과기술학원',
  alternates: {
    canonical: 'https://www.sejongcook.co.kr/course/cooking/license',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
