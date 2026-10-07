import { Link, Outlet } from 'react-router-dom';
import { Header } from './Header.jsx';

export function AppLayout() {
  return (
    <div className="app-shell">
      <Header />
      <Outlet />
      <footer className="site-footer">
        <Link className="brand footer-brand" to="/">
          <span className="brand-mark">M</span>
          <span>MODFORGE</span>
        </Link>
        <span>Built for players, powered by creators.</span>
        <a href="/api/docs">API documentation ↗</a>
      </footer>
    </div>
  );
}
