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
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderBottom: '1px solid #e5e7eb',
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
          height: '64px'
        }}>
          {/* Logo */}
          <Link 
            to="/" 
            style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1f2937',
              textDecoration: 'none'
            }}
          >
            Job<span style={{ color: '#4f46e5' }}>Portal</span>
          </Link>

          {/* Desktop Navigation - HORIZONTAL */}
          {token && (
            <div style={{
              display: 'flex',
              gap: '2rem',
              alignItems: 'center'
            }}>
              <Link 
                to="/dashboard" 
                style={{
                  color: '#4b5563',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '0.95rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#4f46e5'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#4b5563'}
              >
                Dashboard
              </Link>
              
              <Link 
                to="/profile" 
                style={{
                  color: '#4f46e5',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '0.95rem',
                  borderBottom: '2px solid #4f46e5',
                  paddingBottom: '2px'
                }}
              >
                Profile
              </Link>
              
              {user?.role === "ADMIN" && (
                <Link 
                  to="/admin" 
                  style={{
                    color: '#4b5563',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '0.95rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#4f46e5'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#4b5563'}
                >
                  Admin
                </Link>
              )}
            </div>
          )}

          {/* Desktop Right Section */}
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
                <span style={{
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: '#4b5563'
                }}>
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                
                <button
                  onClick={handleLogout}
                  style={{
                    fontSize: '0.9rem',
                    color: '#6b7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center'
              }}>
                <Link 
                  to="/login" 
                  style={{
                    color: '#4b5563',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '0.95rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#4f46e5'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#4b5563'}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  style={{
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '0.95rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                >
                  Sign Up
                </Link>
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
              cursor: 'pointer',
              fontSize: '1.5rem',
              color: '#4b5563'
            }}
            className="md:hidden"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{
            display: 'block',
            borderTop: '1px solid #e5e7eb',
            padding: '1rem 0'
          }} className="md:hidden">
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {token ? (
                <>
                  <div style={{ padding: '0.5rem 0.75rem' }}>
                    <p style={{ fontWeight: '500', color: '#1f2937' }}>{user?.name || 'User'}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{user?.email || ''}</p>
                  </div>

                  <Link 
                    to="/dashboard" 
                    style={{
                      padding: '0.5rem 0.75rem',
                      color: '#4b5563',
                      textDecoration: 'none',
                      borderRadius: '0.5rem'
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/profile" 
                    style={{
                      padding: '0.5rem 0.75rem',
                      color: '#4f46e5',
                      backgroundColor: '#eef2ff',
                      textDecoration: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: '500'
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {user?.role === "ADMIN" && (
                    <Link 
                      to="/admin" 
                      style={{
                        padding: '0.5rem 0.75rem',
                        color: '#4b5563',
                        textDecoration: 'none',
                        borderRadius: '0.5rem'
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '0.5rem 0.75rem',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      color: '#6b7280',
                      cursor: 'pointer',
                      borderRadius: '0.5rem'
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    style={{
                      padding: '0.5rem 0.75rem',
                      color: '#4b5563',
                      textDecoration: 'none',
                      borderRadius: '0.5rem'
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#4f46e5',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '0.5rem'
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;