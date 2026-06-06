import { ChatClient } from "@/components/chat/ChatClient";
import { requireUser } from "@/lib/dal";

export const metadata = { title: "Chat · Mindline" };

export default async function ChatPage() {
  await requireUser();
  return (
    <div className="animate-fade-in">
      <header className="mb-7">
        <p className="text-sm font-medium text-accent-strong">AI companion</p>
        <h1 className="mt-0.5 font-serif text-3xl font-semibold tracking-tight">
          Chat with your journal
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask anything about your entries — themes, moods, memories, patterns.
        </p>
      </header>
      <ChatClient />
    </div>
  );
}
