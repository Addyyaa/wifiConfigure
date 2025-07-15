import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const SwitcherButton = styled(motion.button)`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 8px 16px;
  background-color: #fff;
  color: hsl(172.61deg 100% 41.37%);
  border: 1px solid hsl(172.61deg 100% 41.37%);
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  z-index: 20;

  &:hover {
    background-color: hsl(172.61deg 100% 41.37%);
    color: #fff;
  }

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    padding: 6px 12px;
  }
`;

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <SwitcherButton 
      onClick={toggleLanguage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {i18n.language === 'en' ? t('langZH') : t('langEN')}
    </SwitcherButton>
  );
};

export default LanguageSwitcher; 