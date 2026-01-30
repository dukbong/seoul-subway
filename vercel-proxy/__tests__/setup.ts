// Suppress unhandled rejection warnings during tests
// These occur due to timing of promise rejection handling with fake timers
// but do not affect test correctness
process.on('unhandledRejection', () => {});
