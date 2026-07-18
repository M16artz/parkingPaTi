const apiTarget = process.env.VITE_DEV_API_TARGET?.trim() || 'http://localhost:8000';

module.exports = {
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
      '/health': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
};
