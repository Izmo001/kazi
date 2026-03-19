import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, token, logout } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #5B4B8A 0%, #1E88C5 100%)',
      boxShadow: '0 4px 20px rgba(91, 75, 138, 0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '70px'
        }}>
          {/* Logo */}
          <Link to="/" style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textDecoration: 'none',
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
          }}>
            Job<span style={{ fontWeight: '300' }}>Portal</span>
          </Link>

          {/* Desktop Navigation */}
          {token && (
            <div style={{
              display: 'flex',
              gap: '2rem',
              alignItems: 'center'
            }}>
              <Link to="/dashboard" style={navLinkStyle}>Dashboard</Link>
              <Link to="/profile" style={navLinkStyle}>Profile</Link>
              <Link to="/subscription" style={navLinkStyle}>Subscription</Link>
              {user?.role === "ADMIN" && (
                <Link to="/admin" style={{
                  ...navLinkStyle,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: '30px'
                }}>Admin</Link>
              )}
            </div>
          )}

          {/* Right Section */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            {token ? (
              <div style={{
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  padding: '0.25rem 1rem',
                  borderRadius: '30px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#5B4B8A',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ color: 'white', fontWeight: '500' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    ...navLinkStyle,
                    color: 'white',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    opacity: 0.9
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/login" style={navLinkStyle}>Login</Link>
                <Link to="/signup" style={{
                  ...navLinkStyle,
                  backgroundColor: 'white',
                  color: '#5B4B8A',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '30px',
                  fontWeight: '600'
                }}>Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'white'
            }}
            className="md:hidden"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{
            display: 'none',
            background: 'rgba(91, 75, 138, 0.95)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem'
          }} className="md:hidden">
            {/* Mobile menu items */}
          </div>
        )}
      </div>
    </nav>
  );
};

const navLinkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontWeight: '500',
  fontSize: '1rem',
  transition: 'opacity 0.2s',
  padding: '0.5rem 0',
  opacity: 0.9
};

export default Navbar;