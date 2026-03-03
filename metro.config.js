const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};

// Enable package.json "exports" field resolution (required for tRPC v11)
config.resolver.unstable_enablePackageExports = true;

// Block server-side packages from the client bundle.
// These use Node.js built-ins not available in React Native.
config.resolver.blockList = [
  /node_modules\/postgres\/.*/,
  /node_modules\/drizzle-orm\/.*/,
  /node_modules\/drizzle-kit\/.*/,
  /node_modules\/bcryptjs\/.*/,
  /node_modules\/hono\/.*/,
  /node_modules\/@hono\/.*/,
  /node_modules\/@trpc\/server\/dist\/adapters\/.*/,
  /node_modules\/@trpc\/server\/dist\/http\..*/,
  /node_modules\/expo-notifications\/.*/,
  /node_modules\/expo-location\/.*/,
  /node_modules\/expo-device\/.*/,
  /node_modules\/expo-symbols\/.*/,
  /.*\/backend\/.*/,
  /.*\/db\/index\.ts/,
  /.*\/db\/schema\.ts/,
  /.*\/db\/seed\.ts/,
];

module.exports = config;
