import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedAiEndpoints } from "./seedAiEndpoints";
import { setupSecurity, errorHandler } from "./middleware/security";
import { logger } from "./utils/logger";

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup security middleware
setupSecurity(app);

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: any) {
    capturedJsonResponse = bodyJson;
    return originalResJson.call(this, bodyJson);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const logData: Record<string, any> = {
        method: req.method,
        path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      };

      if (capturedJsonResponse && res.statusCode >= 400) {
        logData.response = capturedJsonResponse;
      }

      const level = res.statusCode >= 400 ? "error" : "info";
      logger.log(level, "API Request", logData);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  
  // Initialize AI endpoints on startup
  try {
    await seedAiEndpoints();
  } catch (error) {
    console.error("Failed to seed AI endpoints:", error);
  }

  // Error handling middleware
  app.use(errorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(port, "localhost", () => {
    log(`serving on port ${port}`);
  });
})();
