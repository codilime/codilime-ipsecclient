export function forceNumberMinMax(event) {
    let value = parseInt(event.target.value, 10);
    const min = parseInt(event.target.min, 10);
    const max = parseInt(event.target.max, 10);

    if (event.target.max && value > max) {
        value = max;
    }
    if (event.target.min && value < min) {
        value = min;
    }
    if (isNaN(value)) {
        return min;
    }
    return value;
}

export function forceNumberClamp (value, min, max) {
    return Math.min(Math.max(value, min), max);
}
