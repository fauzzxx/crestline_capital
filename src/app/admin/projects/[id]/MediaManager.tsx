"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addProjectMedia, removeProjectMedia, uploadProjectMediaFile } from "@/app/actions/admin";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { ProjectMedia } from "@/types/database";

interface MediaManagerProps {
  projectId: string;
  media: ProjectMedia[];
}

export function MediaManager({ projectId, media, ...rest }: MediaManagerProps) {
  const router = useRouter();
  const [type, setType] = useState<"image" | "video" | "youtube">("image");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const useFile = (type === "image" || type === "video") && file?.size;
    if (!useFile && !url.trim()) return;
    setLoading(true);
    let mediaUrl = url.trim();
    if (useFile && file) {
      const formData = new FormData();
      formData.set("file", file);
      const upload = await uploadProjectMediaFile(projectId, type, formData);
      if (!upload.success) {
        setLoading(false);
        toast.error(upload.error);
        return;
      }
      mediaUrl = upload.url;
    }
    const result = await addProjectMedia(projectId, type, mediaUrl);
    setLoading(false);
    if (result.success) {
      toast.success("Media added");
      setUrl("");
      setFile(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleRemove = async (mediaId: string) => {
    const result = await removeProjectMedia(mediaId);
    if (result.success) {
      toast.success("Media removed");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const canUpload = type === "image" || type === "video";

  return (
    <div className="space-y-4" {...rest}>
      <form onSubmit={handleAdd} className="space-y-3">
        <div className="flex flex-wrap gap-2 items-end">
          <Select value={type} onValueChange={(v) => { setType(v as "image" | "video" | "youtube"); setFile(null); }}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={type === "youtube" ? "https://youtube.com/watch?v=..." : "URL (or upload below)"}
            className="flex-1 min-w-[200px]"
          />
          <Button type="submit" disabled={loading || (!url.trim() && !(canUpload && file))} size="sm">
            Add
          </Button>
        </div>
        {canUpload && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-cream-muted">Or upload file:</span>
            <Input
              type="file"
              accept={type === "image" ? "image/*" : "video/*"}
              className="max-w-[220px]"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && <span className="text-xs text-cream-muted">{file.name}</span>}
          </div>
        )}
      </form>
      <div className="flex flex-wrap gap-4">
        {media.map((m) => (
          <div key={m.id} className="relative group">
            {m.media_type === "image" ? (
              <img
                src={m.media_url}
                alt=""
                className="w-32 h-32 object-cover rounded-lg border border-border"
              />
            ) : (
              <div className="w-32 h-32 rounded-lg border border-border bg-muted flex items-center justify-center text-xs text-cream-muted">
                {m.media_type}
              </div>
            )}
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemove(m.id)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
      {media.length === 0 && (
        <p className="text-sm text-cream-muted">No media yet. Add image URL, video URL, or YouTube link above.</p>
      )}
    </div>
  );
}
