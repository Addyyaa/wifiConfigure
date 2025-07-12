import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { motion } from 'framer-motion';

import WiFiConfig from './components/WiFiConfig';
import LanguageSwitcher from './components/LanguageSwitcher';

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