export default (url: string): string => {
  if (!url || typeof url !== "string") {
    throw new Error(`Invalid database URL: ${url}`);
  }

  try {
    const urlObj = new URL(url);

    // Add pool parameters if not present - optimized for production with pm2
    if (!urlObj.searchParams.has("acquireTimeout")) {
      urlObj.searchParams.set("acquireTimeout", "30000");
    }
    if (!urlObj.searchParams.has("connectionLimit")) {
      // Reduce connection limit per client instance since we have multiple databases
      urlObj.searchParams.set("connectionLimit", "5");
    }
    if (!urlObj.searchParams.has("idleTimeout")) {
      urlObj.searchParams.set("idleTimeout", "180000"); // 3 minutes
    }
    if (!urlObj.searchParams.has("minimumIdle")) {
      urlObj.searchParams.set("minimumIdle", "1");
    }
    if (!urlObj.searchParams.has("maxLifetime")) {
      urlObj.searchParams.set("maxLifetime", "1800000"); // 30 minutes
    }

    return urlObj.toString();
  } catch (error) {
    throw new Error(
      `Invalid database URL format: ${url}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
