"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { type Editor } from "@tiptap/react";
import { RichTextEditor } from "./RichTextEditor";
import { EditorToolbar } from "./EditorToolbar";
import { MoodSelector } from "./MoodSelector";
import { TagInput } from "./TagInput";
import { createEntry, updateEntry, deleteEntry, togglePin } from "@/app/actions/entries";
import { countWords, todayISODate } from "@/lib/text";
import { uploadImage } from "@/lib/uploadImage";
import { downloadEntryMarkdown } from "@/lib/markdown";
import {
  DownloadIcon,
  ImageIcon,
  PinIcon,
  PinOffIcon,
  SparklesIcon,
  TrashIcon,
} from "@/components/icons";
import type { Entry, Mood } from "@/lib/types";

interface EntryEditorProps {
  entry?: Entry;
  initialDate?: string;
}

interface DraftState {
  title: string;
  body: string;
  bodyPlain: string;
  mood: Mood | null;
  tags: string[];
  entryDate: string;
}

const AUTOSAVE_INTERVAL = 30_000;

export function EntryEditor({ entry, initialDate }: EntryEditorProps) {
  const router = useRouter();
  const isEditing = Boolean(entry);
  const draftKey = `journal-draft-${entry?.id ?? "new"}`;

  const [title, setTitle] = useState(entry?.title ?? "");
  const [body, setBody] = useState(entry?.body ?? "");
  const [bodyPlain, setBodyPlain] = useState(entry?.body_plain ?? "");
  const [mood, setMood] = useState<Mood | null>(entry?.mood ?? null);
  const [tags, setTags] = useState<string[]>(entry?.tags ?? []);
  const [entryDate, setEntryDate] = useState(
    entry?.entry_date ?? initialDate ?? todayISODate(),
  );

  const [editor, setEditor] = useState<Editor | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pinned, setPinned] = useState(entry?.pinned ?? false);
  const [promptLoading, setPromptLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stateRef = useRef<DraftState>({
    title,
    body,
    bodyPlain,
    mood,
    tags,
    entryDate,
  });
  useEffect(() => {
    stateRef.current = { title, body, bodyPlain, mood, tags, entryDate };
  });

  // Restore an unsaved local draft on mount (only for brand-new entries).
  useEffect(() => {
    if (isEditing) return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw) as DraftState;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from persisted draft
      setTitle(d.title ?? "");
      setBody(d.body ?? "");
      setBodyPlain(d.bodyPlain ?? "");
      setMood(d.mood ?? null);
      setTags(d.tags ?? []);
      setEntryDate(d.entryDate ?? todayISODate());
    } catch {
      /* ignore malformed drafts */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave the draft to localStorage every 30s.
  useEffect(() => {
    const id = setInterval(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(stateRef.current));
        setSavedAt(new Date().toLocaleTimeString());
      } catch {
        /* storage may be full / unavailable */
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(id);
  }, [draftKey]);

  const handleBodyChange = useCallback((json: string, plain: string) => {
    setBody(json);
    setBodyPlain(plain);
  }, []);

  function buildInput() {
    return {
      title: title.trim() || null,
      body,
      body_plain: bodyPlain,
      mood,
      tags,
      entry_date: entryDate,
      word_count: countWords(bodyPlain),
    };
  }

  async function handleTogglePin() {
    if (!entry) return;
    const next = !pinned;
    setPinned(next);
    const res = await togglePin(entry.id, next);
    if (res?.error) {
      setPinned(!next); // rollback
      setError(res.error);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const input = buildInput();
    const res = isEditing
      ? await updateEntry(entry!.id, input)
      : await createEntry(input);

    if (res?.error) {
      setError(res.error);
      setSaving(false);
      return;
    }
    try {
      localStorage.removeItem(draftKey);
    } catch {
      /* ignore */
    }
    setSaving(false);
    if (isEditing) {
      setSavedAt(new Date().toLocaleTimeString());
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!entry) return;
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    setSaving(true);
    const res = await deleteEntry(entry.id);
    if (res?.error) {
      setError(res.error);
      setSaving(false);
    }
  }

  async function handlePrompt() {
    setPromptLoading(true);
    try {
      const res = await fetch("/api/ai/prompt", { method: "POST" });
      const data = await res.json();
      if (data.prompt && editor) {
        editor
          .chain()
          .focus()
          .insertContent([
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: data.prompt }],
            },
            { type: "paragraph" },
          ])
          .run();
      }
    } catch {
      setError("Could not fetch a prompt right now.");
    } finally {
      setPromptLoading(false);
    }
  }

  async function handleImageFiles(files: FileList | null) {
    if (!files || !editor) return;
    setUploading(true);
    setError(null);
    for (const file of Array.from(files)) {
      try {
        const url = await uploadImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Image upload failed.");
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleExportMarkdown() {
    downloadEntryMarkdown({
      title: title.trim() || null,
      body,
      body_plain: bodyPlain,
      mood,
      tags,
      entry_date: entryDate,
    });
  }

  // Cmd/Ctrl+S saves. No dep array → always uses the latest closure.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!saving) void handleSave();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const wordCount = countWords(bodyPlain);

  return (
    <div className="animate-fade-in pb-20">
      {/* Meta row: date + mood */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          className="rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium shadow-soft outline-none transition-all focus:border-accent focus:ring-4 focus:ring-[var(--ring)]"
        />
        <MoodSelector value={mood} onChange={setMood} />
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="mb-4 w-full bg-transparent font-serif text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/40"
      />

      {/* Editor surface */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-card-muted/50 px-3 py-2">
          <EditorToolbar editor={editor} />
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Attach image"
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <ImageIcon
                className={`h-[18px] w-[18px] ${uploading ? "animate-pulse" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={handlePrompt}
              disabled={promptLoading}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-accent-strong transition-colors hover:bg-accent-soft disabled:opacity-50"
            >
              <SparklesIcon
                className={`h-4 w-4 ${promptLoading ? "animate-pulse" : ""}`}
              />
              {promptLoading ? "Thinking…" : "Prompt"}
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleImageFiles(e.target.files)}
        />
        <div className="px-5 py-4">
          <RichTextEditor
            initialContent={body}
            onChange={handleBodyChange}
            onReady={setEditor}
            onError={setError}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="mt-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tags
        </label>
        <TagInput value={tags} onChange={setTags} />
      </div>

      {error && (
        <div className="mt-4 animate-fade-in rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Sticky action bar */}
      <div className="sticky bottom-4 mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-4 py-3 shadow-elevated backdrop-blur-xl">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-ember px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? "Saving…" : isEditing ? "Update entry" : "Save entry"}
        </button>
        <button
          type="button"
          onClick={handleExportMarkdown}
          aria-label="Download as Markdown"
          title="Download as Markdown"
          className="grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <DownloadIcon className="h-[18px] w-[18px]" />
        </button>
        {isEditing && (
          <>
            <button
              type="button"
              onClick={handleTogglePin}
              aria-label={pinned ? "Unpin entry" : "Pin entry"}
              title={pinned ? "Unpin entry" : "Pin to top"}
              className={`grid h-10 w-10 place-items-center rounded-xl border transition-colors ${
                pinned
                  ? "border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {pinned
                ? <PinOffIcon className="h-[18px] w-[18px]" />
                : <PinIcon className="h-[18px] w-[18px]" />}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              aria-label="Delete entry"
              className="grid h-10 w-10 place-items-center rounded-xl border border-border text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:border-red-900/60 dark:hover:bg-red-950/30"
            >
              <TrashIcon className="h-[18px] w-[18px]" />
            </button>
          </>
        )}
        <div className="ml-auto text-right text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{wordCount}</span>{" "}
          {wordCount === 1 ? "word" : "words"}
          {savedAt && (
            <span className="ml-2 hidden sm:inline">· draft saved {savedAt}</span>
          )}
        </div>
      </div>
    </div>
  );
}
