import React from 'react';
import Orb from './Orb';

interface OrbLogoProps {
  width?: string;
  height?: string;
}

const OrbLogo: React.FC<OrbLogoProps> = ({ width = '150px', height = '150px' }) => {
  return (
    <div style={{ width, height, position: 'relative' }}>
      <Orb
        hue={20} // Orange-ish hue to match the theme
        hoverIntensity={0.5}
        rotateOnHover={true}
        forceHoverState={false}
      />
      <div className="orb-text-container">
        <div className="orb-text">SoulCertify</div>
      </div>
    </div>
  );
};

export default OrbLogo;
