'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* 메인 헤로 섹션 */}
      <section className="py-16 text-center" style={{ backgroundColor: 'var(--color-accent)' }}>
        <div className="container mx-auto px-6">
          <div className="mb-8 flex justify-center">
            <Image 
              src="/images/logo.svg" 
              alt="LovableDebate 로고" 
              width={150} 
              height={90} 
              priority
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
            대화와 공감을 통한<br/> 
            <span style={{ color: 'var(--color-primary)' }}>토론 교육 지원 플랫폼</span>
          </h1>
          <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto text-gray-700">
            '다름과 공존하는 경기초등토론교육모형'에 기반하여 토론 수업을 효과적으로 준비하고 진행할 수 
            있도록 도와주는 AI 기반 토론 교육 서비스입니다.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/scenarios/create">
              <button className="lovable-btn-primary px-8 py-3 rounded-full font-bold shadow-md">
                토론 시나리오 만들기
              </button>
            </Link>
            <Link href="/topics/ai-topics">
              <button className="lovable-btn-secondary px-8 py-3 rounded-full font-bold shadow-md">
                토론 주제 찾기
              </button>
            </Link>
            <Link href="/session">
              <button 
                className="px-8 py-3 rounded-full font-bold shadow-md transition-colors"
                style={{ backgroundColor: 'var(--color-text)', color: 'white' }}
              >
                토론 시작하기
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="section-title text-3xl font-bold mb-12 text-center">LovableDebate의 주요 기능</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="lovable-card p-8 text-center">
              <div className="mb-4 flex justify-center" style={{ color: 'var(--color-primary)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-primary)' }}>토론 시나리오</h3>
              <p className="text-gray-600 mb-4 h-24 flex items-center justify-center">
                교과 연계 토론 시나리오를 자동으로 생성하고 관리하여 수업에 활용할 수 있습니다.
              </p>
              <Link href="/scenarios" className="font-medium inline-flex items-center" style={{ color: 'var(--color-primary)' }}>
                시나리오 둘러보기
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            
            <div className="lovable-card p-8 text-center">
              <div className="mb-4 flex justify-center" style={{ color: 'var(--color-primary)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-primary)' }}>토론 진행</h3>
              <p className="text-gray-600 mb-4 h-24 flex items-center justify-center">
                단계별 가이드와 시간 관리 도구로 토론 수업을 효과적으로 운영합니다.
              </p>
              <Link href="/session" className="font-medium inline-flex items-center" style={{ color: 'var(--color-primary)' }}>
                토론 시작하기
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            
            <div className="lovable-card p-8 text-center">
              <div className="mb-4 flex justify-center" style={{ color: 'var(--color-primary)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-primary)' }}>학습 피드백</h3>
              <p className="text-gray-600 mb-4 h-24 flex items-center justify-center">
                AI 기반 맞춤형 피드백으로 학생들의 토론 참여와 학습 효과를 높입니다.
              </p>
              <a href="https://lovabledebate25.vercel.app" target="_blank" rel="noopener noreferrer" className="font-medium inline-flex items-center" style={{ color: 'var(--color-primary)' }}>
                피드백 시스템 보기
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* 토론 교육 가치 섹션 */}
      <section className="py-16" style={{ backgroundColor: 'var(--color-accent)' }}>
        <div className="container mx-auto px-6">
          <h2 className="section-title text-3xl font-bold mb-12 text-center">대화와 공감을 통한 토론 교육</h2>
          
          <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
            <ul className="lovable-list space-y-4">
              <li><strong>존중하는 소통:</strong> 서로 다른 의견을 존중하며 건강한 토론 문화를 형성합니다.</li>
              <li><strong>비판적 사고력:</strong> 다양한 관점에서 문제를 바라보고 분석하는 능력을 기릅니다.</li>
              <li><strong>창의적 해결책:</strong> 토론을 통해 새로운 아이디어와 해결책을 발견합니다.</li>
              <li><strong>공감 능력 향상:</strong> 다른 사람의 입장을 이해하고 공감하는 능력을 키웁니다.</li>
              <li><strong>논리적 표현력:</strong> 자신의 생각을 체계적으로 정리하고 논리적으로 표현하는 능력을 향상시킵니다.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
} 