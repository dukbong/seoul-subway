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
  PathSegment,
  RouteApiResponse,
  Notice,
  AlertsApiResponse,
} from './dataGoKr.js';
