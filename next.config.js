/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用图片优化（如果没有使用Next.js Image组件）
  images: {
    unoptimized: true
  },
  
  // 确保路径正确
  trailingSlash: true,
  
  // 跳过构建时的ESLint检查（可选，加速部署）
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 跳过构建时的TypeScript类型检查（可选，加速部署）
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 确保支持CORS（对于API路由）
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig 