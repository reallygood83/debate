import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { DebateProvider } from '@/context/DebateContext'
import DebateTopicBar from '@/components/DebateTopicBar'

export const metadata: Metadata = {
  title: 'LovableDebate - 토론 교육 지원 플랫폼',
  description: '대화와 공감을 통한 교실 속 토론 교육 지원 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 네비게이션 메뉴 항목 (이름 개선)
  const navItems = [
    { id: 'home', title: '홈', href: '/' },
    { id: 'topics', title: '토론 주제 탐색', href: '/topics/ai-topics' },
    { id: 'scenarios', title: '토론 시나리오', href: '/scenarios' },
    { id: 'session', title: '토론 진행하기', href: '/session' },
    { id: 'feedback', title: '학습 피드백', href: 'https://lovabledebate25.vercel.app/', external: true, noNewTab: true },
    { id: 'resources', title: '교육 자료실', href: '/resources' },
    { id: 'about', title: '소개', href: '/about' }
  ];

  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <DebateProvider>
        {/* 헤더 */}
          <header style={{ backgroundColor: 'var(--color-text)' }} className="text-white shadow-md">
            <div className="container mx-auto py-3 px-6 flex justify-between items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative w-10 h-10">
                  <Image 
                    src="/images/logo.svg" 
                    alt="LovableDebate 로고" 
                    width={40} 
                    height={40} 
                    priority
                  />
                </div>
                <span className="text-2xl font-bold">LovableDebate</span>
              </Link>
              
              <nav>
                <ul className="flex items-center space-x-6">
                {navItems.map((item) => (
                    <li key={item.id}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target={item.noNewTab ? "_self" : "_blank"}
                        rel="noopener noreferrer"
                        className="text-white hover:text-[var(--color-primary-light)] transition-colors text-sm font-medium"
                      >
                        {item.title}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-white hover:text-[var(--color-primary-light)] transition-colors text-sm font-medium"
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
          <footer style={{ backgroundColor: 'var(--color-text)' }} className="text-white py-8 mt-auto">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="relative w-8 h-8 mr-2">
                  <Image 
                    src="/images/logo.svg" 
                    alt="LovableDebate 로고" 
                    width={32} 
                    height={32}
                  />
                </div>
                <span className="font-semibold">LovableDebate</span>
              </div>
              
              <div className="text-center md:text-right">
                <p className="mb-1 text-sm">© 2025 LovableDebate - 토론 교육 지원 플랫폼</p>
                <p className="text-gray-400 text-xs">
                  안양 박달초 김문정 · 대화와 공감을 통한 교실 토론 활동 지원
                </p>
              </div>
            </div>
          </div>
        </footer>
        </DebateProvider>
      </body>
    </html>
  )
}
