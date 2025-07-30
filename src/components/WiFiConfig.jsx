import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { getWifiList, postWifiConfig, getWifiStatus, setPinturaApiBaseUrl, getPinturaApiBaseUrl, removeToken } from '../api';
import { useAppContext } from './AppContext';
import StatusDisplay from './StatusDisplay.jsx';
import { Spinner, StatusText } from './common/Feedback';
import SignalStrength from './common/SignalStrength';
import { useNavigate } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import { FistAidKillMenu } from './common/FistAidKillMenu';

const GlobalStyle = createGlobalStyle`
  html { 
    /* 默认字体大小 */
    font-size: 16px;
    height: 100%;
    scroll-y: auto;
  }

  /* 横屏模式配置 */
  @media (orientation: landscape) {
    html {
      font-size: 2vw;
    }
  }
  
  /* 竖屏模式配置 */
  @media (orientation: portrait) {
    html {
      font-size: 3vw;
    }
  }

  /* 兼容性配置 - 当浏览器不支持 orientation 时 */
  @media (max-width: 768px) {
    html {
      font-size: 16px;
    }
  }
  @media (min-width: 769px) and (max-width: 1024px) {
    html {
      font-size: 18px;
    }
  }
  @media (min-width: 1025px) {
    html {
      font-size: 20px;
    }
  }
  @media (min-width: 1200px) {
    html {
      font-size: 24px;
    }
  }
  @media (min-width: 1400px) {
    html {
      font-size: 28px;
    }
  }
  @media (min-width: 1600px) {
    html {
      font-size: 32px;
    }
  }
`;

const breatheAnimation = keyframes`
  0% { transform: scale(1); box-shadow: 0 4px 20px rgba(0, 77, 255, 0.3); }
  50% { transform: scale(1.05); box-shadow: 0 6px 25px rgba(0, 77, 255, 0.5); }
  100% { transform: scale(1); box-shadow: 0 4px 20px rgba(0, 77, 255, 0.3); }
`;

// 渐变动画关键帧 - 需要在使用之前定义
const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// 为了语义清晰，重命名为Title，因为它不再总是渐变的
const Title = styled(motion.h1)`
  /* 基础字体和布局设置 */
  font-size: 2.5rem;
  font-weight: auto;
  text-align: center;
  margin-bottom: 0.3rem;
  width: 100%;

  
  /* 交互样式 */
  user-select: none;
  cursor: pointer;


  /* 根据夜间模式应用不同的样式 */
  ${props => props.$isDarkMode 
    ? css`
        /* 夜间模式: 银白色动态渐变 */
        background: linear-gradient(135deg, 
          #888888 0%,
          #cccccc 35%,
          #ffffff 50%,
          #cccccc 65%,
          #888888 100%
        );
      ` 
    : css`
        /* 日间模式: 彩色动态渐变 */
        background: linear-gradient(135deg, 
          hsl(172.61deg 100% 41.37%) 0%,
          hsl(210deg 100% 60%) 25%,
          hsl(270deg 100% 65%) 50%,
          hsl(330deg 100% 70%) 75%,
          hsl(172.61deg 100% 41.37%) 100%
        );
      `
  }
  
  /* 通用渐变和动画样式 */
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${gradientShift} 4s ease-in-out infinite;
`;

const FormContainer = styled(motion.div)`
  background: ${props => props.$isDarkMode ? '#1C1C1E' : 'white'};
  padding: 1rem 1.2rem 1rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, ${props => props.$isDarkMode ? 0.4 : 0.1});
  width: 35rem;
  max-width: 100%;
  align-items: center;
  height: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: visible;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

`;

const FormGroup = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  flex-direction: column;
  margin: 0.1rem 0.05rem 0.1rem;
  padding-top: 0.5rem;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: bold;
  font-size: 1rem;
  color: ${props => props.$isDarkMode ? '#e0e0e0' : '#333'};
  transition: color 0.3s ease;
