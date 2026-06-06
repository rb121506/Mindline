"use client";

import { type Editor, useEditorState } from "@tiptap/react";
import { BoldIcon, ItalicIcon, ListIcon } from "@/components/icons";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold") ?? false,
      italic: editor?.isActive("italic") ?? false,
      h1: editor?.isActive("heading", { level: 1 }) ?? false,
      h2: editor?.isActive("heading", { level: 2 }) ?? false,
      bulletList: editor?.isActive("bulletList") ?? false,
    }),
  });

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5">
      <ToolButton
        active={state?.bold ?? false}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="Bold"
      >
        <BoldIcon className="h-[18px] w-[18px]" />
      </ToolButton>
      <ToolButton
        active={state?.italic ?? false}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="Italic"
      >
        <ItalicIcon className="h-[18px] w-[18px]" />
      </ToolButton>

      <span className="mx-1 h-5 w-px bg-border" />

      <ToolButton
        active={state?.h1 ?? false}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        label="Heading 1"
      >
        <span className="font-serif text-sm font-semibold">H1</span>
      </ToolButton>
      <ToolButton
        active={state?.h2 ?? false}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        label="Heading 2"
      >
        <span className="font-serif text-sm font-semibold">H2</span>
      </ToolButton>

      <span className="mx-1 h-5 w-px bg-border" />

      <ToolButton
        active={state?.bulletList ?? false}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        label="Bullet list"
      >
        <ListIcon className="h-[18px] w-[18px]" />
      </ToolButton>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`grid h-8 min-w-8 place-items-center rounded-lg px-1.5 transition-all active:scale-90 ${
        active
          ? "bg-accent-soft text-accent-strong"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
