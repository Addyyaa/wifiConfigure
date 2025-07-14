import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerContainer = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid hsl(172.61deg 100% 41.37%);
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
`;

export const Spinner = () => <SpinnerContainer />;

export const StatusText = styled(motion.p)`
    margin-top: 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: #333;
`; 