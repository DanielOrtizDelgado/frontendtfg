import React from 'react';
import { Link } from 'react-router-dom';
import './Styles.css'
import logoKhomun from '../logoKhomun.png'

const NavBar = ({isAuthenticated, onLogout}) => {
    return(
        <nav className={isAuthenticated ? 'navBar' : 'navBar center'}>
            <div className='navBar-logo'>
                { !isAuthenticated ? (
                    <img src={logoKhomun} alt="Khomun Logo"/>
                ) : (
                    <div className='navbar-link'>
                    <img src={logoKhomun} alt="Khomun Logo"/>
                    <Link to="/" onClick={onLogout} className='logout-button'>Logout</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default NavBar;