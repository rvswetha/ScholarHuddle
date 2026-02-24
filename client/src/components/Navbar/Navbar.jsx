import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import "./navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, session, user } = useAuth();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    try {
      await signOut();
      closeMenu();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const links = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "AI Tools", path: "/ai-tools" },
    { name: "Study Room", path: "/study-room" },
    { name: "Timetable", path: "/timetable" },
    { name: "Pomodoro Timer", path: "/pomodoro" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="logo-highlight">Scholar</span>Huddle
        </Link>
      </div>

      <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>
        {links.map((link) => (
          <li key={link.name}>
            <Link 
              to={link.path} 
              onClick={closeMenu}
              className={location.pathname === link.path ? "active-link" : ""}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>

      <div className="navbar-profile">
        <Link to="/profile" onClick={closeMenu} className="profile-link">
          <img
            src={user?.user_metadata?.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt="profile"
            className="profile-pic"
          />
        </Link>

        {session ? (
          <button onClick={handleLogout} className="auth-btn logout-btn">
            Sign Out
          </button>
        ) : (
          <button onClick={() => { navigate('/login'); closeMenu(); }} className="auth-btn login-btn">
            Login
          </button>
        )}
      </div>

      {/* Text-based mobile toggle */}
      <div className="menu-toggle" onClick={toggleMenu} style={{ fontWeight: 'bold' }}>
        {menuOpen ? "CLOSE" : "MENU"}
      </div>
    </nav>
  );
};

export default Navbar;