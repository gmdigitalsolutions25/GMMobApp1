const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

/**
 * Block all server-side Node.js packages and unused native modules
 * from the client bundle. These packages use Node.js built-ins
 * (net, tls, crypto, fs) not available in React Native / Hermes on Android,
 * or require native plugins not configured in app.json.
 */
config.resolver = config.resolver || {};
config.resolver.blockList = [
  // Server-only packages (Node.js built-ins)
  /node_modules\/postgres\/.*/,
  /node_modules\/drizzle-orm\/.*/,
  /node_modules\/drizzle-kit\/.*/,
  /node_modules\/bcryptjs\/.*/,
  /node_modules\/hono\/.*/,
  /node_modules\/@trpc\/server\/.*/,
  /node_modules\/@hono\/.*/,
  // Expo native modules NOT in app.json plugins — would crash native bridge
  /node_modules\/expo-notifications\/.*/,
  /node_modules\/expo-location\/.*/,
  /node_modules\/expo-device\/.*/,
  /node_modules\/expo-symbols\/.*/,
  // Block entire backend and db directories from client bundle
  /.*\/backend\/.*/,
  /.*\/db\/index\.ts/,
  /.*\/db\/schema\.ts/,
  /.*\/db\/seed\.ts/,
];

module.exports = config;
