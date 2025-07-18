import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { motion } from 'framer-motion';

import WiFiConfig from '../components/WiFiConfig';
import ThemeSwitcher from '../components/LanguageSwitcher';
import { useAppContext } from '../components/AppContext';
import { getScreenId } from '../api';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: ${props => props.$isDarkMode ? '#000000' : '#f0f2f5'};
  font-family: 'Inter', sans-serif;
  transition: background-color 0.3s ease;
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
  const { setScreenId, isDarkMode } = useAppContext();

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
    <AppContainer $isDarkMode={isDarkMode}>
      <ThemeSwitcher />
      <WiFiConfig />
    </AppContainer>
  );
}

export default Home; 