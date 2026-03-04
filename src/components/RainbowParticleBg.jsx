import { useRef, useEffect, useState } from 'react';

// 自定义 Hooks，用于监听窗口大小变化
function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
}

export default function RainbowParticleBg() {
  const canvasRef = useRef(null);
  const size = useWindowSize();
  // 用于存储粒子实例的数组
  const particles = useRef([]); 
  const animationFrameId = useRef(null);

  // --- 粒子配置 (可根据需要微调) ---
  const PARTICLE_COUNT = 300;     // 粒子数量 (鱼群规模)
  const PARTICLE_BASE_SIZE = 1.2;  // 粒子基础大小 (颗粒度)
  const BASE_SPEED = 0.8;          // 基础流动速度
  const TRAIL_ALPHA = 0.08;        // 拖尾透明度 (越小拖尾越长，看起来越灵动)

  // 1. 初始化粒子 (在窗口加载或大小变化时)
  useEffect(() => {
    const canvas = canvasRef.getcurrent;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // 设置 Canvas 分辨率 (适配视网膜屏)
    canvas.width = size.width * window.devicePixelRatio;
    canvas.height = size.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // 清空旧粒子，重新生成
    particles.current = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.current.push({
        // 随机初始位置
        x: Math.random() * size.width,
        y: Math.random() * size.height,
        // 随机基础速度因子，让它们看起来有先有后
        speedFactor: 0.5 + Math.random(),
        // 随机角度偏移，避免完全一致
        angleOffset: Math.random() * Math.PI * 2, 
        // 粒子大小微小变化
        size: PARTICLE_BASE_SIZE + Math.random() * 0.5,
        // HSL 颜色模式：H (色相 0-360), S (饱和度), L (亮度)
        // 初始色相基于 Y 轴坐标，形成初始的彩虹分层
        hue: (i / PARTICLE_COUNT) * 360, 
      });
    }
  }, [size]);

  // 2. 核心动画循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // 检查当前是否为暗黑模式
    const isDark = document.documentElement.classList.contains('dark');

    const animate = (time) => {
      // 用于计算时间相关的变量 (比如动画速度)
      const t = time * 0.001; 

      // --- A. 绘制拖尾效果 ---
      // 关键技巧：不完全清空画布，而是覆盖一层带有很高透明度的背景色
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = isDark 
        ? `rgba(0, 0, 0, ${TRAIL_ALPHA})` // 暗夜模式背景 (纯黑)
        : `rgba(245, 245, 247, ${TRAIL_ALPHA})`; // 白天模式背景 (苹果浅灰)
      ctx.fillRect(0, 0, size.width, size.height);

      // --- B. 更新并绘制粒子 (鱼群流动逻辑) ---
      // 使用 lighter 模式，粒子重叠时会变亮，看起来更有生机
      ctx.globalCompositeOperation = 'lighter'; 

      particles.current.forEach(p => {
        // --- “有规律鱼群流动”数学魔法 ---
        // 1. 根据粒子当前坐标 (x, y) 和时间 (t)，利用 sin/cos 算出当前的“水流角度”
        // 这是一个简单的向量场 (Vector Field) 公式
        // 增加数学常数（如 0.003, 0.005）可以调节水流的弯曲程度
        const flowAngle = 
          Math.sin(p.x * 0.003 + t) + 
          Math.cos(p.y * 0.005 + t * 0.5) + 
          p.angleOffset;

        // 2. 根据角度算出速度向量 (vx, vy)
        const vx = Math.cos(flowAngle) * BASE_SPEED * p.speedFactor;
        const vy = Math.sin(flowAngle) * BASE_SPEED * p.speedFactor;

        // 3. 更新粒子位置
        p.x += vx;
        p.y += vy;

        // 4. “彩虹”色相随时间缓慢变化
        p.hue = (p.hue + 0.5) % 360;

        // --- C. 处理边界 (让鱼群循环流动) ---
        if (p.x > size.width) p.x = 0;
        if (p.x < 0) p.x = size.width;
        if (p.y > size.height) p.y = 0;
        if (p.y < 0) p.y = size.height;

        // --- D. 绘制粒子 ---
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // HSL 颜色：色相(H)随时间变，饱和度(S)高(80%)，亮度(L)在暗夜模式下要提高以便看清
        ctx.fillStyle = isDark
          ? `hsla(${p.hue}, 80%, 75%, 0.9)` // 暗夜模式：亮彩虹
          : `hsla(${p.hue}, 80%, 55%, 0.8)`; // 白天模式：标准彩虹
        ctx.fill();
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // 启动动画
    animationFrameId.current = requestAnimationFrame(animate);

    // 清理函数：组件卸载时停止动画，防止内存泄漏
    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [size]); // 依赖 size，确保大小变化时重新设定动画参数

  return (
    <canvas 
      ref={canvasRef} 
      // 铺满全屏，定位在底层 (z-0)
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" 
      style={{ width: `${size.width}px`, height: `${size.height}px` }}
    />
  );
}