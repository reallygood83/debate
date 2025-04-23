'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-blue-50">
      {/* 메인 헤로 섹션 */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-6">AI 기반 초등 토론 수업 지원 도구</h1>
          <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto text-gray-700">
            '다름과 공존하는 경기초등토론교육모형'에 기반하여 토론 수업을 효과적으로 준비하고 진행할 수 
            있도록 도와주는 AI 토론 가이드입니다.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/scenarios/create">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-md">
                시나리오 만들기
              </button>
            </Link>
            <Link href="/about">
              <button className="px-8 py-3 bg-white text-blue-600 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-md border border-blue-200">
                사용 방법 보기
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-blue-800">주요 기능</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-lg p-8 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-blue-600 mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">토론 시나리오</h3>
              <p className="text-gray-600 mb-4">다양한 주제의 토론 시나리오를 만들고 관리합니다.</p>
              <Link href="/scenarios" className="text-blue-600 font-medium inline-flex items-center">
                자세히 보기
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            
            <div className="bg-green-50 rounded-lg p-8 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-green-600 mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">토론 진행</h3>
              <p className="text-gray-600 mb-4">시나리오에 따라 토론을 진행하고 시간을 관리합니다.</p>
              <Link href="/session" className="text-green-600 font-medium inline-flex items-center">
                자세히 보기
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-8 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-purple-600 mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">토론 자료</h3>
              <p className="text-gray-600 mb-4">토론 규칙, 입론서, 성찰 질문 등 유용한 자료를 제공합니다.</p>
              <Link href="/resources" className="text-purple-600 font-medium inline-flex items-center">
                자세히 보기
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 