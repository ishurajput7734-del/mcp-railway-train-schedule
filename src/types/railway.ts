export interface Station {
  code: string;
  name: string;
  city: string;
  state: string;
  zone?: string;
  aliases?: string[];
}

export interface RouteStop {
  stop_number: number;
  station_code: string;
  station_name: string;
  arrival: string;
  departure: string;
  halt_minutes: number;
  distance_km: number;
  day_count: number;
  platform?: number;
}

export interface Train {
  train_number: string;
  train_name: string;
  train_type: string;
  source: {
    code: string;
    name: string;
    city: string;
  };
  destination: {
    code: string;
    name: string;
    city: string;
  };
  departure_time: string;
  arrival_time: string;
  duration: string;
  running_days: string[];
  classes: string[];
  pantry?: boolean;
  distance_km: number;
  route: RouteStop[];
}

export interface SearchTrainResult {
  train_number: string;
  train_name: string;
  train_type: string;
  board_station: {
    code: string;
    name: string;
    departure_time: string;
    platform: number;
  };
  destination_station: {
    code: string;
    name: string;
    arrival_time: string;
    platform: number;
  };
  duration: string;
  distance_km: number;
  running_days: string[];
  runs_on_target_date: boolean;
  classes_available: string[];
  pantry: boolean;
}

export interface TrainScheduleResult {
  success: boolean;
  error?: string;
  suggestion?: string;
  train_number?: string;
  train_name?: string;
  train_type?: string;
  origin?: string;
  destination?: string;
  total_distance_km?: number;
  total_duration?: string;
  total_stops?: number;
  running_days?: string[];
  classes_offered?: string[];
  pantry_car?: boolean;
  schedule?: {
    stop_number: number;
    station_code: string;
    station_name: string;
    arrival_time: string;
    departure_time: string;
    halt_duration_minutes: number;
    distance_from_origin_km: number;
    day_count: number;
    platform_number: number;
  }[];
}

export interface LiveStatusResult {
  success: boolean;
  error?: string;
  train_number?: string;
  train_name?: string;
  journey_date?: string;
  current_status?: {
    status_summary: string;
    status_category: "ON_TIME" | "SLIGHT_DELAY" | "DELAYED";
    delay_minutes: number;
    delay_text: string;
    current_speed_kmh: number;
    last_reported_station: {
      code: string;
      name: string;
      scheduled_departure: string;
      actual_departure: string;
      stop_number: number;
    };
    next_upcoming_station: {
      code: string;
      name: string;
      scheduled_arrival: string;
      expected_arrival: string;
      distance_from_origin_km: number;
      platform: number;
    };
    journey_progress: {
      distance_covered_km: number;
      distance_remaining_km: number;
      total_distance_km: number;
      percentage_completed: number;
    };
  };
  source?: string;
  destination?: string;
  last_updated?: string;
}

export interface StationInfoResult {
  success: boolean;
  error?: string;
  suggestion?: string;
  station_code?: string;
  station_name?: string;
  city?: string;
  state?: string;
  railway_zone?: string;
  aliases?: string[];
  total_passing_trains?: number;
  trains?: {
    train_number: string;
    train_name: string;
    train_type: string;
    role_at_station: string;
    platform: number;
    arrival: string;
    departure: string;
    halt_minutes: number;
    route_summary: string;
    running_days: string[];
  }[];
}

export interface SeatAvailabilityResult {
  success: boolean;
  error?: string;
  available_classes_for_train?: string[];
  train_number?: string;
  train_name?: string;
  journey_date?: string;
  class_code?: string;
  quota?: string;
  availability_status?: string;
  category?: "AVAILABLE" | "RAC" | "WAITLIST";
  confirmation_probability_percentage?: number;
  status_detail?: string;
  estimated_fare_inr?: string;
  classes_offered_by_train?: string[];
  origin?: string;
  destination?: string;
}

export interface PnrPassenger {
  passenger_number: number;
  booking_status: string;
  current_status: string;
  coach: string;
  berth_number?: number | null;
  berth_type: string;
  confirmation_probability: number;
}

export interface PnrStatusResult {
  success: boolean;
  error?: string;
  suggestion?: string;
  pnr_number?: string;
  train_number?: string;
  train_name?: string;
  train_type?: string;
  booking_date?: string;
  journey_date?: string;
  class_code?: string;
  passenger_quota?: string;
  chart_status?: string;
  overall_status?: string;
  overall_category?: 'CONFIRMED' | 'RAC' | 'WAITLISTED';
  confirmation_probability_percentage?: number;
  boarding_station?: {
    code: string;
    name: string;
    departure_time: string;
  };
  destination_station?: {
    code: string;
    name: string;
    arrival_time: string;
  };
  total_passengers?: number;
  passengers?: PnrPassenger[];
}
