import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../AppContext'; // 引入 useAppContext

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7); /* 加深遮罩 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled(motion.div)`
  background: ${props => props.$isDarkMode ? '#1C1C1E' : 'white'};
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, ${props => props.$isDarkMode ? 0.5 : 0.2});
  width: 90%;
  max-width: 450px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
`;

const ModalTitle = styled.h2`
    margin: 0;
    text-align: center;
    color: ${props => props.$isDarkMode ? '#e0e0e0' : '#333'};
    transition: color 0.3s ease;
`;

const ModalContent = styled.div`
    margin: 1rem 0;
`;

const ModalActions = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: 1px solid ${props => (props.primary ? 'transparent' : (props.$isDarkMode ? '#555' : '#ccc'))};
  background-color: ${props => (props.primary ? 'hsl(172.61deg 100% 41.37%)' : (props.$isDarkMode ? '#333' : 'white'))};
  color: ${props => (props.primary ? 'white' : (props.$isDarkMode ? '#e0e0e0' : '#333'))};
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const modalVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
};

function Modal({ isOpen, onClose, title, children, isDarkMode: propIsDarkMode }) {
  const { isDarkMode: contextIsDarkMode } = useAppContext();
  const isDarkMode = propIsDarkMode ?? contextIsDarkMode; // 优先使用 props 传入的，否则用 context

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContainer
            $isDarkMode={isDarkMode}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalTitle $isDarkMode={isDarkMode}>{title}</ModalTitle>
            <ModalContent>{children}</ModalContent>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
}

// Re-exporting button and adapting it for night mode
export const ModalButton = ({ isDarkMode: propIsDarkMode, ...props }) => {
  const { isDarkMode: contextIsDarkMode } = useAppContext();
  const isDarkMode = propIsDarkMode ?? contextIsDarkMode;
  return <Button $isDarkMode={isDarkMode} {...props} />;
};

export default Modal; 