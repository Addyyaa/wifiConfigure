import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [wifiList, setWifiList] = useState([]);
  const [screenId, setScreenId] = useState('');
  
  // 用于标记用户是否已在本会话中手动切换过主题
  const [hasManualOverride, setHasManualOverride] = useState(false);

  // 应用的初始主题状态，总是优先基于系统设置
  const [isDarkMode, setIsDarkMode] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // 监听系统主题的变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // 只有在用户没有手动覆盖时，才跟随系统变化
      if (!hasManualOverride) {
        setIsDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // 清理监听器
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [hasManualOverride]); // 依赖项确保逻辑在需要时更新

  // 提供给切换按钮的函数
  const setManualDarkMode = (value) => {
    // 标记用户已手动操作
    setHasManualOverride(true);
    // 更新主题状态
    setIsDarkMode(value);
  };

  const value = {
    wifiList,
    setWifiList,
    screenId,
    setScreenId,
    isDarkMode,
    setDarkMode: setManualDarkMode, // 将新的切换函数暴露给Context
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 