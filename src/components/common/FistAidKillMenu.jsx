import Modal from './Modal';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { forceCloudSync } from '../../api';
import { useAppContext } from '../AppContext';

const FistAidKillMenuContainer = styled.div`
  display: flex;
  user-select: none;
  -webkit-user-select: none;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 0;
  gap: 1.5rem;
`;

const SyncButton = styled.button`
  user-select: none;
  font-size: 1rem;
  -webkit-user-select: none;
  padding: 0.75rem 0.65rem;
  border-radius: 8px;
  border: none;
  background-color: ${props => {
    if (props.disabled) return '#6c757d';
    if (props.$isSuccess) return 'hsl(172.61deg 100% 41.37%)';
    if (props.$isError) return '#dc3545';
    return 'hsl(172.61deg 100% 41.37%)';
  }};
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  margin-bottom: 0.7rem;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: ${props => props.disabled ? 1 : 0.8};
  }
`;

const TroubleshootingTitle = styled.h3`
  color: ${props => props.$isDarkMode ? '#e0e0e0' : '#333'};
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
  text-align: center;
  transition: color 0.3s ease;
`;

const TroubleshootingList = styled.ul`
  text-align: left;
  line-height: 1.6;
  margin: 0;
  padding-left: 1.5rem;
  list-style: none;
  
  li {
    position: relative;
    color: ${props => props.$isDarkMode ? '#e0e0e0' : '#333'};
    margin-bottom: 0.5rem;
    transition: color 0.3s ease;
    
    &::before {
      content: '•';
      position: absolute;
      left: -1.2rem;
      color: ${props => props.$isDarkMode ? '#888' : '#666'};
      font-weight: bold;
      font-size: 1.2rem;
      transition: color 0.3s ease;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const SupportText = styled.p`
  text-align: center;
  color: ${props => props.$isDarkMode ? '#b0b0b0' : '#666'};
  margin: 0;
  transition: color 0.3s ease;
`;

export const FistAidKillMenu = ({ isFistAidMenuOpen, setIsFistAidMenuOpen }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useAppContext();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // 'success', 'error', null

  async function handleSync() {
    setIsSyncing(true);
    setSyncStatus(null);
    
    try {
      const result = await forceCloudSync();
      if (result.status === 'success') {
        setSyncStatus('success');
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('同步失败:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  }

  // 获取按钮文本
  const getButtonText = () => {
    if (isSyncing) return `🔄 ${t('syncing')}`;
    if (syncStatus === 'success') return `✅ ${t('syncSuccess')}`;
    if (syncStatus === 'error') return `❌ ${t('syncFailed')}`;
    return `🚑 ${t('fistAidKit')}`;
  };

  return (
    <Modal 
      isOpen={isFistAidMenuOpen} 
      onClose={() => setIsFistAidMenuOpen(false)}
      title=""
      style={{
        width: '95%',
        maxWidth: '800px',
        minHeight: '400px',
        overflow: 'auto',
        padding: '1.5rem',
        gap: '1.5rem'
      }}
    >
      <FistAidKillMenuContainer>    
        <SyncButton
          onClick={handleSync}
          disabled={isSyncing}
          $isSuccess={syncStatus === 'success'}
          $isError={syncStatus === 'error'}
        >
          {getButtonText()}
        </SyncButton>
        
        <TroubleshootingTitle $isDarkMode={isDarkMode}>
          {t('wifiTroubleshooting')}
        </TroubleshootingTitle>
        
        <TroubleshootingList $isDarkMode={isDarkMode}>
          <li>{t('wifiPasswordCheck')}</li>
          <li>{t('wifiRangeCheck')}</li>
          <li>{t('wifiInfoConfirm')}</li>
          <li>{t('restartRouter')}</li>
          <li>{t('checkWifiSettings')}</li>
        </TroubleshootingList>
        
        <SupportText $isDarkMode={isDarkMode}>
          {t('contactSupport')}
        </SupportText>
      </FistAidKillMenuContainer>
    </Modal>
  );
};