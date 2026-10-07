import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { api, getApiError, toastApiError } from "../api/client.js";

const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(160),
  gameId: z.coerce.number().int().positive("Choose a game."),
  categoryId: z.coerce.number().int().positive("Choose a category."),
  description: z.string().optional(),
  requirements: z.string().optional(),
  imageUrl: z.union([
    z.literal(""),
    z.string().url("Enter a valid image URL."),
  ]),
});

const defaultValues = {
  name: "",
  gameId: "",
  categoryId: "",
  description: "",
  requirements: "",
  imageUrl: "",
};

function FieldError({ error }) {
  return error ? <span className="field-error">{error.message}</span> : null;
}

export function CreateProjectPage() {
  const { projectId } = useParams();
  const isEditing = Boolean(projectId);
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  useEffect(() => {
    const controller = new AbortController();
    const requests = [
      api.get("/games", { signal: controller.signal }),
      api.get("/categories", { signal: controller.signal }),
    ];
    if (isEditing) {
      requests.push(
        api.get(`/projects/${projectId}`, { signal: controller.signal }),
      );
    }

    Promise.all(requests)
      .then(([gamesResponse, categoriesResponse, projectResponse]) => {
        setGames(gamesResponse.data);
        setCategories(categoriesResponse.data);
        const project = projectResponse?.data;
        reset(
          project
            ? {
                name: project.name,
                gameId: project.gameId,
                categoryId: project.categoryId,
                description: project.description || "",
                requirements: project.requirements || "",
                imageUrl: project.imageUrl || "",
              }
            : {
                ...defaultValues,
                gameId: gamesResponse.data[0]?.id ?? "",
                categoryId: categoriesResponse.data[0]?.id ?? "",
              },
        );
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setLoadError(
            getApiError(requestError, "Could not load project form data."),
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingOptions(false);
      });
    return () => controller.abort();
  }, [isEditing, projectId, reset]);

  async function submitProject(values) {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        description: values.description?.trim() || undefined,
        requirements: values.requirements?.trim() || undefined,
        imageUrl: values.imageUrl || undefined,
      };
      const { data } = isEditing
        ? await api.patch(`/projects/${projectId}`, payload)
        : await api.post("/projects", payload);
      toast.success(isEditing ? "Project updated." : "Project created.");
      navigate(`/projects/${data.id}`);
    } catch (requestError) {
      toastApiError(requestError, "Could not save this project.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-width create-project-page">
      <div className="eyebrow">
        <span /> CREATOR STUDIO
      </div>
      <h1>
        {isEditing ? "Edit your" : "Create a"} <em>project.</em>
      </h1>
      <p className="create-project-intro">
        {isEditing
          ? "Update the details players see in the catalog."
          : "Share a new way to experience one of your favorite games."}
      </p>
      <section className="content-panel create-project-panel">
        {loadError && (
          <div className="notice notice-error" role="alert">
            {loadError}
          </div>
        )}
        <form
          className="auth-form create-project-form"
          noValidate
          onSubmit={handleSubmit(submitProject)}
        >
          <label>
            <span>PROJECT NAME</span>
            <input
              {...register("name")}
              maxLength={160}
              placeholder="Give your project a name"
            />
            <FieldError error={errors.name} />
          </label>
          <div className="create-project-selects">
            <label>
              <span>GAME</span>
              <select
                {...register("gameId")}
                disabled={loadingOptions || games.length === 0}
              >
                <option value="">Choose a game</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
              <FieldError error={errors.gameId} />
            </label>
            <label>
              <span>CATEGORY</span>
              <select
                {...register("categoryId")}
                disabled={loadingOptions || categories.length === 0}
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <FieldError error={errors.categoryId} />
            </label>
          </div>
          <label>
            <span>DESCRIPTION</span>
            <textarea
              {...register("description")}
              placeholder="Describe what your project adds to the game"
              rows={5}
            />
            <FieldError error={errors.description} />
          </label>
          <label>
            <span>REQUIREMENTS</span>
            <input
              {...register("requirements")}
              placeholder="Game edition, dependencies, or other requirements"
            />
            <FieldError error={errors.requirements} />
          </label>
          <label>
            <span>PREVIEW IMAGE URL</span>
            <input
              {...register("imageUrl")}
              type="url"
              placeholder="https://example.com/preview.webp"
            />
            <FieldError error={errors.imageUrl} />
          </label>
          {games.length === 0 || categories.length === 0 ? (
            <p className="inline-notice">
              Add at least one game and category before saving a project.
            </p>
          ) : null}
          <button
            className="button"
            type="submit"
            disabled={
              loadingOptions ||
              submitting ||
              Boolean(loadError) ||
              !games.length ||
              !categories.length
            }
          >
            {submitting
              ? "Saving…"
              : isEditing
                ? "Save changes"
                : "Create project"}
            <span aria-hidden="true">↗</span>
          </button>
        </form>
      </section>
    </main>
  );
}
