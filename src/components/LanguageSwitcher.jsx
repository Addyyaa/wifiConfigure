import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAppContext } from './AppContext';

const SwitcherContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 20;

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    gap: 8px;
  }
`;

const SwitcherButton = styled(motion.button)`
  padding: 8px 16px;
  background-color: #fff;
  color: hsl(172.61deg 100% 41.37%);
  border: 1px solid hsl(172.61deg 100% 41.37%);
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background-color: hsl(172.61deg 100% 41.37%);
    color: #fff;
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
`;

const ThemeButton = styled(motion.button)`
  padding: 8px 12px;
  background-color: #fff;
  color: hsl(172.61deg 100% 41.37%);
  border: 1px solid hsl(172.61deg 100% 41.37%);
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  font-size: 1.2rem;

  &:hover {
    background-color: hsl(172.61deg 100% 41.37%);
    color: #fff;
  }

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 1rem;
  }
`;

const ThemeSwitcher = () => {
  const { i18n, t } = useTranslation();
  const { isDarkMode, setDarkMode } = useAppContext();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };

  const toggleTheme = () => {
    setDarkMode(!isDarkMode);
  };

  return (
    <SwitcherContainer>
      <ThemeButton 
        onClick={toggleTheme}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={isDarkMode ? '切换到日间模式' : '切换到夜间模式'}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </ThemeButton>
      <SwitcherButton 
        onClick={toggleLanguage}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {i18n.language === 'en' ? t('langZH') : t('langEN')}
      </SwitcherButton>
    </SwitcherContainer>
  );
};

export default ThemeSwitcher; 