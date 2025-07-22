import Modal from './Modal';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { forceCloudSync } from '../../api';

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

export const FistAidKillMenu = ({ isFistAidMenuOpen, setIsFistAidMenuOpen }) => {
  const { t } = useTranslation();
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
        
        {/* 显示同步状态信息 */}
        {syncStatus === 'success' && (
          <p style={{ color: 'hsl(172.61deg 100% 41.37%)', fontWeight: 'bold' }}>
            {t('syncSuccessMessage')}
          </p>
        )}
        
        {syncStatus === 'error' && (
          <p style={{ color: '#dc3545', fontWeight: 'bold' }}>
            {t('syncFailedMessage')}
          </p>
        )}
        
        <h3>{t('wifiTroubleshooting')}</h3>
        <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
          <li>{t('wifiPasswordCheck')}</li>
          <li>{t('wifiRangeCheck')}</li>
          <li>{t('restartRouter')}</li>
          <li>{t('checkWifiSettings')}</li>
        </ul>
        <p style={{ textAlign: 'center', color: '#666' }}>
          {t('contactSupport')}
        </p>
      </FistAidKillMenuContainer>
    </Modal>
  );
};