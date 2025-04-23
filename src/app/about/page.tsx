'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-blue-50">
      {/* 페이지 헤더 */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-blue-700">토론 튜터란?</h1>
          <p className="mt-2 text-gray-600">AI 기반 초등 토론 수업 지원 도구</p>
        </div>
      </div>
      
      {/* 소개 콘텐츠 */}
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-lg mb-6">
            토론 튜터는 교사들이 초등학교 교실에서 체계적인 토론 수업을 진행할 수 있도록 도와주는 도구입니다. 
            경기초등토론교육모형을 기반으로 하며, 토론 시나리오 관리부터 실시간 토론 진행 및 시간 관리까지 토론 교육에 필요한 모든 기능을 제공합니다.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-700 mb-4">교사를 위한 기능</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>토론 시나리오 생성 및 관리</li>
                <li>단계별 활동 시간 설정</li>
                <li>토론 진행 중 타이머 관리</li>
                <li>교사 안내용 프롬프트 제공</li>
                <li>토론 자료 및 양식 다운로드</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-green-700 mb-4">학생들의 역량 개발</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>비판적 사고력 향상</li>
                <li>논리적 표현력 신장</li>
                <li>경청 및 상호 존중 태도 함양</li>
                <li>다양한 관점에서의 사고 확장</li>
                <li>사회적 이슈에 대한 인식 제고</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">경기초등토론교육모형이란?</h2>
          <p className="text-lg mb-4">
            경기초등토론교육모형은 '다름과 공존하는 토론교육'을 목표로 개발된 모형으로, 
            초등학생들의 발달 단계와 특성을 고려하여 설계되었습니다.
          </p>
          <p className="text-lg mb-4">
            이 모형은 세 단계로 구성됩니다:
          </p>
          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-700">1단계: 다름과 마주하기</h3>
              <p>다양한 의견을 접하고 자신의 생각을 정리하는 단계</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-700">2단계: 다름을 이해하기</h3>
              <p>상대방의 관점을 이해하고 자신의 주장을 논리적으로 펼치는 단계</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-700">3단계: 다름과 공존하기</h3>
              <p>서로 다른 의견을 존중하고 최선의 해결책을 모색하는 단계</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">AI 기반 시나리오 생성</h2>
          <p className="text-lg mb-6">
            토론 튜터는 OpenAI의 GPT 모델을 활용하여 다양한 주제의 토론 시나리오를 생성합니다. 
            교사는 원하는 주제, 학년, 교과를 입력하면 AI가 자동으로 배경 지식, 찬반 논거, 교사 지도 노트 등이 포함된 
            완성된 토론 시나리오를 만들어주어 수업 준비 시간을 크게 절약할 수 있습니다.
          </p>
        </div>
        
        <div className="text-center mt-8">
          <Link href="/scenarios/create">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow transition-colors">
              시나리오 만들기 시작하기
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
} 