import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, MessageSquare } from "lucide-react";
import type { GuestbookConfig } from "@shared/types";

interface Comment {
  id: number;
  name: string;
  message: string;
  avatar: string;
  created_at: string;
}

// Parse comment body: "**name**: message"
function parseBody(body: string): { name: string; message: string } | null {
  const m = body.match(/^\*\*(.+?)\*\*:\s*([\s\S]+)/);
  if (!m) return null;
  return { name: m[1].trim(), message: m[2].trim() };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface GuestbookProps {
  config: GuestbookConfig;
}

export default function Guestbook({ config }: GuestbookProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const apiBase = `https://api.github.com/repos/${config.repo}/issues/${config.issueNumber}/comments`;

  const fetchComments = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(apiBase, {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();
      const parsed: Comment[] = [];
      for (const c of data) {
        const p = parseBody(c.body || "");
        if (p) {
          parsed.push({
            id: c.id,
            name: p.name,
            message: p.message,
            avatar: c.user?.avatar_url || "",
            created_at: c.created_at,
          });
        }
      }
      setComments(parsed);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || sending) return;
    setSending(true);
    try {
      const body = `**${name.trim()}**: ${message.trim()}`;
      const res = await fetch(apiBase, {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${config.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      await fetchComments();
      setName("");
      setMessage("");
    } catch (e: any) {
      setError(e.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-16 pt-12 border-t border-border">
      <h3 className="text-2xl font-bold mb-4 text-center">Guestbook</h3>
      <p className="text-foreground/60 text-center mb-8 text-sm leading-relaxed max-w-md mx-auto">
        Leave a message or say hello — no login required.
      </p>

      {/* Comment list */}
      <div className="max-w-xl mx-auto mb-10">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-foreground/40" />
          </div>
        ) : error && comments.length === 0 ? (
          <p className="text-center text-foreground/50 py-8 text-sm">{error}</p>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-foreground/40">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No messages yet. Be the first!</p>
          </div>
        ) : (
          <ul className="space-y-5">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-3">
                <img
                  src={c.avatar}
                  alt=""
                  className="w-9 h-9 rounded-full mt-0.5 bg-muted"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm">{c.name}</span>
                    <span className="text-xs text-foreground/40">{formatDate(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-foreground/80 mt-0.5 whitespace-pre-wrap break-words">
                    {c.message}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Submit form */}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
        <Input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={50}
        />
        <Textarea
          placeholder="Your message..."
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          maxLength={1000}
        />
        <Button type="submit" className="w-full rounded-full" disabled={sending}>
          {sending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send message
            </>
          )}
        </Button>
        {error && comments.length > 0 && (
          <p className="text-xs text-destructive text-center">{error}</p>
        )}
      </form>
    </div>
  );
}
