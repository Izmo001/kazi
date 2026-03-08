import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)!;
  const [open, setOpen] = useState(false);

  return (
    <div className="navbar">
      <h2>JobAssist</h2>

      <div onClick={() => setOpen(!open)} style={{ cursor: "pointer" }}>
        ☰
      </div>

      {open && (
        <div className="nav-links">
          {user && <Link to="/profile" className="link">Profile</Link>}
          {user?.role === "ADMIN" && (
            <Link to="/admin" className="link">Admin</Link>
          )}
          {user && (
            <Link to="/dashboard" className="link">Dashboard</Link>
          )}
          {user && (
            <span onClick={logout} className="link">Logout</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;