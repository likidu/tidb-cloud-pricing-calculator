// Centralized configuration for pricing calculator constants
// Adjust these values to tune calculator behavior without touching core logic.

// Minimum allowed compression ratio (Compressed / Original)
// 0 is invalid (would imply infinite compression). Use a small positive floor.
export const MIN_COMPRESSION_RATIO = 0.1
