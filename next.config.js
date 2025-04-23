/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    SECRET_KEY: process.env.SECRET_KEY
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  typescript: {
    // 빌드 시 타입 검사 비활성화 (개발 중에만 타입 오류를 확인)
    ignoreBuildErrors: true,
  },
  eslint: {
    // 빌드 시 ESLint 오류 무시 (개발 중에만 린트 오류를 확인)
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 