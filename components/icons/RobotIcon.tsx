
import React from 'react';

export const RobotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="5" y="11" width="14" height="10" rx="2"></rect>
        <path d="M12 7V11"></path>
        <path d="M8.5 7.5a4 4 0 017 0"></path>
        <path d="M7 11v-1a4 4 0 014-4h2"></path>
        <circle cx="8" cy="16" r="1"></circle>
        <circle cx="16" cy="16" r="1"></circle>
    </svg>
);