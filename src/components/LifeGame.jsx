import { useState, useEffect, useCallback } from 'react';

// 核心规则：计算下一个状态 (B3/S23)
const getNextGeneration = (grid, rows, cols) => {
  const nextGrid = grid.map(arr => [...arr]); // 深拷贝当前网格
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let neighbors = 0;
      // 遍历周围 8 个格子
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          const nr = r + i;
          const nc = c + j;
          // 边界检查
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            neighbors += grid[nr][nc];
          }
        }
      }
      
      // B3S23 规则判断
      if (grid[r][c] === 1 && (neighbors < 2 || neighbors > 3)) {
        nextGrid[r][c] = 0; // 孤独或拥挤而死
      } else if (grid[r][c] === 0 && neighbors === 3) {
        nextGrid[r][c] = 1; // 繁殖生出新细胞
      }
    }
  }
  return nextGrid;
};

export default function LifeGame() {
  const [difficulty, setDifficulty] = useState(1); // 1: 简单, 2: 中等, 3: 困难
  const [gameState, setGameState] = useState('setup'); // setup (选择难度) -> playing (答题中) -> result (结果)
  
  const rows = 15;
  const cols = difficulty * 10; // 难度决定列数

  // 两个核心状态：初始题目盘面 vs 玩家手填的盘面
  const [initialGrid, setInitialGrid] = useState([]);
  const [playerGrid, setPlayerGrid] = useState([]);

  // 初始化空白网格的辅助函数
  const createEmptyGrid = useCallback(() => {
    return Array(rows).fill().map(() => Array(cols).fill(0));
  }, [rows, cols]);

  // 开始游戏：生成初始题目（这里暂时用随机生成，后续可接入 AI 或题库）
  const startGame = (level) => {
    setDifficulty(level);
    const newCols = level * 10;
    
    // 生成一个随机的初始盘面 (密度设为 20%)
    const puzzle = Array(rows).fill().map(() => 
      Array(newCols).fill().map(() => (Math.random() > 0.8 ? 1 : 0))
    );
    
    setInitialGrid(puzzle);
    setPlayerGrid(Array(rows).fill().map(() => Array(newCols).fill(0))); // 玩家盘面为空
    setGameState('playing');
  };

  // 玩家点击网格作答
  const toggleCell = (r, c) => {
    if (gameState !== 'playing') return;
    const newGrid = playerGrid.map(row => [...row]);
    newGrid[r][c] = newGrid[r][c] ? 0 : 1;
    setPlayerGrid(newGrid);
  };

  // 提交答案，进行验证
  const handleSubmit = () => {
    // 1. 连续推演，直到网格不再发生变化（找到稳定态）
    let current = initialGrid;
    let next = getNextGeneration(current, rows, cols);
    let iterations = 0;
    
    // 为了防止陷入死循环（比如遇到震荡子），设置最大推演步数
    while (JSON.stringify(current) !== JSON.stringify(next) && iterations < 50) {
      current = next;
      next = getNextGeneration(current, rows, cols);
      iterations++;
    }

    // 2. 将最终的稳定态 current 与 玩家填写的 playerGrid 对比
    const isCorrect = JSON.stringify(current) === JSON.stringify(playerGrid);
    
    if (isCorrect) {
      alert("🎉 挑战成功！你拥有最强大脑！\n实际推演了 " + iterations + " 代达到稳定。");
    } else {
      alert("❌ 挑战失败！预测有误。\n(后续我们可以高亮显示填错的格子)");
    }
    setGameState('result');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
      
      {/* 头部控制区 */}
      <div className="w-full flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">生命游戏 (Game of Life)</h2>
        
        {gameState === 'setup' ? (
          <div className="flex gap-2">
            <button onClick={() => startGame(1)} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:opacity-80">简单 (区域一)</button>
            <button onClick={() => startGame(2)} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:opacity-80">中等 (区域二)</button>
            <button onClick={() => startGame(3)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:opacity-80">困难 (区域三)</button>
          </div>
        ) : (
          <div className="flex gap-4">
            <button onClick={() => setGameState('setup')} className="px-4 py-2 bg-gray-500 text-white rounded-lg">放弃重来</button>
            {gameState === 'playing' && (
              <button onClick={handleSubmit} className="px-6 py-2 bg-apple-blue text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform">
                提交预测
              </button>
            )}
          </div>
        )}
      </div>

      {/* 游戏主体区域 */}
      {gameState !== 'setup' && (
        <div className="flex flex-col md:flex-row gap-8 w-full">
          
          {/* 左侧：题目展示区 */}
          <div className="flex-1 flex flex-col items-center">
            <h3 className="mb-4 text-gray-500 font-semibold">初始盘面 (考题)</h3>
            <div 
              className="grid gap-[1px] bg-apple-blue/20 p-1 border-2 border-apple-blue/50 rounded-lg shadow-2xl"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {initialGrid.map((row, r) => 
                row.map((cell, c) => (
                  <div 
                    key={`init-${r}-${c}`} 
                    // 这里使用了你要求的颜色：灰色代表死亡，亮黄色代表存活
                    className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-colors duration-300 ${
                      cell ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'bg-gray-700/80 dark:bg-gray-800'
                    }`}
                  />
                ))
              )}
            </div>
          </div>

          {/* 右侧：玩家作答区 */}
          <div className="flex-1 flex flex-col items-center">
            <h3 className="mb-4 font-bold text-apple-blue">你的预测 (点击网格作答)</h3>
            <div 
              className="grid gap-[1px] bg-apple-blue/20 p-1 border-2 border-apple-blue/50 rounded-lg shadow-2xl cursor-pointer"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {playerGrid.map((row, r) => 
                row.map((cell, c) => (
                  <div 
                    key={`player-${r}-${c}`} 
                    onClick={() => toggleCell(r, c)}
                    className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-colors duration-150 border border-white/5 hover:border-white/30 ${
                      cell ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'bg-gray-700/80 dark:bg-gray-800'
                    }`}
                  />
                ))
              )}
            </div>
          </div>

        </div>
      )}
      
      {/* 规则说明 (仅在未开始时显示) */}
      {gameState === 'setup' && (
        <div className="mt-12 p-6 apple-glass rounded-2xl max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          <h4 className="font-bold text-lg mb-2 text-apple-lightText dark:text-apple-darkText">规则说明 (B3/S23)</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li>细胞的生存规律由它周围 8 个格子的存活细胞数量决定。</li>
            <li><strong className="text-apple-blue">诞生 (B3)</strong>：灰色格子周围有且仅有 3 个黄色细胞时，变为黄色。</li>
            <li><strong className="text-yellow-500">存活 (S23)</strong>：黄色细胞周围有 2 或 3 个黄色细胞时，继续保持黄色。</li>
            <li><strong className="text-red-500">死亡</strong>：周围活细胞不足 2 个（孤单）或多于 3 个（拥挤）时，变为灰色。</li>
            <li>请根据左侧初始盘面，推演其<strong>最终的稳定形态</strong>，并在右侧画出。</li>
          </ul>
        </div>
      )}
    </div>
  );
}