import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { getWifiList, postWifiConfig, getWifiStatus } from '../api';
import StatusDisplay from './StatusDisplay';
import { Spinner, StatusText } from './common/Feedback';
import SignalStrength from './common/SignalStrength';

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
  background-color: hsl(172.61deg 100% 41.37%);
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  animation: ${breatheAnimation} 2s ease-in-out infinite;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    animation: none;
  }
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

const WiFiConfig = () => {
  const { t } = useTranslation();
  const [wifiList, setWifiList] = useState([]);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, connecting, success, password_error, timeout
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const pollingIntervalRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
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
    try {
      const list = await getWifiList();
      setWifiList(list);

      const savedSsid = localStorage.getItem('wifiSsid');
      const savedPassword = localStorage.getItem('wifiPassword');

      if (savedSsid && savedPassword && list.some(wifi => wifi.ssid === savedSsid)) {
        setSsid(savedSsid);
        setPassword(savedPassword);
      } else if (list.length > 0) {
        setSsid(list[0].ssid);
        setPassword('');
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
    stopPolling(); // Ensure no multiple intervals are running

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const result = await getWifiStatus();
        if (result.status !== 'connecting') {
          stopPolling();
          setStatus(result.status);
        }
      } catch (err) {
        stopPolling();
        setStatus('error');
        setError(t('statusError'));
      }
    }, 1000); // Poll every 1 second
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
        if (response.success) {
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
  }

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

  return (
    <FormContainer initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <AnimatePresence>
          {status !== 'idle' && <StatusDisplay status={status} error={error} onReset={handleReset} />}
      </AnimatePresence>
      
      <form onSubmit={handleSubmit} style={{ visibility: status !== 'idle' ? 'hidden' : 'visible' }}>
            <FormGroup>
                <Label htmlFor="wifi-ssid">{t('wifiSsid')}</Label>
                <SelectWrapper>
                    <CustomSelect id="wifi-ssid" value={ssid} onChange={(e) => setSsid(e.target.value)} disabled={status !== 'idle'}>
                        {wifiList.map((wifi) => (
                            <option key={wifi.ssid} value={wifi.ssid}>
                                {wifi.ssid}
                            </option>
                        ))}
                    </CustomSelect>
                    <SignalContainer>
                        {signalLevel && <SignalStrength level={signalLevel} />}
                    </SignalContainer>
                </SelectWrapper>
            </FormGroup>
            <FormGroup style={{ marginTop: '5px', marginBottom: '5px' }}>
                <Label htmlFor="wifi-password">{t('wifiPassword')}</Label>
                <FullWidthInput id="wifi-password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} disabled={status !== 'idle'}/>
                <ErrorText style={{ marginTop: '5px', marginBottom: '5px' }}>{formError}</ErrorText>
            </FormGroup>
            <Button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={status !== 'idle'}>
                {t('connect')}
            </Button>
      </form>
    </FormContainer>
  );
};

export default WiFiConfig; 