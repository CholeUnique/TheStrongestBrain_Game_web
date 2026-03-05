// 全局中央结算引擎 (供所有游戏模块调用)

const moment = require('moment');// 日期处理
const db = require('../db');

const recordGameResult = (userId, gameId, difficulty, isWin, timeSpent, customScore = null) => {
  let scoreEarned = 0;
  if (isWin) {
    if (customScore !== null) {
      scoreEarned = customScore;
    } else {
      scoreEarned = difficulty === 1 ? 5 : difficulty === 2 ? 10 : 20;
    }
  }

  db.run(`INSERT INTO game_records (user_id, game_id, difficulty, is_win, time_spent) VALUES (?, ?, ?, ?, ?)`,
    [userId, gameId, difficulty, isWin, timeSpent || 0]);

  if (isWin) {
    db.run(`UPDATE users SET score = score + ? WHERE id = ?`, [scoreEarned, userId]);
  }

  db.get('SELECT * FROM user_stats WHERE user_id = ?', [userId], (err, stats) => {
    if (err || !stats) return;

    const todayDate = moment().format('YYYY-MM-DD'); 
    const currentWeek = moment().format('YYYY-[W]ww'); 
    let dayTimeDict = JSON.parse(stats.day_time_spent || '{}');
    let monthTimeDict = JSON.parse(stats.month_time_spent || '{}');
    let currentSingleTime = stats.single_time_spent;
    
    if (stats.last_play_date !== todayDate) currentSingleTime = 0; 

    const newSumTime = stats.sum_time_spent + timeSpent;
    const newSingleTime = currentSingleTime + timeSpent;
    const newSumNum = stats.sum_num_of_game + 1;
    const newWinNum = isWin ? stats.win_num_of_game + 1 : stats.win_num_of_game;
    const newWinRate = newSumNum > 0 ? (newWinNum / newSumNum) : 0; 

    dayTimeDict[todayDate] = (dayTimeDict[todayDate] || 0) + timeSpent;
    monthTimeDict[currentWeek] = (monthTimeDict[currentWeek] || 0) + timeSpent;

    db.run(`UPDATE user_stats SET 
        sum_time_spent = ?, month_time_spent = ?, day_time_spent = ?, single_time_spent = ?, 
        last_play_date = ?, sum_num_of_game = ?, win_num_of_game = ?, win_rate = ? WHERE user_id = ?`, 
        [newSumTime, JSON.stringify(monthTimeDict), JSON.stringify(dayTimeDict), newSingleTime, 
         todayDate, newSumNum, newWinNum, newWinRate, userId]
    );
  });

  return scoreEarned; 
};

module.exports = { recordGameResult };