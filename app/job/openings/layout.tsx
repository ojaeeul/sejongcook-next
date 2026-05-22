import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '취업정보 | 세종요리제과기술학원',
  alternates: {
    canonical: 'https://www.sejongcook.co.kr/job/openings',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
