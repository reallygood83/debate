'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function SessionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('토론 세션 오류:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">토론 세션 오류</h2>
        <p className="text-gray-700 mb-4">
          토론 세션을 진행하는 중 문제가 발생했습니다. 이 오류는 로깅되었으며 개발팀이 검토할 예정입니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
          <Link 
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
} 