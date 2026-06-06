import { MOOD_EMOJI, MOOD_LABEL, type Entry, type Mood } from "@/lib/types";
import { formatEntryDate } from "@/lib/text";

/* ─────────────  Tiptap JSON → Markdown  ───────────── */

interface TipNode {
  type?: string;
  text?: string;
  content?: TipNode[];
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

function applyMarks(text: string, marks: TipNode["marks"]): string {
  if (!marks) return text;
  let out = text;
  for (const mark of marks) {
    if (mark.type === "bold") out = `**${out}**`;
    else if (mark.type === "italic") out = `*${out}*`;
    else if (mark.type === "code") out = `\`${out}\``;
    else if (mark.type === "strike") out = `~~${out}~~`;
  }
  return out;
}

function inline(nodes: TipNode[] | undefined): string {
  if (!nodes) return "";
  return nodes
    .map((n) => {
      if (n.type === "text") return applyMarks(n.text ?? "", n.marks);
      if (n.type === "hardBreak") return "  \n";
      return "";
    })
    .join("");
}

function renderNode(node: TipNode): string {
  switch (node.type) {
    case "paragraph":
      return inline(node.content);
    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      return `${"#".repeat(level)} ${inline(node.content)}`;
    }
    case "bulletList":
      return (node.content ?? [])
        .map((li) => `- ${inline(li.content?.[0]?.content)}`)
        .join("\n");
    case "orderedList":
      return (node.content ?? [])
        .map((li, i) => `${i + 1}. ${inline(li.content?.[0]?.content)}`)
        .join("\n");
    case "blockquote":
      return (node.content ?? [])
        .map((c) => `> ${inline(c.content)}`)
        .join("\n");
    case "image":
      return `![${node.attrs?.alt ?? "image"}](${node.attrs?.src ?? ""})`;
    case "horizontalRule":
      return "---";
    case "codeBlock":
      return `\`\`\`\n${inline(node.content)}\n\`\`\``;
    default:
      return inline(node.content);
  }
}

/** Convert a stored Tiptap JSON string into Markdown body text. */
export function tiptapJsonToMarkdown(json: string): string {
  let doc: TipNode;
  try {
    doc = JSON.parse(json);
  } catch {
    return "";
  }
  return (doc.content ?? [])
    .map(renderNode)
    .filter((s) => s.trim() !== "")
    .join("\n\n");
}

/* ─────────────  Tiptap JSON → safe HTML (for print/PDF)  ───────────── */

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineHtml(nodes: TipNode[] | undefined): string {
  if (!nodes) return "";
  return nodes
    .map((n) => {
      if (n.type === "hardBreak") return "<br/>";
      if (n.type !== "text") return "";
      let t = esc(n.text ?? "");
      for (const mark of n.marks ?? []) {
        if (mark.type === "bold") t = `<strong>${t}</strong>`;
        else if (mark.type === "italic") t = `<em>${t}</em>`;
        else if (mark.type === "code") t = `<code>${t}</code>`;
        else if (mark.type === "strike") t = `<s>${t}</s>`;
      }
      return t;
    })
    .join("");
}

function nodeHtml(node: TipNode): string {
  switch (node.type) {
    case "paragraph":
      return `<p>${inlineHtml(node.content)}</p>`;
    case "heading": {
      const lvl = Math.min(3, Math.max(1, Number(node.attrs?.level ?? 2)));
      return `<h${lvl}>${inlineHtml(node.content)}</h${lvl}>`;
    }
    case "bulletList":
      return `<ul>${(node.content ?? [])
        .map((li) => `<li>${inlineHtml(li.content?.[0]?.content)}</li>`)
        .join("")}</ul>`;
    case "orderedList":
      return `<ol>${(node.content ?? [])
        .map((li) => `<li>${inlineHtml(li.content?.[0]?.content)}</li>`)
        .join("")}</ol>`;
    case "blockquote":
      return `<blockquote>${(node.content ?? [])
        .map(nodeHtml)
        .join("")}</blockquote>`;
    case "image":
      return `<img src="${esc(String(node.attrs?.src ?? ""))}" alt="${esc(
        String(node.attrs?.alt ?? ""),
      )}"/>`;
    case "horizontalRule":
      return "<hr/>";
    default:
      return node.content ? `<p>${inlineHtml(node.content)}</p>` : "";
  }
}

/** Render stored Tiptap JSON to safe HTML (all text is escaped). */
export function tiptapJsonToHtml(json: string): string {
  let doc: TipNode;
  try {
    doc = JSON.parse(json);
  } catch {
    return "";
  }
  return (doc.content ?? []).map(nodeHtml).join("");
}

/* ─────────────  Entry → Markdown document  ───────────── */

type EntryLike = Pick<
  Entry,
  "title" | "body" | "body_plain" | "mood" | "tags" | "entry_date"
>;

export function entryToMarkdown(entry: EntryLike): string {
  const lines: string[] = [];
  lines.push(`# ${entry.title || "Untitled"}`);
  const meta: string[] = [`*${formatEntryDate(entry.entry_date)}*`];
  if (entry.mood) {
    meta.push(`${MOOD_EMOJI[entry.mood as Mood]} ${MOOD_LABEL[entry.mood as Mood]}`);
  }
  lines.push(meta.join(" · "));
  if (entry.tags.length) {
    lines.push(entry.tags.map((t) => `#${t}`).join(" "));
  }
  lines.push("");
  lines.push(tiptapJsonToMarkdown(entry.body) || entry.body_plain);
  return lines.join("\n");
}

export function entriesToMarkdown(entries: Entry[]): string {
  const header = `# My Journal\n\n_Exported ${formatEntryDate(
    new Date().toISOString().slice(0, 10),
  )} · ${entries.length} ${entries.length === 1 ? "entry" : "entries"}_\n`;
  return [header, ...entries.map(entryToMarkdown)].join("\n\n---\n\n");
}

/* ─────────────  Browser downloads  ───────────── */

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadEntryMarkdown(entry: EntryLike) {
  const slug =
    (entry.title || "entry")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "entry";
  triggerDownload(
    entryToMarkdown(entry),
    `${entry.entry_date}-${slug}.md`,
    "text/markdown;charset=utf-8",
  );
}

export function downloadAllMarkdown(entries: Entry[]) {
  triggerDownload(
    entriesToMarkdown(entries),
    `journal-export-${new Date().toISOString().slice(0, 10)}.md`,
    "text/markdown;charset=utf-8",
  );
}
