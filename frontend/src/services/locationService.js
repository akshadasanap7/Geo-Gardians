export const movementPoints = [
  { latitude: 19.9282, longitude: 73.5214 },
  { latitude: 19.9322, longitude: 73.5304 },
  { latitude: 19.9386, longitude: 73.5425 },
  { latitude: 19.9494, longitude: 73.5568 },
  { latitude: 19.9628, longitude: 73.5744 }
];

export function getNextMovementPoint(routeIndex = 0) {
  return movementPoints[routeIndex % movementPoints.length];
}
