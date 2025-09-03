import React from 'react';
import Footer from './Footer';
import NavBar from './NavBar';

const Layout = ({isAuthenticated, onLogout, children}) => {
    return (
        <div>
            <NavBar isAuthenticated={isAuthenticated} onLogout={onLogout} />
            <main>
                {children}
            </main>
            <Footer/>
        </div>
    );
}

export default Layout;