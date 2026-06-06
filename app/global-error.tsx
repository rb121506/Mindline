"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: "#faf8f5",
          color: "#1a1a1a",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420, padding: "0 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: 12, color: "#666", fontSize: 14, lineHeight: 1.6 }}>
            Mindline hit an unexpected error. Please try again.
          </p>
          {error.digest && (
            <p style={{ marginTop: 8, fontFamily: "monospace", fontSize: 11, color: "#999" }}>
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "10px 24px",
              borderRadius: 12,
              border: "none",
              background: "#d97706",
              color: "white",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
