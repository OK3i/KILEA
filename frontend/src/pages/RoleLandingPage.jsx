import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';

export function RoleLandingPage({ title }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <main className="page-width role-page">
      <div className="eyebrow"><span /> {isAdmin ? 'PLATFORM OPERATIONS' : 'CREATOR SPACE'}</div>
      <h1>{title}<em>.</em></h1>
      <p>
        {isAdmin
          ? 'Your administrator access is active. Platform management tools can be added here.'
          : 'Your creator access is active. Project publishing tools can be added here.'}
      </p>
      <Link className="button button-outline" to="/">Back to discovery <span aria-hidden="true">↗</span></Link>
    </main>
  );
}
