import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { motion } from 'framer-motion';

import WiFiConfig from '../components/WiFiConfig';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useAppContext } from '../components/AppContext';
import { getScreenId, setPinturaApiBaseUrl } from '../api';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f0f2f5;
  font-family: 'Inter', sans-serif;
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Title = styled(motion.h1)`
  user-select: none; /* Prevents text selection */
  cursor: pointer; /* Indicates it's clickable */
`;

function Home() {
  const { t } = useTranslation();
  const { setScreenId } = useAppContext();

  const clickCount = useRef(0);
  const lastClickTime = useRef(0);

  useEffect(() => {
    const fetchScreenId = async () => {
      try {
        const id = await getScreenId();
        setScreenId(id);
      } catch (error) {
        console.error('Failed to fetch screen ID:', error);
        // Optionally, set an error state in the context
      }
    };
    fetchScreenId();
  }, [setScreenId]);

  const handleTitleClick = () => {
    const now = Date.now();
    
    // Reset if clicks are too far apart (e.g., > 1 second)
    if (now - lastClickTime.current > 1000) {
      clickCount.current = 0;
    }

    clickCount.current += 1;
    lastClickTime.current = now;

    if (clickCount.current >= 7) {
      const devUrl = 'http://139.224.192.36:8082';
      setPinturaApiBaseUrl(devUrl);
      alert(`已切换到开发模式。\nAPI 地址: ${devUrl}`);
      clickCount.current = 0; // Reset after activation
    }
  };

  return (
    <AppContainer>
      <LanguageSwitcher />
      <Title
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onClick={handleTitleClick}
      >
        {t('title')}
      </Title>
      <WiFiConfig />
    </AppContainer>
  );
}

export default Home; 