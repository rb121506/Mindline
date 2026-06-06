"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import Image from "@tiptap/extension-image";
import { useEffect, useRef } from "react";
import { uploadImage } from "@/lib/uploadImage";

interface RichTextEditorProps {
  /** Tiptap JSON (stringified) for the initial document, or "" for empty. */
  initialContent: string;
  placeholder?: string;
  /** Called whenever the document changes, with serialized JSON + plain text. */
  onChange: (json: string, plainText: string) => void;
  /** Receives the editor instance so a parent toolbar can drive it. */
  onReady?: (editor: Editor) => void;
  /** Surfaced upload errors. */
  onError?: (message: string) => void;
}

export function RichTextEditor({
  initialContent,
  placeholder = "Write about your day…",
  onChange,
  onReady,
  onError,
}: RichTextEditorProps) {
  // Stable ref so paste/drop handlers always see the live editor instance.
  const editorRef = useRef<Editor | null>(null);

  const editor = useEditor({
    immediatelyRender: false, // required for SSR in Next.js
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Placeholder.configure({ placeholder }),
      Image.configure({
        HTMLAttributes: { class: "journal-image" },
      }),
    ],
    content: initialContent ? safeParse(initialContent) : "",
    editorProps: {
      attributes: {
        class:
          "tiptap min-h-[300px] max-w-none text-[15px] leading-7 text-foreground",
      },
      handlePaste(view, event) {
        const files = getImageFiles(event.clipboardData?.files);
        if (files.length) {
          event.preventDefault();
          void insertImages(editorRef.current, files, onError);
          return true;
        }
        return false;
      },
      handleDrop(view, event) {
        const files = getImageFiles(
          (event as DragEvent).dataTransfer?.files,
        );
        if (files.length) {
          event.preventDefault();
          void insertImages(editorRef.current, files, onError);
          return true;
        }
        return false;
      },
    },
    onUpdate({ editor }) {
      onChange(JSON.stringify(editor.getJSON()), editor.getText());
    },
  });

  useEffect(() => {
    editorRef.current = editor;
    if (editor && onReady) onReady(editor);
  }, [editor, onReady]);

  return <EditorContent editor={editor} />;
}

function getImageFiles(list: FileList | null | undefined): File[] {
  if (!list) return [];
  return Array.from(list).filter((f) => f.type.startsWith("image/"));
}

async function insertImages(
  editor: Editor | null,
  files: File[],
  onError?: (m: string) => void,
) {
  if (!editor) return;
  for (const file of files) {
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "Image upload failed.");
    }
  }
}

function safeParse(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}
