export function forceNumberClamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
