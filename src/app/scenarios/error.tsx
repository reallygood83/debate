'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ScenariosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('시나리오 페이지 오류:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">시나리오 로딩 중 오류 발생</h2>
        <p className="text-gray-700 mb-4">
          시나리오 데이터를 불러오는 중 문제가 발생했습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해 주세요.
        </p>
        {error.message && (
          <div className="bg-gray-100 p-3 rounded text-left text-sm text-gray-800 mb-4">
            <p className="font-mono">{error.message}</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
          <Link 
            href="/scenarios"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            시나리오 목록으로
          </Link>
        </div>
      </div>
    </div>
  );
} 