import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { logger } from "./utils/logger";
import { prisma } from "./utils/prisma";

const PORT = Number(process.env.PORT) || 3001;

async function bootstrap() {
  try {
    // Test DB connection
    await prisma.$connect();
    logger.info("✅ Database connected");

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`   ENV: ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    logger.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

bootstrap();

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received — shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});
