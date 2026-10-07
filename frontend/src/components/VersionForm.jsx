import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api, toastApiError } from "../api/client.js";

const versionSchema = z.object({
  version: z.string().trim().min(1, "Version is required.").max(40),
  downloadUrl: z.union([
    z.literal(""),
    z.string().url("Enter a valid download URL."),
  ]),
  description: z.string().optional(),
});

export function VersionForm({ projectId, onCreated }) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(versionSchema),
    defaultValues: { version: "", downloadUrl: "", description: "" },
  });

  async function submitVersion(values) {
    setSubmitting(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/versions`, {
        version: values.version.trim(),
        downloadUrl: values.downloadUrl || undefined,
        description: values.description?.trim() || undefined,
      });
      onCreated(data);
      reset();
      toast.success("Project version added.");
    } catch (requestError) {
      toastApiError(requestError, "Could not add this version.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="version-form"
      noValidate
      onSubmit={handleSubmit(submitVersion)}
    >
      <div className="form-heading">
        <strong>Add a release</strong>
      </div>
      <div className="version-form-grid">
        <label>
          <span>VERSION</span>
          <input {...register("version")} maxLength={40} placeholder="1.2.0" />
          {errors.version && (
            <span className="field-error">{errors.version.message}</span>
          )}
        </label>
        <label>
          <span>DOWNLOAD URL</span>
          <input
            {...register("downloadUrl")}
            type="url"
            placeholder="https://example.com/mod.zip"
          />
          {errors.downloadUrl && (
            <span className="field-error">{errors.downloadUrl.message}</span>
          )}
        </label>
      </div>
      <label>
        <span>RELEASE NOTES</span>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="What changed in this release?"
        />
      </label>
      <button
        className="button button-small"
        type="submit"
        disabled={submitting}
      >
        {submitting ? "Adding…" : "Add version"}{" "}
        <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
