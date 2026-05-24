// أضف هذا في artifacts/api-server/src/routes/index.ts
// قبل أي route أخرى

// Health check للـ Railway
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});
