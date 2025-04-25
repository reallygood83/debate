import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import { DebateProvider } from '@/context/DebateContext'
import DebateTopicBar from '@/components/DebateTopicBar'

export const metadata: Metadata = {
  title: '토론 튜터',
  description: '경기초등토론교육모형을 활용한 토론 교육 지원 도구',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 네비게이션 메뉴 항목
  const navItems = [
    { id: 'home', title: '홈', href: '/' },
    { id: 'topics', title: '토론 주제', href: '/topics/ai-topics' },
    { id: 'scenarios', title: '시나리오', href: '/scenarios' },
    { id: 'session', title: '토론 진행', href: '/session' },
    { id: 'feedback', title: '피드백 관리', href: 'https://lovabledebate25.vercel.app/', external: true, noNewTab: true },
    { id: 'resources', title: '토론 자료', href: '/resources' },
    { id: 'about', title: '소개', href: '/about' }
  ];

  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <DebateProvider>
        {/* 헤더 */}
          <header className="bg-blue-700 text-white">
            <div className="container mx-auto py-3 px-6 flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold">토론 튜터</Link>
              <nav>
                <ul className="flex items-center space-x-8">
                {navItems.map((item) => (
                    <li key={item.id}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target={item.noNewTab ? "_self" : "_blank"}
                        rel="noopener noreferrer"
                        className="text-white hover:text-blue-200 transition-colors text-sm"
                      >
                        {item.title}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-white hover:text-blue-200 transition-colors text-sm"
                      >
                        {item.title}
                      </Link>
                    )}
                    </li>
                ))}
                </ul>
              </nav>
          </div>
        </header>
        
          <main className="flex-1 container mx-auto py-8 px-6 max-w-6xl">
          {children}
        </main>
          
          {/* 토론 주제 표시 - 토론 활성화 시에만 표시됨 */}
          <DebateTopicBar />
        
        {/* 푸터 */}
          <footer className="bg-gray-800 text-white py-8 mt-auto">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <p className="mb-2">© 2025 토론 튜터 - 초등 토론 수업 지원 도구</p>
              <p className="text-gray-400 text-sm">
                안양 박달초 김문정 · 교실 토론 활동 지원 애플리케이션
              </p>
            </div>
          </div>
        </footer>
        </DebateProvider>
      </body>
    </html>
  )
}
