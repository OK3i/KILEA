import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getApiError } from '../api/client.js';

export function FavoritesPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (signal) => {
    try {
      const { data } = await api.get('/favorites', { signal });
      setProjects(data);
      setError('');
    } catch (requestError) {
      if (!signal.aborted) setError(getApiError(requestError, 'Could not load saved projects.'));
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function remove(projectId) {
    try {
      await api.delete(`/favorites/${projectId}`);
      setProjects((current) => current.filter((favorite) => favorite.projectId !== projectId));
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not remove this project.'));
    }
  }

  return (
    <main className="page-width saved-page">
      <div className="eyebrow"><span /> YOUR PERSONAL COLLECTION</div>
      <div className="section-heading saved-heading">
        <div>
          <h1>Saved for <em>later.</em></h1>
          <p>All the projects you’ve bookmarked, together in one place.</p>
        </div>
      </div>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      {loading ? (
        <div className="project-grid">{Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton skeleton-art" />)}</div>
      ) : projects.length ? (
        <div className="saved-list">
          {projects.map((favorite) => (
            <article className="saved-row" key={favorite.id}>
              <div className="saved-monogram">{favorite.project?.name?.slice(0, 1) || 'M'}</div>
              <div className="saved-info">
                <span>{favorite.project?.game?.name || 'MOD PROJECT'}</span>
                <h2>{favorite.project?.name || 'Project'}</h2>
                <p>Saved {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(favorite.createdAt))}</p>
              </div>
              <Link className="text-link" to={`/projects/${favorite.projectId}`}>View project ↗</Link>
              <button className="remove-saved" onClick={() => remove(favorite.projectId)}>Remove</button>
            </article>
          ))}
        </div>
      ) : !error ? (
        <div className="empty-state">
          <span className="empty-mark">♡</span>
          <h3>Your collection is waiting.</h3>
          <p>Save a project you love and it’ll be right here when you need it.</p>
          <Link className="button" to="/">Explore projects <span aria-hidden="true">↗</span></Link>
        </div>
      ) : null}
    </main>
  );
}
