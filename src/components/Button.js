import React from 'react';

export default function Button({ style, ...props }) {
  return (
    <button
      {...props}
      style={{
        border: '1px solid #dedede',
        backgroundColor: 'white',
        borderRadius: '3px',
        padding: '4px 8px',
        backgroundColor: '#efefef',
        ...(style || {}),
      }}
    />
  );
}
