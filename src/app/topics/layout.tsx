import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 클라이언트 컴포넌트로 변환
'use client';

export default function TopicsLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div>
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center py-4">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">토론 주제</h1>
          </div>
        </div>
      </div>
      
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            <Link href="/topics">
              <div className={`px-4 py-3 font-medium text-sm whitespace-nowrap cursor-pointer ${
                isActive('/topics') && !isActive('/topics/create') && !isActive('/topics/ai-topics') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}>
                모든 토론 주제
              </div>
            </Link>
            
            <Link href="/topics/ai-topics">
              <div className={`px-4 py-3 font-medium text-sm whitespace-nowrap cursor-pointer ${
                isActive('/topics/ai-topics') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}>
                AI 토론 주제
              </div>
            </Link>

            <Link href="/topics/create">
              <div className={`px-4 py-3 font-medium text-sm whitespace-nowrap cursor-pointer ${
                isActive('/topics/create') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}>
                새 토론 주제 만들기
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {children}
    </div>
  );
} 