import React from 'react';

export default function Input({ style, ...props }) {
  return (
    <input
      {...props}
      style={{
        padding: 4,
        border: '1px solid #dedede',
        borderRadius: '3px',
        ...(style || {}),
      }}
    />
  );
}
