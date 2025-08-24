import React from 'react';

const BrokenComponent = () => {
  return (
    // This div is intentionally not closed to create a syntax error
    <div> 
      <p>This component is broken and will not parse correctly.</p>
  );
};

export default BrokenComponent;
