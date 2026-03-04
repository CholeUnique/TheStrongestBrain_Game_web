import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import RainbowParticleBg from '../components/RainbowParticleBg'; // 【新增导入】

export default function Login() {
  const [isFlipped,setIsFlipped] = useState(false);
  const navigate = useNavigate();

  const handleAuth=(e)=>{
    e.preventDefault();//阻止表单默认提交刷新页面
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/gamestore');//登录成功后跳转到游戏页面
  };

  return(
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-apple-lightBg dark:bg-apple-darkBg transition-colors duration-500">
      
      {/* --- 动态多彩圆球背景 --- */}
      <div className="absolute w-full h-full max-w-3xl flex justify-center items-center pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      {/* --- 3D 翻转容器 --- */}
      <div className="perspective-1000 relative w-80 h-[28rem] z-10">
        <div className={`w-full h-full duration-700 preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* 1. 正面：登录卡片 */}
          <div className="absolute inset-0 backface-hidden apple-glass rounded-3xl p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-6 text-center">登录游戏</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <input 
                type="text" placeholder="账号" required
                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/50 border border-transparent focus:border-apple-blue focus:ring-1 focus:ring-apple-blue outline-none transition-all placeholder-gray-500"
              />
              <input 
                type="password" placeholder="密码" required
                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/50 border border-transparent focus:border-apple-blue focus:ring-1 focus:ring-apple-blue outline-none transition-all placeholder-gray-500"
              />
              <button className="w-full py-3 mt-4 rounded-xl bg-apple-blue text-white font-semibold shadow-lg hover:bg-blue-600 transition-colors">
                进入游戏
              </button>
            </form>
            <div className="mt-6 text-center text-sm opacity-80">
              还没有账号？ 
              <button onClick={() => setIsFlipped(true)} className="text-apple-blue font-semibold ml-1 hover:underline">
                立即注册
              </button>
            </div>
          </div>

          {/* 2. 背面：注册卡片 (自带 rotate-y-180 翻转) */}
          <div className="absolute inset-0 backface-hidden apple-glass rounded-3xl p-8 flex flex-col justify-center rotate-y-180">
            <h2 className="text-2xl font-bold mb-6 text-center">创建新账号</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <input 
                type="text" placeholder="取个响亮的昵称" required
                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/50 border border-transparent focus:border-apple-blue outline-none transition-all placeholder-gray-500"
              />
              <input 
                type="password" placeholder="设置密码" required
                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/50 border border-transparent focus:border-apple-blue outline-none transition-all placeholder-gray-500"
              />
              <button className="w-full py-3 mt-4 rounded-xl bg-black dark:bg-white dark:text-black text-white font-semibold shadow-lg hover:opacity-80 transition-opacity">
                注册并登录
              </button>
            </form>
            <div className="mt-6 text-center text-sm opacity-80">
              已有账号？ 
              <button onClick={() => setIsFlipped(false)} className="text-apple-blue font-semibold ml-1 hover:underline">
                返回登录
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}