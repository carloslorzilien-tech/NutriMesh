import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="nav">
      <Link to="/" className="nav-brand">
        <img src="/logo.svg" alt="NutriMesh" width={32} height={32} style={{ objectFit: 'contain', flexShrink: 0 }} />
        <span className="nav-brand-name">NutriMesh</span>
      </Link>
      <div className="nav-links">
        {user?.role === 'bank' && (
          <>
            <Link to="/banco" className="nav-link">Bank</Link>
          </>
        )}
        {user?.role === 'hotel' && (
          <Link to="/hotel" className="nav-link">Hotel</Link>
        )}
        {user ? (
          <button className="nav-link-action" onClick={handleLogout}>Sign out</button>
        ) : (
          <Link to="/login" className="nav-link-action">Sign in</Link>
        )}
      </div>
    </nav>
  );
}
