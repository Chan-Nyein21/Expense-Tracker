import { defineConfig } from 'vite';

export default defineConfig({
  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
    
    // Performance targets (Constitutional requirement: <500KB bundle)
    chunkSizeWarningLimit: 500,
    
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        manualChunks: {
          'chart-vendor': ['chart.js']
        }
      }
    },
    
    // Source maps for debugging
    sourcemap: true,
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  // Development server
  server: {
    port: 5173,
    host: true,
    open: true,
    cors: true,
    
    // Performance (Constitutional requirement: <3s load time)
    hmr: {
      overlay: true
    }
  },  // Preview server (for production builds)
  preview: {
    port: 4173,
    host: true
  },
  
  // Module resolution
  resolve: {
    alias: {
      '@': '/src',
      '@models': '/src/models',
      '@services': '/src/services', 
      '@components': '/src/components',
      '@utils': '/src/utils',
      '@styles': '/src/styles'
    }
  },
  
  // CSS configuration
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    }
  },
  
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
  },
  
  // Plugin configuration
  plugins: [],
  
  // Optimization
  optimizeDeps: {
    include: ['chart.js']
  }
});