import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 为了方便开发，我们可以设置一个代理来模拟后端接口
    // 这样可以避免跨域问题
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // 假设这是您的模拟服务器地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
}); 