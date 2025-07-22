import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size', 'color', 'borderColor'].includes(prop)
})`
  width: ${props => props.size || '50px'};
  height: ${props => props.size || '50px'};
  border: ${props => `5px solid ${props.borderColor || '#f3f3f3'}`};
  border-top: ${props => `5px solid ${props.color || 'hsl(172.61deg 100% 41.37%)'}`};
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
  margin: 0 auto;
`;

export const Spinner = ({ size, color, borderColor }) => (
  <SpinnerContainer 
    size={size}
    color={color}
    borderColor={borderColor}
  />
);

// 添加类型检查
Spinner.propTypes = {
  size: PropTypes.string,
  color: PropTypes.string,
  borderColor: PropTypes.string
};

// 设置默认属性
Spinner.defaultProps = {
  size: '50px',
  color: 'hsl(172.61deg 100% 41.37%)',
  borderColor: '#f3f3f3'
};

export const StatusText = styled(motion.p)`
    margin-top: 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: #333;
    text-align: center;
`; 