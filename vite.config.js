import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // 将资源路径改为相对路径
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 允许外部访问，包括手机端
    port: 5173, // 指定端口号
    strictPort: true, // 如果端口被占用则报错
    // 为了方便开发，我们可以设置一个代理来模拟后端接口
    // 这样可以避免跨域问题
    proxy: {
      '/api': {
        target: 'http://192.168.1.44',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // 保留 /api 前缀
      },
    },
  },
}); 