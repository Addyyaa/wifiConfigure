import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { motion } from 'framer-motion';

import WiFiConfig from './components/WiFiConfig';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useAppContext } from './components/AppContext';
import { getScreenId } from './api';

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

function App() {
  const { t } = useTranslation();
  const { setScreenId } = useAppContext();

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

  return (
    <AppContainer>
      <LanguageSwitcher />
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {t('title')}
      </motion.h1>
      <WiFiConfig />
    </AppContainer>
  );
}

export default App; 