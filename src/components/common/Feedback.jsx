import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Spinner = () => (
    <motion.div
        style={{
            width: 50,
            height: 50,
            border: '5px solid #f3f3f3',
            borderTop: '5px solid hsl(172.61deg 100% 41.37%)',
            borderRadius: '50%',
        }}
        animate={{ rotate: 360 }}
        transition={{ loop: Infinity, ease: 'linear', duration: 1 }}
    />
);

export const StatusText = styled(motion.p)`
    margin-top: 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: #333;
`; 