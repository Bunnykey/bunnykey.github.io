import React from 'react';
import { demoContainer } from './styles';

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function DemoWrapper({ title, children }: Props) {
  return (
    <div style={demoContainer}>
      <div style={{ 
        fontSize: '0.75rem', 
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        opacity: 0.5, 
        marginBottom: '1rem' 
      }}>
        🔬 {title}
      </div>
      {children}
    </div>
  );
}
