import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const canCreateProjects = ['author', 'admin'].includes(user?.role);

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="ModForge home">
        <span className="brand-mark">M</span>
        <span>MODFORGE</span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/" end>Discover</NavLink>
        {user && <NavLink to="/favorites">Saved</NavLink>}
        {canCreateProjects && (
          <NavLink to="/projects/new">Create project</NavLink>
        )}
        {user?.role === 'admin' && <NavLink to="/admin">Admin panel</NavLink>}
      </nav>
      <div className="header-account">
        {user ? (
          <>
            <span className="account-label">
              <span className="status-dot" />
              {user.name || user.email}
            </span>
            <button className="button button-quiet" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link className="login-link" to="/login">Log in</Link>
            <Link className="button button-small" to="/register">
              Register <span aria-hidden="true">↗</span>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
