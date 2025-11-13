/**
 * Optimizes the route using a simple nearest neighbor algorithm
 * For a production app, you would use a more sophisticated algorithm or API
 */
export function optimizeRoute(destinations) {
  if (destinations.length <= 2) {
    return [...destinations];
  }

  // Start with the first destination
  const optimized = [destinations[0]];
  const remaining = destinations.slice(1);

  // Greedy nearest neighbor algorithm
  while (remaining.length > 0) {
    const current = optimized[optimized.length - 1];
    let nearestIndex = 0;
    let minDistance = calculateDistance(current, remaining[0]);

    for (let i = 1; i < remaining.length; i++) {
      const distance = calculateDistance(current, remaining[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    optimized.push(remaining[nearestIndex]);
    remaining.splice(nearestIndex, 1);
  }

  return optimized;
}

function calculateDistance(a, b) {
  // Haversine formula for distance between two points
  const R = 6371; // Earth's radius in km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}
