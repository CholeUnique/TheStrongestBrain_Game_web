import { useSearchParams, useNavigate } from 'react-router-dom';
import LifeGame from '../components/LifeGame'; // 引入你的生命游戏组件

export default function Game() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 从网址中抓取游戏 id (比如点击后网址变成 /game?id=life-game，这里就是 'life-game')
  const gameId = searchParams.get('id');

  // 根据游戏 ID 动态渲染不同的组件
  const renderGame = () => {
    switch (gameId) {
      case 'life-game':
        return <LifeGame />;
      case 'spatial-fold':
        return <div className="text-center py-20 text-gray-500">空间折叠开发中...</div>;
      case 'logic-maze':
        return <div className="text-center py-20 text-gray-500">盲眼迷宫开发中...</div>;
      default:
        return <div className="text-center py-20 text-red-500">找不到该游戏模块！</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 font-sans pb-12">
      {/* 顶部返回按钮 */}
      <div className="mb-6 pt-4">
        <button 
          onClick={() => navigate(-1)} // 返回上一页 (也就是退回 GameStore)
          className="flex items-center gap-2 text-gray-500 hover:text-apple-lightText dark:hover:text-apple-darkText transition-colors font-medium"
        >
          <span>←</span> 退出游戏，返回仓库
        </button>
      </div>

      {/* 渲染具体游戏画面 */}
      {renderGame()}
    </div>
  );
}