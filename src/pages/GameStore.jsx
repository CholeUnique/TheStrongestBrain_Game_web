import { useState, useMemo } from 'react';
import {useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
export default function GameStore() {
  const navigate = useNavigate();
  const { showMsg } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  

  const gameStore = [
    {
      id: 'life-game',
      title: '生命游戏 (Life Game)',
      description: '基于 B3/S23 细胞自动机规则，在大脑中推演动态盘面，找出最终的稳定形态。',
      difficulty: '⭐⭐⭐⭐⭐',
      color: 'bg-yellow-500',
      icon: '🌱',
      category: '科学推演',
      tags: ['空间推演', '规则计算']
    },
    {
      id: 'precise-word',
      title: '精准造字 (Precise Word)',
      description: '在 6×6 字根矩阵中规划连线路径，配合冷却流转的部首池，在脑海中完成汉字的解构与重构。',
      difficulty: '⭐⭐⭐⭐⭐',
      icon: '✍️',
      category: '语言逻辑',
      color: 'bg-emerald-500',
      tags: ['汉字储备', '路径规划', '瞬时记忆']
    },
    {
      id: 'arrow-maze',
      title: '箭阵迷域 (Arrow Maze)',
      description: '在 8×8 网格中，每个格子有多个箭头方向，玩家需要选择起始弓箭旋钮，将盘面中所有旋钮都消除。',
      difficulty: '⭐⭐⭐',
      color: 'bg-amber-800',
      icon: '🏹',
      category: '空间感知',
      tags: ['路径规划', '工作记忆']
    },
    {
      id: 'logic-maz',
      title: '盲眼迷宫 (Blind Maze)',
      description: '只看一眼迷宫全貌，随后在全黑状态下通过方向键指令走出迷宫。',
      difficulty: '⭐⭐⭐',
      color: 'bg-teal-300',
      icon: '🧠',
      category: '空间感知',
      tags: ['路径规划', '工作记忆']
    } 
  ];

  const categories = ['全部', ...new Set(gameStore.map(game => game.category))];
  const filteredGames = useMemo(() => {
    return gameStore.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            game.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === '全部' || game.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  // 点击开玩，跳转到游戏页并带上游戏 ID
  const handlePlay = (gameId) => {
    // 后续我们可以在 Game 页面通过路由参数读取这个 ID，来加载不同的游戏组件
    navigate(`/game?id=${gameId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-500 p-6 font-sans text-gray-900 dark:text-gray-100">
      <main className="max-w-6xl mx-auto">
        
        {/* --- 搜索与标题区域 --- */}
        <header className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">探索挑战</h1>
          
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input 
              type="text"
              placeholder="搜索游戏名称或介绍..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1C1C1E] rounded-2xl border-none ring-1 ring-gray-200 dark:ring-white/10 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
        </header>

        {/* --- 分类导航栏 --- */}
        <nav className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeCategory === cat 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-white dark:bg-[#1C1C1E] text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* --- 游戏列表网格 --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <div 
                key={game.id}
                className="group bg-white dark:bg-[#1C1C1E] rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-2xl transition-all duration-500 flex flex-col"
              >
                {/* 游戏图标 */}
                <div className={`w-16 h-16 rounded-2xl ${game.color} mb-6 shadow-lg flex items-center justify-center text-3xl transform group-hover:scale-110 transition-transform duration-300`}>
                  {game.icon}
                </div>

                <div className="mb-2">
                  <span className="text-[10px] uppercase tracking-widest text-blue-500 font-bold">{game.category}</span>
                  <h3 className="text-xl font-bold mt-1">{game.title}</h3>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">
                  {game.description}
                </p>

                {/* 难度展示 */}
                <div className="flex items-center justify-between mb-6 mt-auto">
                  <div className="flex gap-1">
                    {game.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-1 text-[10px] rounded-md bg-gray-50 dark:bg-gray-800 text-gray-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-[10px] opacity-80">{game.difficulty}</div>
                </div>

                <button 
                  onClick={() => handlePlay(game.id)}
                  className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-300 active:scale-95"
                >
                  获取挑战
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-gray-400">
              未找到匹配的游戏，换个关键词试试？
            </div>
          )}
        </div>
      </main>
    </div>
  );
}