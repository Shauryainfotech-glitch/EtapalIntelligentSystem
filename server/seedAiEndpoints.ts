import { storage } from "./storage";

export async function seedAiEndpoints() {
  try {
    console.log("Seeding AI API endpoints...");

    // Check if endpoints already exist
    const existingEndpoints = await storage.getAiApiEndpoints();
    if (existingEndpoints.length > 0) {
      console.log("AI endpoints already seeded");
      return;
    }

    // Google Vision OCR Endpoint
    await storage.createAiApiEndpoint({
      name: "Google Vision OCR",
      provider: "google",
      endpoint: "https://vision.googleapis.com/v1/images:annotate",
      apiKey: process.env.GOOGLE_API_KEY || "google-api-key-placeholder",
      model: "text-detection",
      isActive: true,
      rateLimit: 1000, // per minute
      timeout: 30000,
      retryAttempts: 3,
      configuration: {
        features: ["TEXT_DETECTION", "DOCUMENT_TEXT_DETECTION"],
        imageContext: {
          languageHints: ["mr", "en", "hi"]
        }
      }
    });

    // OpenAI GPT-4 Analysis Endpoint
    await storage.createAiApiEndpoint({
      name: "OpenAI GPT-4 Document Analysis",
      provider: "openai",
      endpoint: "https://api.openai.com/v1/chat/completions",
      apiKey: process.env.OPENAI_API_KEY || "openai-api-key-placeholder",
      model: "gpt-4o",
      isActive: true,
      rateLimit: 500,
      timeout: 60000,
      retryAttempts: 2,
      configuration: {
        temperature: 0.1,
        maxTokens: 2000,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0
      }
    });

    // Anthropic Claude Analysis Endpoint
    await storage.createAiApiEndpoint({
      name: "Anthropic Claude Document Classification",
      provider: "anthropic",
      endpoint: "https://api.anthropic.com/v1/messages",
      apiKey: process.env.ANTHROPIC_API_KEY || "anthropic-api-key-placeholder",
      model: "claude-3-5-sonnet-20241022",
      isActive: true,
      rateLimit: 300,
      timeout: 45000,
      retryAttempts: 2,
      configuration: {
        temperature: 0.1,
        maxTokens: 1500,
        topK: 40
      }
    });

    // OpenAI GPT-4 Turbo for Fast Processing
    await storage.createAiApiEndpoint({
      name: "OpenAI GPT-4 Turbo",
      provider: "openai",
      endpoint: "https://api.openai.com/v1/chat/completions",
      apiKey: process.env.OPENAI_API_KEY || "openai-api-key-placeholder",
      model: "gpt-4-turbo",
      isActive: true,
      rateLimit: 800,
      timeout: 30000,
      retryAttempts: 3,
      configuration: {
        temperature: 0.2,
        maxTokens: 1000,
        topP: 0.8
      }
    });

    console.log("AI endpoints seeded successfully");

    // Initialize performance tracking for current day
    const endpoints = await storage.getAiApiEndpoints();
    for (const endpoint of endpoints) {
      await storage.updateDailyPerformanceMetrics(endpoint.id, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        totalTokensUsed: 0,
        totalCost: "0.00",
        averageConfidence: 0
      });
    }

    console.log("Performance tracking initialized");

  } catch (error) {
    console.error("Error seeding AI endpoints:", error);
    throw error;
  }
}