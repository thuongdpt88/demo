import React from 'react';
import { useMediaQuery } from 'react-responsive';

const ResponsiveLayout = ({ children }) => {
    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1024px)' });
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1023px)' });

    return (
        <div className={`responsive-layout ${isDesktopOrLaptop ? 'desktop' : 'mobile'}`}>
            {children}
        </div>
    );
};

export default ResponsiveLayout;