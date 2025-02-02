export default {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {}, // Disable ts-jest transformation
  moduleFileExtensions: ["js", "json", "node"],
  moduleDirectories: ["node_modules", "dist"], // Tell Jest to use compiled JavaScript
  roots: ["<rootDir>/dist"], // Run tests from compiled JS
};
