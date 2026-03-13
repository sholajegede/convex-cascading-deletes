import "./App.css";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

type Comment = { _id: string; text: string; postId: string };
type Post = { _id: string; title: string; userId: string; comments: Comment[] };
type User = { _id: string; name: string; posts: Post[] };

const AVATAR_COLORS: Record<string, string> = {
  A: "#4ade80",
  M: "#60a5fa",
  Y: "#f472b6",
  P: "#fb923c",
  T: "#a78bfa",
  Z: "#34d399",
  E: "#facc15",
  N: "#38bdf8",
};

export default function App() {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletedId, setDeletedId] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [seeding, setSeeding] = useState(false);

  const seed = useMutation(api.example.seed);
  const users = useQuery(api.example.listUsers) as User[] | undefined;
  const deleteWithCascade = useAction(api.example.deleteWithCascade);
  const log = useQuery(
    api.example.getDeletionLog,
    deletedId ? { table: "users", id: deletedId } : "skip"
  );
  const allLogs = useQuery(api.example.listDeletionLogs);

  const handleSeed = async () => {
    setSeeding(true);
    await seed({});
    setSeeding(false);
  };

  const handleDelete = async (userId: string) => {
    setDeletingId(userId);
    setDeletedId(null);
    setResult(null);
    await new Promise((r) => setTimeout(r, 350));
    const counts = await deleteWithCascade({ table: "users", id: userId });
    setDeletingId(null);
    setDeletedId(userId);
    setResult(counts);
  };

  const accentColor = (name: string) => AVATAR_COLORS[name[0]] ?? "#4ade80";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#09090b",
        backgroundImage:
          "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(74,222,128,0.07), transparent)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "56px 20px 80px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#fafafa",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          textAlign: "center",
          margin: "0 auto 48px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "monospace",
            fontSize: 11,
            color: "#4ade80",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#4ade80",
              boxShadow: "0 0 8px #4ade80",
            }}
          />
          Convex Component
        </div>
        <h1
          style={{
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            marginBottom: 12,
            background: "linear-gradient(to bottom, #ffffff 30%, #71717a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Cascading Deletes
        </h1>
        <p
          style={{
            color: "#71717a",
            fontSize: 15,
            lineHeight: 1.7,
            maxWidth: 460,
            margin: "0 auto",
          }}
        >
          Delete a record and watch all dependent documents disappear —
          automatically, in the correct order.
        </p>
      </div>

      {/* Main layout */}
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          margin: "0 auto",
        }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {/* Result panel */}
          {result && log ? (
            <div
              style={{
                background: "#111113",
                border: "1px solid rgba(74,222,128,0.35)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 16px",
                  borderBottom: "1px solid rgba(74,222,128,0.15)",
                  background: "rgba(74,222,128,0.05)",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#4ade80",
                    boxShadow: "0 0 6px #4ade80",
                  }}
                />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "#4ade80",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Cascade Complete
                </span>
              </div>
              <div
                style={{
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", gap: 10 }}>
                  {Object.entries(result).map(([table, count]) => (
                    <div
                      key={table}
                      style={{
                        flex: 1,
                        background: "#18181b",
                        border: "1px solid #27272a",
                        borderRadius: 8,
                        padding: "14px 16px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: 32,
                          fontWeight: 600,
                          color: "#4ade80",
                          lineHeight: 1,
                          marginBottom: 6,
                        }}
                      >
                        {count}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#52525b",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {table} deleted
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    background: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: 6,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 10,
                      color: "#52525b",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 6,
                    }}
                  >
                    Deletion Log
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "#60a5fa",
                    }}
                  >
                    {log.rootTable} / {log.rootId}
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "#3f3f46",
                      marginTop: 4,
                    }}
                  >
                    {new Date(log.deletedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div />
          )}

          {/* Deletion History */}
          {allLogs && allLogs.length > 0 ? (
            <div
              style={{
                background: "#111113",
                border: "1px solid #27272a",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #27272a",
                  background: "#18181b",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "#52525b",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Deletion History
                </span>
              </div>
              <div
                style={{
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {allLogs.map((log) => {
                  const counts = JSON.parse(log.deletedCounts) as Record<
                    string,
                    number
                  >;
                  return (
                    <div
                      key={log._id}
                      style={{
                        background: "#18181b",
                        border: "1px solid #27272a",
                        borderRadius: 6,
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "monospace",
                            fontSize: 11,
                            color: "#60a5fa",
                          }}
                        >
                          {log.rootTable} / {log.rootId.slice(0, 20)}…
                        </div>
                        <div
                          style={{
                            fontFamily: "monospace",
                            fontSize: 10,
                            color: "#3f3f46",
                            marginTop: 3,
                          }}
                        >
                          {new Date(log.deletedAt).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {Object.entries(counts).map(([table, count]) => (
                          <span
                            key={table}
                            style={{
                              fontFamily: "monospace",
                              fontSize: 11,
                              padding: "2px 8px",
                              borderRadius: 4,
                              background: "rgba(74,222,128,0.1)",
                              border: "1px solid rgba(74,222,128,0.2)",
                              color: "#4ade80",
                            }}
                          >
                            {count} {table}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div />
          )}
        </div>

        {/* Database panel */}
        <div
          style={{
            background: "#111113",
            border: "1px solid #27272a",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid #27272a",
              background: "#18181b",
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "#52525b",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Database State
            </span>
            <button
              onClick={handleSeed}
              disabled={seeding}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(74,222,128,0.1)",
                border: "1px solid rgba(74,222,128,0.25)",
                color: "#4ade80",
                fontFamily: "monospace",
                fontSize: 12,
                padding: "6px 14px",
                borderRadius: 6,
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              {seeding ? "Seeding..." : "+ Seed user"}
            </button>
          </div>

          {!users || users.length === 0 ? (
            <div
              style={{
                padding: "48px 20px",
                textAlign: "center",
                color: "#3f3f46",
                fontFamily: "monospace",
                fontSize: 12,
              }}
            >
              No records yet — seed some data to get started
            </div>
          ) : (
            <div
              style={{
                padding: 12,
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 10,
              }}
            >
              {[...users]
                .slice()
                .reverse()
                .map((user) => {
                  const color = accentColor(user.name);
                  const isDeleting = deletingId === user._id;
                  const isDimmed = !!deletingId && !isDeleting;
                  return (
                    <div
                      key={user._id}
                      style={{
                        background: "#18181b",
                        border: `1px solid ${
                          isDeleting ? "rgba(239,68,68,0.5)" : "#27272a"
                        }`,
                        borderRadius: 8,
                        overflow: "hidden",
                        opacity: isDimmed ? 0.35 : 1,
                        transition: "all 0.3s ease",
                        transform: isDeleting ? "scale(0.995)" : "scale(1)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderBottom: "1px solid #27272a",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: `rgba(${
                                color === "#4ade80"
                                  ? "74,222,128"
                                  : color === "#60a5fa"
                                  ? "96,165,250"
                                  : color === "#f472b6"
                                  ? "244,114,182"
                                  : color === "#fb923c"
                                  ? "251,146,60"
                                  : color === "#a78bfa"
                                  ? "167,139,250"
                                  : color === "#34d399"
                                  ? "52,211,153"
                                  : color === "#facc15"
                                  ? "250,204,21"
                                  : "56,189,248"
                              },0.15)`,
                              border: `1px solid ${color}33`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 13,
                              fontWeight: 700,
                              color,
                              fontFamily: "monospace",
                            }}
                          >
                            {user.name[0]}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>
                              {user.name}
                            </div>
                            <div
                              style={{
                                fontFamily: "monospace",
                                fontSize: 10,
                                color: "#52525b",
                                marginTop: 1,
                              }}
                            >
                              {user._id.slice(0, 24)}…
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(user._id)}
                          disabled={!!deletingId}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            color: "#f87171",
                            fontFamily: "monospace",
                            fontSize: 11,
                            padding: "5px 12px",
                            borderRadius: 5,
                            cursor: deletingId ? "not-allowed" : "pointer",
                            opacity: deletingId ? 0.5 : 1,
                            letterSpacing: "0.04em",
                          }}
                        >
                          {isDeleting ? "Deleting..." : "↯ Cascade delete"}
                        </button>
                      </div>

                      <div style={{ padding: "10px 14px" }}>
                        {user.posts.map((post) => (
                          <div key={post._id} style={{ marginBottom: 6 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "2px 0",
                              }}
                            >
                              <div
                                style={{
                                  width: 14,
                                  height: 1,
                                  background: "#3f3f46",
                                  flexShrink: 0,
                                }}
                              />
                              <span style={{ fontSize: 10, color: "#52525b" }}>
                                ▪
                              </span>
                              <span
                                style={{
                                  fontSize: 13,
                                  color: "#d4d4d8",
                                  flex: 1,
                                }}
                              >
                                {post.title}
                              </span>
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: 10,
                                  padding: "1px 6px",
                                  borderRadius: 3,
                                  background: "rgba(96,165,250,0.1)",
                                  border: "1px solid rgba(96,165,250,0.2)",
                                  color: "#60a5fa",
                                }}
                              >
                                post
                              </span>
                            </div>
                            {post.comments.map((c) => (
                              <div
                                key={c._id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  padding: "2px 0",
                                  paddingLeft: 22,
                                }}
                              >
                                <div
                                  style={{
                                    width: 14,
                                    height: 1,
                                    background: "#27272a",
                                    flexShrink: 0,
                                  }}
                                />
                                <span
                                  style={{ fontSize: 10, color: "#3f3f46" }}
                                >
                                  ╰
                                </span>
                                <span
                                  style={{
                                    fontSize: 12,
                                    color: "#52525b",
                                    flex: 1,
                                  }}
                                >
                                  {c.text}
                                </span>
                                <span
                                  style={{
                                    fontFamily: "monospace",
                                    fontSize: 10,
                                    padding: "1px 6px",
                                    borderRadius: 3,
                                    background: "rgba(251,191,36,0.1)",
                                    border: "1px solid rgba(251,191,36,0.2)",
                                    color: "#fbbf24",
                                  }}
                                >
                                  comment
                                </span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 48,
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontFamily: "monospace",
          fontSize: 11,
          color: "#3f3f46",
        }}
      >
        <a
          rel="noopener noreferrer"
          href="https://www.npmjs.com/package/@sholajegede/convex-cascading-deletes"
          target="_blank"
          style={{ color: "#52525b", textDecoration: "none" }}
        >
          npm
        </a>
        <div
          style={{
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "#27272a",
          }}
        />
        <a
          rel="noopener noreferrer"
          href="https://github.com/sholajegede/convex-cascading-deletes"
          target="_blank"
          style={{ color: "#52525b", textDecoration: "none" }}
        >
          github
        </a>
        <div
          style={{
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "#27272a",
          }}
        />
        <a
          rel="noopener noreferrer"
          href="https://convex.dev/components"
          target="_blank"
          style={{ color: "#52525b", textDecoration: "none" }}
        >
          convex components
        </a>
      </div>
    </div>
  );
}