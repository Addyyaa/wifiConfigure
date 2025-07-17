import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { getWifiList, postWifiConfig, getWifiStatus } from '../api';
import { useAppContext } from './AppContext';
import StatusDisplay from './StatusDisplay.jsx';
import { Spinner, StatusText } from './common/Feedback';
import SignalStrength from './common/SignalStrength';
import { useNavigate } from 'react-router-dom';

const breatheAnimation = keyframes`
  0% { transform: scale(1); box-shadow: 0 4px 20px rgba(0, 77, 255, 0.3); }
  50% { transform: scale(1.05); box-shadow: 0 6px 25px rgba(0, 77, 255, 0.5); }
  100% { transform: scale(1); box-shadow: 0 4px 20px rgba(0, 77, 255, 0.3); }
`;

const FormContainer = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 1.5rem;
    gap: 1rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: bold;
  font-size: 1rem;
  color: #333;
`;

const Select = styled.select`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  width: 100%;
  &:focus {
    outline: none;
    border-color: hsl(172.61deg 100% 41.37%);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  width: 100%;
  &:focus {
    outline: none;
    border-color: hsl(172.61deg 100% 41.37%);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background-color: ${props => props.secondary ? '#6c757d' : 'hsl(172.61deg 100% 41.37%)'};
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  animation: ${props => props.secondary ? 'none' : breatheAnimation} 2s ease-in-out infinite;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    animation: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
`;

const ErrorText = styled.p`
  color: #d93025;
  font-size: 0.875rem;
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
  height: 1rem;
`;

const SelectWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

const CustomSelect = styled(Select)`
  width: calc(100% - 32px); /* Full width minus gap and signal icon width */
`;

const FullWidthInput = styled(Input)`
    width: calc(100% - 32px); /* Match the select's width */
`;

const SignalContainer = styled.div`
    width: 22px; /* Fixed width for the signal icon container */
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ScreenIdDisplay = styled.p`
  color: #666;
  font-size: 0.9rem;
  text-align: center;
  margin-top: -10px;
  margin-bottom: 20px;
`;

const WiFiConfig = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { screenId } = useAppContext();
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

  const fetchWifiList = useCallback(async () => {
    setIsLoadingList(true);
    setError(null);
    setNoWifiFound(false);
    try {
      const list = await getWifiList();
      setWifiList(list);

      if (list.length === 0) {
        setNoWifiFound(true);
      } else {
        const savedSsid = localStorage.getItem('wifiSsid');
        const savedPassword = localStorage.getItem('wifiPassword');

        if (savedSsid && savedPassword && list.some(wifi => wifi.ssid === savedSsid)) {
          setSsid(savedSsid);
          setPassword(savedPassword);
        } else {
          setSsid(list[0].ssid);
          setPassword('');
        }
      }
    } catch (err) {
      console.error('Failed to fetch WiFi list:', err);
      setError(t('statusError'));
    } finally {
      setIsLoadingList(false);
    }
  }, [t]);

  useEffect(() => {
    fetchWifiList();
  }, [fetchWifiList]);

  useEffect(() => {
    if (status === 'success') {
      localStorage.setItem('wifiSsid', ssid);
      localStorage.setItem('wifiPassword', password);
    }
  }, [status, ssid, password]);

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
        }
      } catch (err) {
        stopPolling();
        setStatus('error');
        setError(t('statusError'));
      }
    };

    poll(); // 立即开始第一次轮询
  }, [stopPolling, t]);

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
        if (response == 'success') {
          startPolling();
        } else {
          setStatus('error');
          setError(t('statusError'));
        }
      } catch (err) {
        setStatus('error');
        setError(t('statusError'));
      }
    }
  };
  
  const handleReset = () => {
    setStatus('idle');
    setError(null);
    setFormError('');
    // Do not reset password to allow for quick retries
  };

  if (isLoadingList) {
      return (
          <FormContainer>
              <Spinner />
              <StatusText>{t('connecting')}</StatusText>
          </FormContainer>
      )
  }

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
      {screenId && <ScreenIdDisplay>Pintura: {screenId}</ScreenIdDisplay>}
      <FormContainer initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <AnimatePresence>
            {status !== 'idle' && <StatusDisplay status={status} error={error} onReset={handleReset} />}
        </AnimatePresence>
        
        <form onSubmit={handleSubmit} style={{ visibility: status !== 'idle' ? 'hidden' : 'visible' }}>
              <FormGroup>
                  <Label htmlFor="wifi-ssid" style={{marginBottom: '2%'}}>{t('wifiSsid')}</Label>
                  <SelectWrapper>
                      <CustomSelect id="wifi-ssid" value={ssid} onChange={(e) => setSsid(e.target.value)} disabled={status !== 'idle'}>
                          {wifiList.map((wifi, index) => ( 
                              <option key={`${wifi.ssid}-${index}`}>
                                  {wifi.ssid}
                              </option>
                          ))}
                      </CustomSelect>
                      <SignalContainer>
                          {signalLevel && <SignalStrength level={signalLevel} />}
                      </SignalContainer>
                  </SelectWrapper>
              </FormGroup>
              <FormGroup>
                  <Label htmlFor="wifi-password" style={{marginTop: '2%', marginBottom: '2%'}}>{t('wifiPassword')}</Label>
                  <FullWidthInput id="wifi-password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} disabled={status !== 'idle'}/>
                  <ErrorText style={{ marginTop: '5px', marginBottom: '5px' }}>{formError}</ErrorText>
              </FormGroup>
              <ButtonContainer>
                <Button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={status !== 'idle'}>
                    {t('connect')}
                </Button>
                <Button type="button" secondary onClick={() => navigate('/create-groups')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={status !== 'idle'}>
                    {t('createGroup')}
                </Button>
              </ButtonContainer>
        </form>
      </FormContainer>
    </>
  );
};

export default WiFiConfig; 