`;

const Select = styled.select`
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  
  transition: all 0.3s ease;

  /* 根据夜间模式应用不同样式 */
  background-color: ${props => props.$isDarkMode ? '#333' : '#fff'};
  color: ${props => props.$isDarkMode ? '#e0e0e0' : '#333'};
  border: 1px solid ${props => props.$isDarkMode ? '#555' : '#ccc'};

  &:focus {
    outline: none;
    border-color: hsl(172.61deg 100% 41.37%);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  width: 85%;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
  
  /* 根据夜间模式应用不同样式 */
  background-color: ${props => props.$isDarkMode ? '#333' : '#fff'};
  color: ${props => props.$isDarkMode ? '#e0e0e0' : '#333'};
  border: 1px solid ${props => props.$isDarkMode ? '#555' : '#ccc'};

  &:focus {
    outline: none;
    border-color: hsl(172.61deg 100% 41.37%);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Button = styled(motion.button)`
  padding: 0.75rem 0.65rem;
  border-radius: 8px;
  border: none;
  background-color: ${props => props.secondary ? '#6c757d' : 'hsl(172.61deg 100% 41.37%)'};
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  animation: ${props => props.secondary ? 'none' : breatheAnimation} 2s ease-in-out infinite;
  margin-bottom: 0.7rem;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    animation: none;
  }
`;

const TextButton = styled(motion.button)`
  background: none;
  border: none;
  align-items: center;
  font-size: 0.8rem;
  margin-bottom: 0.7rem;
  color: ${props => props.$isDarkMode ? '#e0e0e0' : 'hsl(172.61deg 100% 41.37%)'};
  cursor: pointer;
  transition: color 0.3s ease;
  
  &:hover {
    color: ${props => props.$isDarkMode ? '#ffffff' : 'hsl(172.61deg 100% 35.37%)'};
  }
  
  &:focus {
    outline: none;
    text-decoration: underline;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.4rem;
  width: 100%;
  align-items: center;
`;

const ErrorText = styled.p`
  color: #d93025;
  font-size: 0.875rem;
  margin-top: 0rem;
  margin-bottom: 0.5rem;
  height: 1rem;
`;

const SelectWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
`;


const CustomDropdown = styled.div`
  position: relative;
  width: 85%;
  max-width: 95%;
`;

const DropdownButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  text-align: left;
  border: 1px solid ${props => props.$isDarkMode ? '#555' : '#ccc'};
  background-color: ${props => props.$isDarkMode ? '#444' : '#fff'};
  color: ${props => props.$isDarkMode ? '#f0f0f0' : '#333'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    border-color: ${props => props.$isDarkMode ? '#666' : '#b3b3b3'};
    background-color: ${props => props.$isDarkMode ? '#4a4a4a' : '#f8f8f8'};
  }

  &:focus {
    outline: none;
    border-color: hsl(172.61deg 100% 41.37%);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  span {
    color: ${props => props.$isDarkMode ? '#f0f0f0' : '#333'};
  }
`;

const DropdownArrow = styled.span`
  transition: transform 0.3s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: ${props => props.$isDarkMode ? '#2C2C2E' : '#fff'};
  border: 1px solid ${props => props.$isDarkMode ? '#555' : '#ccc'};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, ${props => props.$isDarkMode ? 0.3 : 0.15});
  z-index: 1000;
  max-height: 22rem; /* 限制最大高度以启用滚动 */
  overflow-y: auto;  /* 确保内容溢出时显示滚动条 */
  margin-top: 4px;
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.$isDarkMode ? '#444' : '#f1f1f1'};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.$isDarkMode ? '#666' : '#c1c1c1'};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.$isDarkMode ? '#777' : '#a8a8a8'};
  }
`;

const DropdownOption = styled.div`
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid ${props => props.$isDarkMode ? '#444' : '#eee'};
  transition: background-color 0.2s ease, color 0.2s ease;
  color: ${props => props.$isDarkMode ? '#f0f0f0' : '#333'};
  font-size: 1rem;
  font-weight: 500;
  height: 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: ${props => props.$isDarkMode ? '#3a3a3c' : '#f5f5f5'};
    color: ${props => props.$isDarkMode ? '#ffffff' : '#000'};
  }

  &:last-child {
    border-bottom: none;
  }

  &.selected {
    background-color: hsl(172.61deg 100% 41.37%);
    color: white;
    font-weight: 600;
    
    &:hover {
      background-color: hsl(172.61deg 100% 35.37%);
      color: white;
    }
  }
`;

const WifiOptionContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const WifiOptionSignal = styled.div`
  width: 22px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 8px;
`;

const SavedIndicator = styled.span`
  color: hsl(172.61deg 100% 41.37%);
  font-size: 0.8rem;
  margin-left: 4px;
  font-weight: 500;
`;


const FullWidthInput = styled(Input)`
    width: 85%; /* Match the select's width */
`;

const SignalContainer = styled.div`
    width: auto;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const MainContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ScreenIdDisplay = styled.p`
  color: ${props => props.$isDarkMode ? '#b0b0b0' : '#666'};
  font-size: 0.9rem;
  text-align: center;
  transition: color 0.3s ease;
  margin-top: 0rem;
  margin-bottom: 0.3rem;
`;

const WiFiConfig = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { screenId, isDarkMode, setDarkMode } = useAppContext();
  const [wifiList, setWifiList] = useState([]);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, connecting, success, password_error, timeout
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const pollingTimeoutRef = useRef(null);
  const pollingStartTimeRef = useRef(null);
  const [noWifiFound, setNoWifiFound] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingDropdown, setIsLoadingDropdown] = useState(false);
  const [isFistAidMenuOpen, setIsFistAidMenuOpen] = useState(false);
  // 开发模式切换相关状态
  const clickCount = useRef(0);
  const lastClickTime = useRef(0);

  // WiFi信息本地存储相关函数
  const saveWifiInfo = useCallback((wifiSsid, wifiPassword) => {
    try {
      const wifiInfoKey = 'wifiInfo';
      let wifiInfo = {};
      
      // 获取已存储的WiFi信息
      const existingWifiInfo = localStorage.getItem(wifiInfoKey);
      if (existingWifiInfo) {
        wifiInfo = JSON.parse(existingWifiInfo);
      }
      
      // 添加或更新WiFi信息
      wifiInfo[wifiSsid] = wifiPassword;
      
      // 保存到本地存储
      localStorage.setItem(wifiInfoKey, JSON.stringify(wifiInfo));
      console.log('WiFi信息已保存到本地存储:', wifiSsid);
    } catch (error) {
      console.error('保存WiFi信息失败:', error);
    }
  }, []);

  const loadWifiInfo = useCallback((wifiSsid) => {
    try {
      const wifiInfoKey = 'wifiInfo';
      const existingWifiInfo = localStorage.getItem(wifiInfoKey);
      
      if (existingWifiInfo) {
        const wifiInfo = JSON.parse(existingWifiInfo);
        const savedPassword = wifiInfo[wifiSsid];
        
        if (savedPassword) {
          setPassword(savedPassword);
          console.log('已从本地存储加载WiFi密码:', wifiSsid);
          return true;
        } else {
          setPassword('');
        }
      }
    } catch (error) {
      console.error('加载WiFi信息失败:', error);
    }
    return false;
  }, []);

  const getAllWifiInfo = useCallback(() => {
    try {
      const wifiInfoKey = 'wifiInfo';
      const existingWifiInfo = localStorage.getItem(wifiInfoKey);
      
      if (existingWifiInfo) {
        return JSON.parse(existingWifiInfo);
      }
    } catch (error) {
      console.error('获取所有WiFi信息失败:', error);
    }
    return {};
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Cleanup polling on component unmount
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const fetchWifiList = useCallback(async (preserveCurrentSelection = false) => {
    setIsLoadingList(true);
    setError(null);
    setNoWifiFound(false);
    try {
      const list = await getWifiList();
      setWifiList(list);

      if (list.length === 0) {
        setNoWifiFound(true);
      } else if (!preserveCurrentSelection) {
        // 获取所有已保存的WiFi信息
        const savedWifiInfo = getAllWifiInfo();
        
        // 尝试找到已保存的WiFi并自动选择
        let foundSavedWifi = false;
        for (const wifi of list) {
          if (savedWifiInfo[wifi.ssid]) {
            setSsid(wifi.ssid);
            setPassword(savedWifiInfo[wifi.ssid]);
            foundSavedWifi = true;
            console.log('自动选择已保存的WiFi:', wifi.ssid);
            break;
          }
        }
        
        // 如果没有找到已保存的WiFi，选择第一个
        if (!foundSavedWifi) {
          setSsid(list[0].ssid);
          setPassword('');
        }
      }
    } catch (err) {
      console.error('Failed to fetch WiFi list:', err);
      setError(`${t('statusError')} (debug_info: ${err.message || ''})`);
    } finally {
      setIsLoadingList(false);
    }
  }, [t, getAllWifiInfo]);

  useEffect(() => {
    fetchWifiList();
  }, [fetchWifiList]);

  // 当SSID改变时，尝试加载对应的密码
  useEffect(() => {
    if (ssid && status === 'idle') {
      loadWifiInfo(ssid);
    }
  }, [ssid, status]);

  const startPolling = useCallback(() => {
    stopPolling(); // 确保没有多个轮询循环在运行
    pollingStartTimeRef.current = Date.now();
    
    const poll = async () => {
      // 检查是否超时（60秒）
      if (Date.now() - pollingStartTimeRef.current > 60000) {
        stopPolling();
        setStatus('timeout');
        return;
      }

      try {
        const result = await getWifiStatus();
        if (result.status === 'connecting') {
          // 如果仍在连接中，则在1秒后安排下一次轮询
          pollingTimeoutRef.current = setTimeout(poll, 1000); 
        } else {
          // 如果状态已更改，则停止轮询并更新状态
          stopPolling();
          setStatus(result.status);
          
          // 如果连接成功，保存WiFi信息到本地
          if (result.status === 'success') {
            saveWifiInfo(ssid, password);
          }

          if (result.status === 'passerror') {
            setStatus('password_error');
            setError(`${t('statusPasswordError')}`);
          }
        }
      } catch (err) {
        stopPolling();
        setStatus('error');
        setError(`${t('statusError')} (debug_info: ${err.message || ''})`);
      }
    };

    poll(); // 立即开始第一次轮询
  }, [stopPolling, t, ssid, password, saveWifiInfo]);

  const getSignalLevel = (dbm) => {
    if (dbm > -50) return 5; // Excellent
    if (dbm > -65) return 4; // Good
    if (dbm > -75) return 3; // Fair
    if (dbm > -85) return 2; // Weak
    return 1; // Very Weak
  };

  const selectedWifi = wifiList.find(wifi => wifi.ssid === ssid);
  const signalLevel = selectedWifi ? getSignalLevel(selectedWifi.signal) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!password) {
      setFormError(t('passwordRequired'));
      return;
    }
    const confirmationMessage = `${t('confirmPasswordPrompt')}\n\n${t('wifiPassword')}: ${password}`;
    if (window.confirm(confirmationMessage)) {
      setStatus('connecting');
      setError(null);
      try {
        const response = await postWifiConfig(ssid, password);
        console.log('postWifiConfig response:', response);
        if (response.success == true) {
          startPolling();
        } else {
          setStatus('error');
          setError(`${t('statusError')} (debug_info: ${response}} || "")`);
        }
      } catch (err) {
        setStatus('error');
        setError(`${t('statusError')} (debug_info: ${err.message || ''})`);
      }
    }
  };
  
  const handleReset = () => {
    setStatus('idle');
    setError(null);
    setFormError('');
    // Do not reset password to allow for quick retries
  };


  // 处理标题点击 - 开发模式切换
  const handleTitleClick = () => {
    const now = Date.now();
    
    // 如果点击间隔超过1秒，重置计数
    if (now - lastClickTime.current > 1000) {
      clickCount.current = 0;
    }

    clickCount.current += 1;
    lastClickTime.current = now;

    if (clickCount.current >= 7) {
      const devUrl = 'http://139.224.192.36:8082';
      const currentBaseUrl = getPinturaApiBaseUrl();
      if (currentBaseUrl === devUrl) {
        setPinturaApiBaseUrl("");
        removeToken();
        alert(`已退出测试环境`)
      } else {
        setPinturaApiBaseUrl(devUrl);
        alert(`已切换到开发模式。\nAPI 地址: ${devUrl}`);
        removeToken();
      }
      
      clickCount.current = 0; // 重置计数
    }
  };

  // 处理下拉框点击
  const handleDropdownClick = async () => {
    if (status !== 'idle' || isLoadingDropdown) return;
    
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
      return;
    }

    // 开始加载，但不立即展开
    setIsLoadingDropdown(true);
    setIsDropdownOpen(false); // 确保下拉框关闭
    
    try {
      await fetchWifiList(true); // 保持当前选择
      // 只有在请求成功后才展开下拉框
      setIsDropdownOpen(true);
    } catch (error) {
      console.error('Failed to fetch WiFi list:', error);
      // 请求失败时不展开下拉框
    } finally {
      setIsLoadingDropdown(false);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (event) => {
    if (status !== 'idle') return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDropdownClick();
    } else if (event.key === 'Escape' && isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  };

  // 处理WiFi选择
  const handleWifiSelect = (selectedSsid) => {
    setSsid(selectedSsid);
    setIsDropdownOpen(false);
  };

  // 处理急救包按钮点击
  const handleFirstAidClick = () => {
    setIsFistAidMenuOpen(true);
  };

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.custom-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);


  if (error && status === 'idle' && !isLoadingList) {
      return (
          <FormContainer>
              <StatusText>{error}</StatusText>
              <Button onClick={fetchWifiList}>{t('retry')}</Button>
          </FormContainer>
      )
  }

  if (noWifiFound) {
    return (
        <FormContainer>
            <StatusText>{t('noWifiFound')}</StatusText>
            <Button onClick={fetchWifiList}>{t('retry')}</Button>
        </FormContainer>
    )
  }

  return (
    <>
      <GlobalStyle />
      <FistAidKillMenu 
        isFistAidMenuOpen={isFistAidMenuOpen} 
        setIsFistAidMenuOpen={setIsFistAidMenuOpen} 
      />
      <MainContainer>
        <Title
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          onClick={handleTitleClick}
          $isDarkMode={isDarkMode}
        >
          {t('title')}
        </Title>
        {screenId && <ScreenIdDisplay $isDarkMode={isDarkMode}>Pintura: {screenId}</ScreenIdDisplay>}
        <FormContainer 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          $isDarkMode={isDarkMode}
        >
          <AnimatePresence>
              {status !== 'idle' && <StatusDisplay status={status} error={error} onReset={handleReset} />}
          </AnimatePresence>
          
          <form onSubmit={handleSubmit} style={{ visibility: status !== 'idle' ? 'hidden' : 'visible' }}>
                <FormGroup>
                    <Label htmlFor="wifi-ssid" $isDarkMode={isDarkMode}>{t('wifiSsid')}</Label>
                    <SelectWrapper>
                        <CustomDropdown className="custom-dropdown">
                          <DropdownButton
                            onClick={handleDropdownClick}
                            onKeyDown={handleKeyDown}
                            disabled={status !== 'idle'}
                            $isDarkMode={isDarkMode}
                            type="button"
                            tabIndex={0}
                            role="combobox"
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="listbox"
                          >
                            <span>{ssid || t('selectWifi')}</span>
                            <DropdownArrow $isOpen={isDropdownOpen}>▼</DropdownArrow>
                          </DropdownButton>
                          
                          {isDropdownOpen && !isLoadingDropdown && (
                            <DropdownMenu $isDarkMode={isDarkMode} role="listbox">
                              {wifiList.map((wifi, index) => {
                                const wifiSignalLevel = getSignalLevel(wifi.signal);
                                const savedWifiInfo = getAllWifiInfo();
                                const isSaved = savedWifiInfo[wifi.ssid];
                                
                                return (
                                  <DropdownOption
                                    key={`${wifi.ssid}-${index}`}
                                    onClick={() => handleWifiSelect(wifi.ssid)}
                                    className={wifi.ssid === ssid ? 'selected' : ''}
                                    $isDarkMode={isDarkMode}
                                    role="option"
                                    aria-selected={wifi.ssid === ssid}
                                  >
                                    <WifiOptionContent>
                                      <span>{wifi.ssid}</span>
                                      {isSaved && (
                                        <SavedIndicator>✓</SavedIndicator>
                                      )}
                                    </WifiOptionContent>
                                    <WifiOptionSignal>
                                      <SignalStrength 
                                        level={wifiSignalLevel} 
                                        isSelected={wifi.ssid === ssid}
                                      />
                                    </WifiOptionSignal>
                                  </DropdownOption>
                                );
                              })}
                            </DropdownMenu>
                          )}
                          
                        </CustomDropdown>
                        <SignalContainer>
                          {isLoadingDropdown ? <Spinner size="20px"/> : signalLevel && <SignalStrength level={signalLevel} />}
                        </SignalContainer>
                        
                    </SelectWrapper>
                </FormGroup>
                <FormGroup>
                    <Label htmlFor="wifi-password" style={{marginTop: '0rem', marginBottom: '0.5rem' }} $isDarkMode={isDarkMode}>{t('wifiPassword')}</Label>
                    <FullWidthInput id="wifi-password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} disabled={status !== 'idle'} $isDarkMode={isDarkMode}/>
                    <ErrorText>{formError}</ErrorText>
                </FormGroup>
                <ButtonContainer>
                  <Button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={status !== 'idle'}>
                      {t('connect')}
                  </Button>
                  <Button type="button" secondary onClick={() => navigate('/create-groups')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={status !== 'idle'}>
                      {t('createGroup')}
                  </Button>
                  <TextButton
                    type="button"
                    onClick={handleFirstAidClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    $isDarkMode={isDarkMode}
                  >
                    {t('fistAidKit')}
                  </TextButton>
                </ButtonContainer>
          </form>
        </FormContainer>
      </MainContainer>
    </>
  );
};

export default WiFiConfig; 