// ملف: artifacts/api-server/src/cors-config.ts
// أضف هذا الملف واستخدمه في index.ts

import cors from "cors";

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean) as string[];

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // السماح للطلبات بدون origin (مثل Postman أو server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};
