import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        polaris: resolve(__dirname, 'polaris.html'),
        bigbang: resolve(__dirname, 'bigbang.html'),
        about: resolve(__dirname, 'about.html'),
        photo_editor: resolve(__dirname, 'photo-editor.html'),
        horoscope: resolve(__dirname, 'horoscope.html'),
        matrix: resolve(__dirname, 'matrix.html'),
        mission: resolve(__dirname, 'mission.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        signals: resolve(__dirname, 'signals.html'),
        board: resolve(__dirname, 'board.html'),
        blog: resolve(__dirname, 'blog.html'),
        results_guide: resolve(__dirname, 'results-guide.html'),
        post: resolve(__dirname, 'post.html'),
        jobs: resolve(__dirname, 'jobs.html')
      }
    }
  }
})
