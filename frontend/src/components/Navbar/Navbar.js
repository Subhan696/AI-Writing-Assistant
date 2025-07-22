import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);

  const authLinks = (
    <div className="navbar-links">
      <div className="user-status">
        {user && (
          <>
            <span>{user.email}</span>
            {user.isPro ? (
              <span className="pro-badge">PRO</span>
            ) : (
              <span>{`Usage: ${user.dailyUsageCount} / 5`}</span>
            )}
          </>
        )}
      </div>
      <ul>
        <li>
          <Link to="/">Editor</Link>
        </li>
        <li>
          <Link to="/history">History</Link>
        </li>
        <li>
          <a onClick={logout} href="#!">
            Logout
          </a>
        </li>
      </ul>
    </div>
  );

  const guestLinks = (
    <ul>
      <li>
        <Link to="/login">Login</Link>
      </li>
      <li>
        <Link to="/register">Register</Link>
      </li>
    </ul>
  );

  return (
    <nav className="navbar">
      <h1>
        <Link to="/">AI Writer</Link>
      </h1>
      {isAuthenticated ? authLinks : guestLinks}
    </nav>
  );
};

export default Navbar;
