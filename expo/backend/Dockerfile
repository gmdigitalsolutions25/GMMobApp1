# Use the official Bun image
# See all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /app

# Copy package.json and bun.lock files from the root and backend
# We copy the root files because it's a monorepo setup (or at least has root dependencies)
COPY package.json bun.lock ./

# Install dependencies (including dev dependencies for build if needed, or production only)
# Removed --frozen-lockfile because we encountered a mismatch during build
RUN bun install

# Copy the source code
# We copy everything from the root context to ensure shared libs are available if referenced
# The .dockerignore will prevent copying node_modules and other huge ignored folders
COPY . .

# Setting the working directory to backend might be useful for relative paths, 
# but the start command runs from root usually if script is in root, 
# or we can run relative to root.
# Given the DEPLOYMENT.md says `bun run backend/hono.ts` from root, let's keep WORKDIR /app

# Expose the listening port
EXPOSE 8080

# Run the application
CMD ["bun", "run", "backend/hono.ts"]
