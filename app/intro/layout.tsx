import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '학원소개 | 김포요리학원 세종요리제과기술학원',
  alternates: {
    canonical: 'https://www.sejongcook.co.kr/intro',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
