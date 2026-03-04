import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

export default function Home() {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 组件加载时，向后端请求用户个人数据接口
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/user/profile');
        const data = await response.json();
        setUserInfo(data);
      } catch (error) {
        console.error("获取用户信息失败", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 判断当前是否为暗黑模式，用于动态调整图表文字颜色
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#E5E7EB' : '#374151';

  if (isLoading || !userInfo) {
    return <div className={`min-h-screen flex justify-center pt-32 text-${textColor}`}>正在加载大脑档案...</div>;
  }

  // ==========================================
  // ECharts 配置：个人能力雷达图
  // ==========================================
  const radarOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    radar: {
      indicator: [
        { name: '空间推理', max: 100 },
        { name: '瞬时记忆', max: 100 },
        { name: '规则计算', max: 100 },
        { name: '抗干扰性', max: 100 },
        { name: '工作记忆', max: 100 }
      ],
      shape: 'polygon',
      axisName: { color: textColor, fontWeight: 'bold' },
      splitArea: { show: false }, // 去掉背景网格区块颜色，更清爽
      axisLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB' } },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB' } },
    },
    series: [{
      name: '能力维度',
      type: 'radar',
      data: [{
        value: [95, 80, 88, 70, 85],
        name: '我的战力',
        itemStyle: { color: '#3B82F6' },
        areaStyle: { color: 'rgba(59, 130, 246, 0.4)' } // 苹果蓝半透明填充
      }]
    }]
  };

  // ==========================================
  // ECharts 配置：准确率环形图
  // ==========================================
  const donutOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    series: [{
      name: '推演准确率',
      type: 'pie',
      radius: ['65%', '85%'], // 空心环形
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'center',
        formatter: '87.5%\n胜率',
        fontSize: 20,
        fontWeight: 'bold',
        color: textColor
      },
      labelLine: { show: false },
      data: [
        { value: 87.5, name: '正确', itemStyle: { color: '#10B981' } }, // 绿色
        { value: 12.5, name: '失误', itemStyle: { color: isDark ? '#374151' : '#E5E7EB' } }
      ]
    }]
  };

  // ==========================================
  // 模拟数据：生成最近 140 天的活跃度热力图数据
  // ==========================================
  const generateHeatmap = () => {
    return Array.from({ length: 140 }).map((_, i) => {
      // 随机生成 0-4 的活跃度等级
      const level = Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 4) + 1;
      return level;
    });
  };
  const heatmapData = generateHeatmap();

  return (
    // 最外层容器，限制宽度并居中
    <div className="max-w-8xl mx-auto px-0 font-sans animate-fade-in">
      
      {/* 整个个人主页的卡片容器 */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden">
        
        {/* =========================================
            上半部分：大横幅 + 头像 + 基本信息
        ========================================= */}
        <div className="relative">
          {/* 渐变横幅 */}
          <div className="h-10 md:h-32 bg-gradient-to-r from-blue-200 via-indigo-100 to-purple-200 dark:from-blue-900/40 dark:via-indigo-900/40 dark:to-purple-900/40"></div>
          
          {/* 头像压线 */}
          <div className="absolute top-10 md:top-23 left-8 md:left-12 flex items-end gap-6">
            <div className="relative group w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-[#1C1C1E] bg-gray-200 shadow-lg overflow-hidden cursor-pointer z-10">
              <img src={userInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-bold">更换头像</span>
              </div>
            </div>
          </div>

          {/* 右侧徽章 */}
          <div className="absolute top-0 md:top-14 right-8 flex gap-3">
            {userInfo.badges.map((badge, index) => (
              <div key={index} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-center text-xl hover:scale-110 transition-transform cursor-help">
                {badge}
              </div>
            ))}
          </div>
        </div>

        {/* 信息与积分 (移到了分割线上方) */}
        <div className="pt-20 md:pt-24 px-8 md:px-12 pb-8 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-apple-lightText dark:text-apple-darkText">
                {userInfo.nickname}
              </h1>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-mono rounded border border-gray-200 dark:border-gray-700 select-none">
                {userInfo.system_id}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">
              {userInfo.bio}
            </p>
          </div>

          <div className="md:text-right mt-4 md:mt-0 flex flex-col justify-end">
            <div className="text-sm text-gray-400 font-semibold tracking-widest mb-1">CUMULATIVE SCORE</div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-purple-600 drop-shadow-sm">
              {userInfo.score.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 漂亮的内部分割线 */}
        <hr className="border-t border-gray-100 dark:border-gray-800 mx-8 md:mx-12" />

        {/* =========================================
            下半部分：三列布局的数据看板 (Dashboard)
        ========================================= */}
        <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* 左列：游戏数据统计 */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold text-apple-lightText dark:text-apple-darkText flex items-center gap-2">
              🧭 脑力雷达解析
            </h3>
            <div className="bg-gray-50 dark:bg-[#242426] rounded-3xl p-4 h-64 border border-gray-100 dark:border-transparent">
              <ReactECharts option={radarOption} style={{ height: '100%', width: '100%' }} />
            </div>
            <div className="p-5 rounded-3xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-2">系统总评</div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                你是一位<strong className="text-apple-blue mx-1">空间推演大师</strong>。在《生命游戏》中展现了极其罕见的直觉预判能力，但手速反应仍有提升空间。
              </p>
            </div>
          </div>

          {/* 中列：活跃度热力图 & 准确率 */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold text-apple-lightText dark:text-apple-darkText flex items-center gap-2">
              🔥 训练足迹
            </h3>
            
            {/* 准确率环形图 */}
            <div className="bg-gray-50 dark:bg-[#242426] rounded-3xl p-4 h-40 border border-gray-100 dark:border-transparent flex items-center justify-between px-8">
              <div className="w-1/2">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">本周累计耗时</p>
                <p className="text-2xl font-bold">12h 45m</p>
                <p className="text-emerald-500 text-xs mt-2 font-medium">↑ 比上周提升 15%</p>
              </div>
              <div className="w-1/2 h-full">
                <ReactECharts option={donutOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>

            {/* GitHub 风格热力图 (纯 Tailwind 实现) */}
            <div className="bg-gray-50 dark:bg-[#242426] rounded-3xl p-6 border border-gray-100 dark:border-transparent">
              <p className="text-xs text-gray-500 mb-3 font-medium">过去 140 天的活跃频率</p>
              {/* 利用 CSS Grid 实现横向矩阵 */}
              <div className="grid grid-rows-7 grid-flow-col gap-1 overflow-x-auto pb-2 scrollbar-hide">
                {heatmapData.map((level, index) => {
                  // 根据等级分配颜色深浅
                  let colorClass = 'bg-gray-200 dark:bg-gray-700'; // 0级：灰色
                  if (level === 1) colorClass = 'bg-blue-200 dark:bg-blue-900/40';
                  if (level === 2) colorClass = 'bg-blue-400 dark:bg-blue-700/60';
                  if (level === 3) colorClass = 'bg-blue-500 dark:bg-blue-600';
                  if (level === 4) colorClass = 'bg-blue-600 dark:bg-blue-500';

                  return (
                    <div 
                      key={index} 
                      className={`w-3 h-3 rounded-sm ${colorClass} hover:ring-1 hover:ring-apple-blue transition-all cursor-crosshair`}
                      title={`活跃等级: ${level}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-end items-center gap-2 mt-2 text-xs text-gray-400">
                <span>少</span>
                <div className="w-2 h-2 rounded-sm bg-gray-200 dark:bg-gray-700" />
                <div className="w-2 h-2 rounded-sm bg-blue-300 dark:bg-blue-800" />
                <div className="w-2 h-2 rounded-sm bg-blue-600 dark:bg-blue-500" />
                <span>多</span>
              </div>
            </div>
          </div>

          {/* 右列：账号基础设置 */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold text-apple-lightText dark:text-apple-darkText flex items-center gap-2">
              ⚙️ 账号与安全
            </h3>
            <div className="space-y-3">
              <button className="w-full p-4 rounded-3xl bg-gray-50 dark:bg-[#242426] flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-transparent group">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-700 dark:text-gray-200">编辑资料</div>
                  <div className="text-xs text-gray-500">修改性别、生日与所在地</div>
                </div>
                <span className="text-gray-300 group-hover:text-apple-blue transition-colors text-xl">→</span>
              </button>

              <button className="w-full p-4 rounded-3xl bg-gray-50 dark:bg-[#242426] flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-transparent group">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-700 dark:text-gray-200">密码安全</div>
                  <div className="text-xs text-gray-500">修改或重置登录密码</div>
                </div>
                <span className="text-gray-300 group-hover:text-purple-500 transition-colors text-xl">→</span>
              </button>

              <button className="w-full p-4 rounded-3xl bg-gray-50 dark:bg-[#242426] flex items-center gap-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border border-gray-100 dark:border-transparent group mt-8">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-red-500">退出登录</div>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}