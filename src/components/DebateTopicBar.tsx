'use client';

import React from 'react';
import Link from 'next/link';
import { useDebate } from '@/context/DebateContext';

export default function DebateTopicBar() {
  const { activeTopic, isDebateActive } = useDebate();
  
  if (!isDebateActive) return null;
  
  return (
    <div className="bg-blue-700 border-t border-blue-500 text-white py-4">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-blue-200 mr-2 text-sm">토론 주제:</span>
          <p className="text-xl font-medium">{activeTopic}</p>
        </div>
        <Link href="/" className="text-white hover:text-blue-200 text-sm px-2 py-1 rounded bg-blue-800 hover:bg-blue-600">
          토론 종료
        </Link>
      </div>
    </div>
  );
} 