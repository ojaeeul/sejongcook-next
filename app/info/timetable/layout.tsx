import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '수강 시간표 | 세종요리제과기술학원',
  alternates: {
    canonical: 'https://www.sejongcook.co.kr/info/timetable',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
