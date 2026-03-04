/** @type {import('tailwindcss').Config} */
export default {
  // 告诉 Tailwind 去这些文件里寻找你写的样式类名
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // 开启手动控制的暗黑模式
  darkMode: 'class', 
  theme: {
    extend: {
      // 在这里我们悄悄加入苹果的标准配色和圆角
      colors: {
        apple: {
          lightBg: '#F5F5F7', // 苹果经典的浅灰背景
          lightText: '#1D1D1F', // 苹果的深灰文字
          darkBg: '#000000', // 纯黑背景
          darkCard: '#1C1C1E', // 暗夜模式下的卡片颜色
          darkText: '#F5F5F7', // 暗夜模式下的文字
          blue: '#0071E3', // 经典的苹果蓝（可用于按钮）
        }
      },
      fontFamily: {
        // 使用苹果系统默认字体 (San Francisco)
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Segoe UI"', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}