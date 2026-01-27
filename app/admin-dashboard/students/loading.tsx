export default function Loading() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9fafb",
        color: "#111827",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid #e5e7eb",
          borderTop: "4px solid #2563eb",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />

      <h2 style={{ marginTop: "20px", fontSize: "20px", fontWeight: 600 }}>
        SkillHub
      </h2>

      <p style={{ marginTop: "6px", fontSize: "14px", color: "#6b7280" }}>
        Preparing your learning space…
      </p>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}
