import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, getApiError } from '../api/client.js';

function ProjectCard({ project, index }) {
  const author = project.author?.name || 'ModForge creator';
  const game = project.game?.name || 'Game mod';
  const category = project.category?.name || 'Community pick';
  return (
    <Link
      className={`project-card project-card-${(index % 4) + 1}`}
      to={`/projects/${project.id}`}
    >
      <div className="card-art">
        {project.imageUrl ? (
          <img src={project.imageUrl} alt="" loading="lazy" />
        ) : (
          <>
            <span className="art-orbit art-orbit-one" />
            <span className="art-orbit art-orbit-two" />
            <span className="art-glyph">{project.name.slice(0, 1).toUpperCase()}</span>
          </>
        )}
        <span className="card-game">{game}</span>
        <span className="card-open" aria-hidden="true">↗</span>
      </div>
      <div className="card-copy">
        <div className="card-meta">
          <span>{category}</span>
          <span className="card-author">by {author}</span>
        </div>
        <h3>{project.name}</h3>
        <p>{project.description || 'A community-made project, ready to explore.'}</p>
      </div>
    </Link>
  );
}

function ProjectSkeleton() {
  return (
    <div className="project-card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-art" />
      <div className="skeleton-lines">
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line medium" />
      </div>
    </div>
  );
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState({ items: [], total: 0, page: 1, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = useMemo(
    () => ({
      q: searchParams.get('q') || '',
      gameId: searchParams.get('gameId') || '',
      categoryId: searchParams.get('categoryId') || '',
      authorName: searchParams.get('authorName') || '',
      sort: searchParams.get('sort') || 'newest',
      page: Number(searchParams.get('page') || 1),
    }),
    [searchParams],
  );
  const [searchText, setSearchText] = useState(filters.q);

  useEffect(() => setSearchText(filters.q), [filters.q]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      api.get('/games', { signal: controller.signal }),
      api.get('/categories', { signal: controller.signal }),
    ])
      .then(([gameResponse, categoryResponse]) => {
        setGames(gameResponse.data);
        setCategories(categoryResponse.data);
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(getApiError(requestError, 'Could not load catalog filters.'));
        }
      });
    return () => controller.abort();
  }, []);

  const loadProjects = useCallback(
    async (signal) => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/projects', {
          params: {
            q: filters.q || undefined,
            gameId: filters.gameId || undefined,
            categoryId: filters.categoryId || undefined,
            authorName: filters.authorName || undefined,
            sort: filters.sort,
            page: filters.page,
            limit: 12,
          },
          signal,
        });
        setResult(data);
      } catch (requestError) {
        if (!signal.aborted) {
          setError(getApiError(requestError, 'Could not load projects.'));
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadProjects(controller.signal);
    return () => controller.abort();
  }, [loadProjects]);

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  }

  function submitSearch(event) {
    event.preventDefault();
    updateFilter('q', searchText.trim());
  }

  function goToPage(page) {
    const next = new URLSearchParams(searchParams);
    if (page > 1) next.set('page', String(page));
    else next.delete('page');
    setSearchParams(next);
    window.scrollTo({ top: 420, behavior: 'smooth' });
  }

  const totalPages = Math.ceil(result.total / result.limit);

  return (
    <main>
      <section className="catalog-hero">
        <div className="hero-backdrop" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow"><span /> THE MODDING UNIVERSE</div>
            <h1>
              Play it your
              <br />
              <span>own way.</span>
            </h1>
            <p>
              The best mods aren’t just add-ons. They’re new ways to fall in love
              with your favorite games.
            </p>
            <a className="text-link" href="#catalog">
              Explore the collection <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-feature" aria-label="Featured project artwork">
            <div className="feature-sun" />
            <div className="feature-grid" />
            <div className="feature-caption">
              <span>COMMUNITY SPOTLIGHT</span>
              <strong>Worlds, reimagined.</strong>
            </div>
            <span className="feature-index">MF—001</span>
          </div>
        </div>
        <div className="hero-bottom">
          <span>BUILT BY PLAYERS, FOR PLAYERS</span>
          <span>DISCOVER WHAT’S POSSIBLE <span aria-hidden="true">↘</span></span>
        </div>
      </section>

      <section className="catalog-section page-width" id="catalog">
        <div className="section-heading">
          <div>
            <div className="eyebrow"><span /> THE COLLECTION</div>
            <h2>Find your next <em>favorite.</em></h2>
          </div>
          <p>Independent creations. Endless new ways to play.</p>
        </div>

        <form className="filter-panel" onSubmit={submitSearch}>
          <label className="search-field">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              aria-label="Search projects"
              placeholder="Search mods, games, creators..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            {searchText && (
              <button
                className="clear-search"
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchText('');
                  updateFilter('q', '');
                }}
              >
                ×
              </button>
            )}
          </label>
          <label className="select-wrap">
            <span className="sr-only">Game</span>
            <select
              value={filters.gameId}
              onChange={(event) => updateFilter('gameId', event.target.value)}
            >
              <option value="">All games</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
          </label>
          <label className="select-wrap">
            <span className="sr-only">Category</span>
            <select
              value={filters.categoryId}
              onChange={(event) => updateFilter('categoryId', event.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <button className="button button-search" type="submit">
            Search <span aria-hidden="true">↗</span>
          </button>
        </form>
        <div className="filter-subrow">
          <label className="author-filter">
            <span>CREATOR</span>
            <input
              aria-label="Filter by creator name"
              placeholder="Any creator"
              value={filters.authorName}
              onChange={(event) => updateFilter('authorName', event.target.value)}
            />
          </label>
          <div className="results-tools">
            <span>{result.total} {result.total === 1 ? 'PROJECT' : 'PROJECTS'}</span>
            <label className="sort-select">
              <span>SORT:</span>
              <select
                value={filters.sort}
                onChange={(event) => updateFilter('sort', event.target.value)}
              >
                <option value="newest">Recently added</option>
                <option value="popular">Most loved</option>
              </select>
            </label>
          </div>
        </div>

        {error && (
          <div className="notice notice-error" role="alert">
            <span>{error}</span>
            <button className="text-button" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}
        {loading ? (
          <div className="project-grid">
            {Array.from({ length: 6 }, (_, index) => <ProjectSkeleton key={index} />)}
          </div>
        ) : result.items.length ? (
          <>
            <div className="project-grid">
              {result.items.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
            {totalPages > 1 && (
              <nav className="pagination" aria-label="Catalog pages">
                <button
                  className="page-button"
                  disabled={filters.page <= 1}
                  onClick={() => goToPage(filters.page - 1)}
                >
                  ← <span>Previous</span>
                </button>
                <span>PAGE <strong>{filters.page}</strong> OF {totalPages}</span>
                <button
                  className="page-button"
                  disabled={filters.page >= totalPages}
                  onClick={() => goToPage(filters.page + 1)}
                >
                  <span>Next</span> →
                </button>
              </nav>
            )}
          </>
        ) : !error ? (
          <div className="empty-state">
            <span className="empty-mark">M</span>
            <h3>No mods found. Yet.</h3>
            <p>Try another search or clear a filter to explore the collection.</p>
            <button
              className="button button-outline"
              onClick={() => setSearchParams({})}
            >
              Clear filters
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
