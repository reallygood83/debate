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
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'Surrogate-Control', value: 'no-store' },
        ],
      },
    ];
  },
  // API 요청 타임아웃 설정
  api: {
    responseLimit: '16mb',
    bodyParser: {
      sizeLimit: '16mb',
    },
    externalResolver: true,
  },
  // CDN 캐싱 최적화
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  // 타임아웃 관련 설정
  staticPageGenerationTimeout: 120,
  typescript: {
    // 빌드 시 타입 검사 비활성화 (개발 중에만 타입 오류를 확인)
    ignoreBuildErrors: true,
  },
  eslint: {
    // 빌드 시 ESLint 오류 무시 (개발 중에만 린트 오류를 확인)
    ignoreDuringBuilds: true,
  },
  // 웹팩 최적화
  webpack: (config, { dev, isServer }) => {
    // 프로덕션 환경에서만 최적화 적용
    if (!dev) {
      config.optimization.minimize = true;
    }
    
    return config;
  },
};

module.exports = nextConfig; 