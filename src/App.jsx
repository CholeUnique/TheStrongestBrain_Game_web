import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Home from './pages/Home';
import GameStore from './pages/GameStore';
import Navbar from './components/Navbar';
import './index.css'

// 路由守卫组件
// 它的逻辑是：如果 localStorage 里有 isAuthenticated，就放行渲染 children (也就是你的页面)；如果没有，就强行打回 /login
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-apple-lightBg dark:bg-apple-darkBg transition-colors duration-500">
      <Navbar />
      {/* pt-20 是为了给固定在顶部的导航栏留出空间，防止内容被遮挡 */}
      <div className="pt-20 pb-10">
        <Outlet /> 
      </div>
    </div>
  );
};

function App() {
  // 状态：当前是否为暗黑模式。默认先检查本地存储，如果没有则默认白天 (false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // 当 isDarkMode 改变时，操作浏览器的 html 标签，并保存到 localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <BrowserRouter>
    {/* 悬浮在右上角的主题切换按钮：典型的苹果风毛玻璃药丸按钮 */}
      <button 
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 px-4 py-2 rounded-full text-sm font-medium 
                   bg-white/70 dark:bg-[#2C2C2E]/70 backdrop-blur-md 
                   border border-gray-200 dark:border-gray-700
                   shadow-sm hover:scale-105 transition-transform duration-200"
      >
        {isDarkMode ? '🌙 切换白天' : '☀️ 切换暗夜'}
      </button>
      {/* 路由配置：根据 URL 显示不同的组件 */}
      <Routes>
        {/* 当浏览器访问 /login 时，显示 Login 组件 */}
        <Route path="/login" element={<Login />} />
        
        {/* 当访问根目录 / 时，显示 Home 组件 */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        
        {/* 当访问 /game 时，显示 Game 组件 */}
        <Route path="/gamestore" element={
          <ProtectedRoute>
            <GameStore />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App