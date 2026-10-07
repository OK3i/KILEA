import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import { api, getApiError, toastApiError } from "../api/client.js";
import { toast } from "sonner";
import { VersionForm } from "../components/VersionForm.jsx";

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function Rating({ value, interactive = false, onChange }) {
  return (
    <span className={interactive ? "rating rating-interactive" : "rating"}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= value ? "star is-filled" : "star"}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          disabled={!interactive}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </span>
  );
}

function ProjectArtwork({ project }) {
  return (
    <div className="detail-art">
      {project.imageUrl ? (
        <img src={project.imageUrl} alt="" />
      ) : (
        <>
          <div className="detail-art-glow" />
          <div className="detail-art-ring ring-one" />
          <div className="detail-art-ring ring-two" />
          <span className="detail-art-letter">{project.name.slice(0, 1)}</span>
        </>
      )}
      <span className="detail-art-label">
        {project.game?.name || "MOD PROJECT"}
      </span>
    </div>
  );
}

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [project, setProject] = useState(null);
  const [versions, setVersions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  const loadProject = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");
      try {
        const [projectResponse, versionResponse, reviewResponse] =
          await Promise.all([
            api.get(`/projects/${projectId}`, { signal }),
            api.get(`/projects/${projectId}/versions`, { signal }),
            api.get(`/reviews/projects/${projectId}`, { signal }),
          ]);
        setProject(projectResponse.data);
        setVersions(versionResponse.data);
        setReviews(reviewResponse.data);
      } catch (requestError) {
        if (!signal.aborted) {
          setError(getApiError(requestError, "Could not load this project."));
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [projectId],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadProject(controller.signal);
    return () => controller.abort();
  }, [loadProject]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsFavorite(false);
      return undefined;
    }
    const controller = new AbortController();
    api
      .get("/favorites", { signal: controller.signal })
      .then(({ data }) => {
        setIsFavorite(
          data.some((favorite) => favorite.projectId === Number(projectId)),
        );
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setNotice(
            getApiError(requestError, "Could not load saved projects."),
          );
        }
      });
    return () => controller.abort();
  }, [isAuthenticated, projectId]);

  const ownReview = reviews.find((review) => review.userId === user?.id);
  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      ).toFixed(1)
    : null;

  useEffect(() => {
    setRating(ownReview?.rating ?? 5);
    setComment(ownReview?.comment ?? "");
  }, [ownReview?.id, ownReview?.rating, ownReview?.comment, user?.id]);

  async function toggleFavorite() {
    setNotice("");
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${projectId}`);
        setIsFavorite(false);
        toast.success("Removed from your saved projects.");
      } else {
        await api.post(`/favorites/${projectId}`);
        setIsFavorite(true);
        toast.success("Added to your saved projects.");
      }
    } catch (requestError) {
      toastApiError(requestError, "Could not update saved projects.");
    }
  }

  async function submitReview(event) {
    event.preventDefault();
    setSavingReview(true);
    setNotice("");
    try {
      if (ownReview) {
        const { data } = await api.patch(`/reviews/${ownReview.id}`, {
          rating,
          comment,
        });
        setReviews((current) =>
          current.map((review) =>
            review.id === data.id ? { ...review, ...data, user } : review,
          ),
        );
        toast.success("Your review has been updated.");
      } else {
        const { data } = await api.post(`/reviews/projects/${projectId}`, {
          rating,
          comment,
        });
        setReviews((current) => [{ ...data, user }, ...current]);
        setComment("");
        toast.success("Thanks for sharing your review.");
      }
    } catch (requestError) {
      toastApiError(requestError, "Could not save your review.");
    } finally {
      setSavingReview(false);
    }
  }

  if (loading) {
    return (
      <main className="detail-page page-width">
        <div className="skeleton skeleton-detail" />
        <div className="skeleton skeleton-line medium" />
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="detail-page page-width">
        <Link className="back-link" to="/">
          ← Back to discover
        </Link>
        <div className="notice notice-error" role="alert">
          {error || "Project not found."}
        </div>
      </main>
    );
  }

  return (
    <main className="detail-page page-width">
      <Link className="back-link" to="/">
        ← Back to discover
      </Link>
      <section className="detail-hero">
        <ProjectArtwork project={project} />
        <div className="detail-copy">
          <div className="eyebrow">
            <span /> {project.category?.name || "COMMUNITY MOD"}
          </div>
          <h1>{project.name}</h1>
          <p className="detail-description">
            {project.description ||
              "Discover a new way to experience this game, made by the community."}
          </p>
          <div className="detail-byline">
            <span className="creator-avatar">
              {project.author?.name?.slice(0, 1) || "C"}
            </span>
            <span>
              Created by{" "}
              <strong>{project.author?.name || "ModForge creator"}</strong>
            </span>
            {averageRating && (
              <span className="detail-rating">
                <b>★</b> {averageRating} <span>({reviews.length})</span>
              </span>
            )}
          </div>
          <div className="detail-actions">
            {isAuthenticated ? (
              <button
                className={isFavorite ? "button button-saved" : "button"}
                onClick={toggleFavorite}
              >
                <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
                {isFavorite ? "Saved to collection" : "Save to collection"}
              </button>
            ) : (
              <Link
                className="button"
                to="/login"
                state={{ from: `/projects/${projectId}` }}
              >
                Sign in to save <span aria-hidden="true">↗</span>
              </Link>
            )}
            <a className="button button-outline" href="#versions">
              Explore versions <span aria-hidden="true">↓</span>
            </a>
            {user &&
              (user.role === "admin" || project.authorId === user.id) && (
                <Link
                  className="button button-outline"
                  to={`/projects/${project.id}/edit`}
                >
                  Edit project
                </Link>
              )}
          </div>
          {notice && (
            <p className="inline-notice" role="status">
              {notice}
            </p>
          )}
        </div>
      </section>

      <div className="detail-columns">
        <section className="content-panel versions-panel" id="versions">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">
                <span /> RELEASES
              </div>
              <h2>
                Version <em>history.</em>
              </h2>
            </div>
            <span className="panel-count">
              {versions.length.toString().padStart(2, "0")}
            </span>
          </div>
          {versions.length ? (
            <div className="version-list">
              {versions.map((version, index) => (
                <article className="version-row" key={version.id}>
                  <div className="version-number">
                    <span>{version.version}</span>
                    {index === 0 && <small>LATEST</small>}
                  </div>
                  <div className="version-info">
                    <p>
                      {version.description || "A new release from the creator."}
                    </p>
                    <span>Released {formatDate(version.createdAt)}</span>
                  </div>
                  {version.downloadUrl ? (
                    <a
                      className="download-link"
                      href={version.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <span className="download-unavailable">NO DOWNLOAD</span>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="panel-empty">
              No versions have been published yet.
            </div>
          )}
          {user &&
            ["author", "admin"].includes(user.role) &&
            (user.role === "admin" || project.authorId === user.id) && (
              <VersionForm
                projectId={project.id}
                onCreated={(version) =>
                  setVersions((current) => [version, ...current])
                }
              />
            )}
        </section>

        <section className="content-panel reviews-panel" id="reviews">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">
                <span /> PLAYER NOTES
              </div>
              <h2>
                Words from <em>players.</em>
              </h2>
            </div>
            <span className="panel-count">
              {reviews.length.toString().padStart(2, "0")}
            </span>
          </div>

          <div className="review-feed">
            {reviews.length ? (
              reviews.map((review) => (
                <article className="review-card" key={review.id}>
                  <div className="review-topline">
                    <div className="review-user">
                      <span className="creator-avatar creator-avatar-small">
                        {review.user?.name?.slice(0, 1) || "P"}
                      </span>
                      <div>
                        <strong>{review.user?.name || "Player"}</strong>
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                    <Rating value={review.rating} />
                  </div>
                  <p>{review.comment || "Rated this project."}</p>
                </article>
              ))
            ) : (
              <div className="panel-empty">
                No reviews yet. Be the first player to leave one.
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <form className="review-form" onSubmit={submitReview}>
              <div className="form-heading">
                <strong>
                  {ownReview ? "Update your review" : "Leave a review"}
                </strong>
                <Rating value={rating} interactive onChange={setRating} />
              </div>
              <label className="sr-only" htmlFor="review-comment">
                Your thoughts
              </label>
              <textarea
                id="review-comment"
                maxLength={5000}
                placeholder="What did you think of this mod?"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
              <button
                className="button button-small"
                type="submit"
                disabled={savingReview}
              >
                {savingReview
                  ? "Saving…"
                  : ownReview
                    ? "Update review"
                    : "Post review"}
                <span aria-hidden="true">↗</span>
              </button>
            </form>
          ) : (
            <div className="review-signin">
              <span>Have you played it?</span>
              <Link to="/login" state={{ from: `/projects/${projectId}` }}>
                Sign in to leave a review ↗
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
