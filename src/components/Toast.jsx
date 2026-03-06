import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 3秒后启动“退出动画”
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2000);

    // 退出动画持续0.3秒后，正式触发销毁逻辑
    const closeTimer = setTimeout(() => {
      if (isExiting) onClose();
    }, 3300);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [isExiting, onClose]);

  const bgStyles = {
    success: 'bg-emerald-500/80 dark:bg-emerald-600/90 text-white shadow-[0_10px_40px_rgba(16,185,129,0.3)]',
    error: 'bg-rose-500/80 dark:bg-rose-600/90 text-white shadow-[0_10px_40px_rgba(244,63,94,0.3)]',
    info: 'bg-white/80 dark:bg-stone-800/90 text-stone-900 dark:text-white shadow-[0_10px_40px_rgba(0,0,0,0.1)]',
    warning: 'bg-amber-500/80 dark:bg-amber-600/90 text-white shadow-[0_10px_40px_rgba(245,158,11,0.3)]'
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  const currentStyle = bgStyles[type] || bgStyles.info;
  const currentIcon = icons[type] || icons.info;

  return (
    <div className={`pointer-events-auto ${isExiting ? 'animate-apple-out' : 'animate-apple-in'}`}>
      <div className={`${currentStyle} backdrop-blur-xl px-6 py-4 rounded-[22px] flex items-center gap-4 border border-white/20 min-w-[320px] max-w-[450px] shadow-lg transition-all`}>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg shrink-0">
          {icons[type] || icons.info}
        </div>
        <p className="font-semibold tracking-tight text-sm leading-tight">{message}</p>
      </div>
    </div>
  );
}