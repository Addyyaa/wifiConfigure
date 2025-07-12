import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const SignalWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 20px;
`;

const Bar = styled.div`
  width: 4px;
  background-color: ${({ active, color }) => (active ? color : '#ccc')};
  border-radius: 1px;
  transition: all 0.3s ease;
`;

const getColorForLevel = (level) => {
  switch (level) {
    case 5:
      return 'hsl(172.61deg 100% 41.37%)'; // Excellent
    case 4:
      return '#52c41a'; // Good
    case 3:
      return '#fadb14'; // Fair
    case 2:
      return '#fa8c16'; // Weak
    case 1:
      return '#f5222d'; // Very Weak
    default:
      return '#ccc';
  }
};

const SignalStrength = ({ level }) => {
  const heights = ['20%', '40%', '60%', '80%', '100%'];
  const color = getColorForLevel(level);

  return (
    <SignalWrapper>
      {heights.map((height, index) => (
        <Bar
          key={index}
          style={{ height }}
          active={index < level}
          color={color}
        />
      ))}
    </SignalWrapper>
  );
};

SignalStrength.propTypes = {
  level: PropTypes.oneOf([1, 2, 3, 4, 5]).isRequired,
};

export default SignalStrength; 