import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 450px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ModalTitle = styled.h2`
    margin: 0;
    text-align: center;
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
  border: 1px solid ${props => (props.primary ? 'transparent' : '#ccc')};
  background-color: ${props => (props.primary ? 'hsl(172.61deg 100% 41.37%)' : 'white')};
  color: ${props => (props.primary ? 'white' : '#333')};
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
`;

const modalVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
};

function Modal({ isOpen, onClose, title, children }) {
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
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <ModalTitle>{title}</ModalTitle>
            <ModalContent>{children}</ModalContent>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
}

// Re-exporting button for use in other components
export { Button as ModalButton };

export default Modal; 