import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Spinner, StatusText as BaseStatusText } from './common/Feedback';
import { useAppContext } from './AppContext';

const StatusOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.$isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background-color 0.3s ease;
  padding: 1rem;
`;

const StatusContent = styled.div`
  background: ${props => props.$isDarkMode ? '#1C1C1E' : 'white'};
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, ${props => props.$isDarkMode ? 0.4 : 0.1});
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: calc(500px - 4rem); /* Match FormContainer width minus padding */
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
`;

const StatusText = styled(BaseStatusText)`
  color: ${props => props.$isDarkMode ? '#e0e0e0' : '#333'};
  transition: color 0.3s ease;
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
  transition: background-color 0.3s ease;
`;

const StatusDisplay = ({ status, error, onReset }) => {
    const { t } = useTranslation();
    const { isDarkMode } = useAppContext();

    const messages = {
        connecting: t('connecting'),
        success: t('statusSuccess'),
        password_error: t('statusPasswordError'),
        timeout: t('statusTimeout'),
        error: error || t('statusError'),
    };

    const message = messages[status];

    const getButtonText = () => {
        switch (status) {
            case 'success':
                return t('ok');
            case 'timeout':
            case 'password_error':
            case 'error':
                return t('retry');
            default:
                return t('ok');
        }
    };

    if (!message) return null;

    return (
        <StatusOverlay 
            $isDarkMode={isDarkMode} 
            key={status} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
        >
          <StatusContent $isDarkMode={isDarkMode}>
            {status === 'connecting' ? <Spinner /> : null}
            <StatusText $isDarkMode={isDarkMode}>{message}</StatusText>
            {status !== 'connecting' && (
                <Button onClick={onReset} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {getButtonText()}
                </Button>
            )}
          </StatusContent>
        </StatusOverlay>
    );
};

export default StatusDisplay; 