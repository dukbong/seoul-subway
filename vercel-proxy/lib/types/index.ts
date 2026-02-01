// Common types
export type { SeoulApiResult } from './common.js';

// Seoul Open API types
export type {
  StationInfo,
  StationsApiResponse,
  RealtimeArrival,
  RealtimeApiError,
  RealtimeApiResponse,
  LastTrainInfo,
  LastTrainApiResponse,
} from './seoulOpenApi.js';

// Data.go.kr API types
export type {
  RouteStation,
  RoutePath,
  PathSegment,
  RouteApiResponse,
  Notice,
  AlertsApiResponse,
} from './dataGoKr.js';

// Accessibility API types
export type {
  SeoulOpenApiResponse,
  ElevatorLocationInfo,
  ElevatorLocationApiResponse,
  EscalatorLocationInfo,
  EscalatorLocationApiResponse,
  ElevatorOperationInfo,
  ElevatorOperationApiResponse,
  EscalatorOperationInfo,
  EscalatorOperationApiResponse,
  WheelchairLiftInfo,
  WheelchairLiftApiResponse,
  QuickExitInfo,
  QuickExitApiResponse,
  RestroomInfo,
  RestroomApiResponse,
  AccessibilityInfo,
  QuickExitData,
  RestroomData,
} from './accessibility.js';
