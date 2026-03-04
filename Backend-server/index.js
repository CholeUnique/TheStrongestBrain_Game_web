const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// 开启 CORS，允许咱们运行在 5173 端口的 React 前端来访问
app.use(cors());
app.use(express.json());

// ==========================================
// 1. 初始化 SQLite 数据库
// ==========================================
// 这会在 server 目录下自动生成一个 database.sqlite 文件
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('数据库连接失败:', err.message);
  else console.log('已连接到 SQLite 数据库。');
});

// 创建题库表 (如果不存在的话)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS puzzles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    difficulty INTEGER,
    rows INTEGER,
    cols INTEGER,
    initial_grid TEXT,
    solution_grid TEXT
  )`);
});

// 创建用户表
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    system_id TEXT UNIQUE,     -- 系统唯一ID (不可改)
    nickname TEXT,             -- 昵称
    avatar TEXT,               -- 头像URL
    bio TEXT,                  -- 简介
    score INTEGER DEFAULT 0,   -- 积分
    badges TEXT                -- 徽章 (存JSON数组)
  )`, () => {
    // 顺手插入一个测试账号，方便咱们前端画 UI
    db.get("SELECT * FROM users WHERE id = 1", (err, row) => {
      if (!row) {
        db.run(`INSERT INTO users (system_id, nickname, avatar, bio, score, badges) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            'ID-9527', 
            '烧脑极客', 
            'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', // 使用开源的随机头像库
            '探索大脑极限，热爱空间逻辑推理。目标是拿满所有成就！', 
            1250, 
            JSON.stringify(['🔥', '🧊', '👑']) // 模拟三个徽章
          ]
        );
      }
    });
  });

// ==========================================
// 2. 生命游戏核心引擎 (从前端搬到后端了！)
// ==========================================
const getNextGeneration = (grid, rows, cols) => {
  const nextGrid = grid.map(arr => [...arr]);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let neighbors = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          const nr = r + i, nc = c + j;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) neighbors += grid[nr][nc];
        }
      }
      if (grid[r][c] === 1 && (neighbors < 2 || neighbors > 3)) nextGrid[r][c] = 0;
      else if (grid[r][c] === 0 && neighbors === 3) nextGrid[r][c] = 1;
    }
  }
  return nextGrid;
};

// ==========================================
// 3. 编写 API 接口：供前端请求获取新题目
// ==========================================
app.post('/api/generate-puzzle', (req, res) => {
  const { difficulty } = req.body; // 前端传过来的难度: 1, 2, 3
  const rows = 15;
  const cols = difficulty * 10;

  // 1. 生成初始随机盘面 (后期你可以在这里加入更复杂的生成算法)
  const initialGrid = Array(rows).fill().map(() => 
    Array(cols).fill().map(() => (Math.random() > 0.8 ? 1 : 0))
  );
  console.log('已生成新盘面');

  // 2. 后端直接算出绝对正确的标准答案
  let current = initialGrid;
  let next = getNextGeneration(current, rows, cols);
  let iterations = 0;
  while (JSON.stringify(current) !== JSON.stringify(next) && iterations < 50) {
    current = next;
    next = getNextGeneration(current, rows, cols);
    iterations++;
  }
  const solutionGrid = current;
  console.log('已生成新盘面的标准答案');

  // 3. 将题目和答案存入 SQLite 数据库
  const stmt = db.prepare(`INSERT INTO puzzles (difficulty, rows, cols, initial_grid, solution_grid) VALUES (?, ?, ?, ?, ?)`);
  
  stmt.run(
    difficulty, rows, cols, 
    JSON.stringify(initialGrid), 
    JSON.stringify(solutionGrid), 
    function(err) {
      if (err) {
        return res.status(500).json({ error: '数据库保存失败' });
      }
      // 4. 将生成的题目和数据库中的 ID 返回给前端（注意：不能把答案返回给前端，防止作弊！）
      res.json({
        puzzleId: this.lastID, // 数据库里的主键 ID
        initialGrid: initialGrid,
        rows: rows,
        cols: cols,
        message: '题目生成成功！'
      });
  });
  stmt.finalize();
});

// ==========================================
// 4. 编写 API 接口：供前端提交答案进行验证
// ==========================================
app.post('/api/verify-puzzle', (req, res) => {
  const { puzzleId, playerGrid } = req.body;

  // 从数据库里拿出这道题的标准答案
  db.get(`SELECT solution_grid FROM puzzles WHERE id = ?`, [puzzleId], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: '找不到该题目' });
    }

    const solutionGrid = JSON.parse(row.solution_grid);
    const isCorrect = JSON.stringify(solutionGrid) === JSON.stringify(playerGrid);

    res.json({
      isCorrect: isCorrect,
      message: isCorrect ? '🎉 挑战成功！' : '❌ 挑战失败！再检查一遍吧。',
      actualSolution: solutionGrid // 验证完毕后，可以把正确答案发给前端做展示
    });
  });
});

// ==========================================
// 5. 编写 API 接口：获取个人主页信息
// ==========================================
app.get('/api/user/profile', (req, res) => {
  // 目前还没有做真实的登录态(Token)，所以先硬编码获取 id=1 的这个测试用户
  db.get(`SELECT * FROM users WHERE id = 1`, (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: '找不到该用户' });
    }
    // 把存成字符串的徽章数组解析回真实的数组
    row.badges = JSON.parse(row.badges);
    res.json(row);
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 后端服务器已启动：http://localhost:${PORT}`);
});