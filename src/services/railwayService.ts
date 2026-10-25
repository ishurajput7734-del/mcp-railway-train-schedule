import { STATIONS, TRAINS } from '../data/trainData';
import {
  LiveStatusResult,
  SearchTrainResult,
  SeatAvailabilityResult,
  Station,
  StationInfoResult,
  TrainScheduleResult,
} from '../types/railway';

const DAY_MAP: Record<number, string> = {
  0: 'Mon',
  1: 'Tue',
  2: 'Wed',
  3: 'Thu',
  4: 'Fri',
  5: 'Sat',
  6: 'Sun',
};

// Simple pseudo-random hash generator for deterministic simulations
function getDeterministicHash(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function resolveStation(query: string): Station | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();

  // Code match
  const byCode = STATIONS.find((s) => s.code.toLowerCase() === q);
  if (byCode) return byCode;

  // Alias match
  const byAlias = STATIONS.find((s) =>
    s.aliases?.some((a) => a.toLowerCase() === q)
  );
  if (byAlias) return byAlias;

  // Partial name/city match
  return STATIONS.find(
    (s) => s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
  );
}

export function getStationsForQuery(query: string): Station[] {
  if (!query) return [];
  const q = query.trim().toLowerCase();
  const results: Station[] = [];
  const seenCodes = new Set<string>();

  for (const stn of STATIONS) {
    if (
      stn.code.toLowerCase() === q ||
      stn.city.toLowerCase() === q ||
      stn.aliases?.some((a) => a.toLowerCase() === q) ||
      stn.name.toLowerCase().includes(q)
    ) {
      if (!seenCodes.has(stn.code)) {
        seenCodes.add(stn.code);
        results.push(stn);
      }
    }
  }

  return results;
}

export function parseDate(dateStr: string): { date: Date; formatted: string; day: string } | null {
  const clean = (dateStr || 'tomorrow').trim().toLowerCase();
  const now = new Date();

  let targetDate = new Date();
  if (clean === 'today' || clean === 'tod') {
    targetDate = now;
  } else if (clean === 'tomorrow' || clean === 'tom') {
    targetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  } else if (clean === 'day after tomorrow') {
    targetDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  } else {
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      return null;
    }
    targetDate = parsed;
  }

  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getDate()).padStart(2, '0');
  const formatted = `${yyyy}-${mm}-${dd}`;

  // JavaScript getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  const jsDay = targetDate.getDay();
  // Map to Mon=0 .. Sun=6
  const normalizedDayIdx = jsDay === 0 ? 6 : jsDay - 1;
  const day = DAY_MAP[normalizedDayIdx];

  return { date: targetDate, formatted, day };
}

export function searchTrainsClient(source: string, destination: string, dateStr: string = 'tomorrow') {
  if (!source?.trim()) {
    return { success: false, error: 'Source station or city cannot be empty.', trains_found: 0, trains: [] };
  }
  if (!destination?.trim()) {
    return { success: false, error: 'Destination station or city cannot be empty.', trains_found: 0, trains: [] };
  }

  const parsed = parseDate(dateStr);
  if (!parsed) {
    return { success: false, error: `Invalid date format: '${dateStr}'. Please use YYYY-MM-DD or 'tomorrow'.`, trains_found: 0, trains: [] };
  }

  const srcStations = getStationsForQuery(source);
  const dstStations = getStationsForQuery(destination);

  if (srcStations.length === 0) {
    return {
      success: false,
      error: `Station or city '${source}' not recognized. Try station code (e.g. SBC, NDLS, KCG) or city name.`,
      trains_found: 0,
      trains: [],
    };
  }

  if (dstStations.length === 0) {
    return {
      success: false,
      error: `Station or city '${destination}' not recognized. Try station code (e.g. SBC, NDLS, KCG) or city name.`,
      trains_found: 0,
      trains: [],
    };
  }

  const srcCodes = new Set(srcStations.map((s) => s.code));
  const dstCodes = new Set(dstStations.map((s) => s.code));

  const matching: SearchTrainResult[] = [];

  for (const train of TRAINS) {
    let srcStop: (typeof train.route)[0] | null = null;
    let dstStop: (typeof train.route)[0] | null = null;

    for (const stop of train.route) {
      if (srcCodes.has(stop.station_code) && !srcStop) {
        srcStop = stop;
      } else if (dstCodes.has(stop.station_code) && srcStop) {
        dstStop = stop;
        break;
      }
    }

    if (srcStop && dstStop) {
      const runsOnTargetDate = train.running_days.includes(parsed.day);
      const depTime = srcStop.departure !== '--:--' ? srcStop.departure : srcStop.arrival;
      const arrTime = dstStop.arrival !== '--:--' ? dstStop.arrival : dstStop.departure;
      const dist = Math.max(0, dstStop.distance_km - srcStop.distance_km);

      matching.push({
        train_number: train.train_number,
        train_name: train.train_name,
        train_type: train.train_type,
        board_station: {
          code: srcStop.station_code,
          name: srcStop.station_name,
          departure_time: depTime,
          platform: srcStop.platform || 1,
        },
        destination_station: {
          code: dstStop.station_code,
          name: dstStop.station_name,
          arrival_time: arrTime,
          platform: dstStop.platform || 1,
        },
        duration: train.duration,
        distance_km: dist || train.distance_km,
        running_days: train.running_days,
        runs_on_target_date: runsOnTargetDate,
        classes_available: train.classes,
        pantry: train.pantry ?? false,
      });
    }
  }

  matching.sort((a, b) => {
    if (a.runs_on_target_date && !b.runs_on_target_date) return -1;
    if (!a.runs_on_target_date && b.runs_on_target_date) return 1;
    return a.board_station.departure_time.localeCompare(b.board_station.departure_time);
  });

  return {
    success: true,
    query: {
      source,
      destination,
      requested_date: parsed.formatted,
      day_of_week: parsed.day,
      resolved_source_stations: srcStations.map((s) => `${s.name} (${s.code})`),
      resolved_destination_stations: dstStations.map((s) => `${s.name} (${s.code})`),
    },
    trains_found: matching.length,
    trains: matching,
    message: `Found ${matching.length} train(s) between ${srcStations[0].name} and ${dstStations[0].name} for ${parsed.formatted} (${parsed.day}).`,
  };
}

export function getTrainScheduleClient(trainNumber: string): TrainScheduleResult {
  const cleanNum = trainNumber?.trim();
  if (!cleanNum) {
    return {
      success: false,
      error: "Train number cannot be empty. Please provide a 5-digit train number like '12785'.",
    };
  }

  const train = TRAINS.find((t) => t.train_number === cleanNum);
  if (!train) {
    return {
      success: false,
      error: `Train number '${cleanNum}' not found in database.`,
      suggestion: 'Sample valid train numbers include: 12785, 12786, 20703, 20704, 22691, 12007.',
    };
  }

  return {
    success: true,
    train_number: train.train_number,
    train_name: train.train_name,
    train_type: train.train_type,
    origin: `${train.source.name} (${train.source.code})`,
    destination: `${train.destination.name} (${train.destination.code})`,
    total_distance_km: train.distance_km,
    total_duration: train.duration,
    total_stops: train.route.length,
    running_days: train.running_days,
    classes_offered: train.classes,
    pantry_car: train.pantry ?? false,
    schedule: train.route.map((s) => ({
      stop_number: s.stop_number,
      station_code: s.station_code,
      station_name: s.station_name,
      arrival_time: s.arrival,
      departure_time: s.departure,
      halt_duration_minutes: s.halt_minutes,
      distance_from_origin_km: s.distance_km,
      day_count: s.day_count,
      platform_number: s.platform || 1,
    })),
  };
}

export function getTrainStatusClient(trainNumber: string, dateStr: string = 'today'): LiveStatusResult {
  const cleanNum = trainNumber?.trim();
  if (!cleanNum) {
    return { success: false, error: 'Train number cannot be empty.' };
  }

  const train = TRAINS.find((t) => t.train_number === cleanNum);
  if (!train) {
    return { success: false, error: `Train number '${cleanNum}' not found.` };
  }

  const parsed = parseDate(dateStr) || { formatted: new Date().toISOString().slice(0, 10) };
  const hash = getDeterministicHash(`${cleanNum}-${parsed.formatted}`);

  const delaySelector = hash % 100;
  let delayMinutes = 0;
  if (delaySelector < 40) {
    delayMinutes = hash % 6;
  } else if (delaySelector < 80) {
    delayMinutes = 6 + (hash % 25);
  } else {
    delayMinutes = 31 + (hash % 35);
  }

  const route = train.route;
  const totalStops = route.length;
  const stopIdx = Math.floor(hash / 10) % (totalStops - 1);
  const currentStation = route[stopIdx];
  const nextStation = route[Math.min(stopIdx + 1, totalStops - 1)];

  const speedKmh = stopIdx < totalStops - 1 ? 65 + (hash % 45) : 0;
  const statusCat = delayMinutes === 0 ? 'ON_TIME' : delayMinutes <= 15 ? 'SLIGHT_DELAY' : 'DELAYED';
  const delayText = delayMinutes === 0 ? 'Right On Time' : `Delayed by ${delayMinutes} mins`;

  const totalDistance = train.distance_km;
  const distanceCovered = currentStation.distance_km;
  const distanceRemaining = Math.max(0, totalDistance - distanceCovered);

  return {
    success: true,
    train_number: train.train_number,
    train_name: train.train_name,
    journey_date: parsed.formatted,
    current_status: {
      status_summary: `Departed ${currentStation.station_name} (${currentStation.station_code}), proceeding towards ${nextStation.station_name} (${nextStation.station_code})`,
      status_category: statusCat,
      delay_minutes: delayMinutes,
      delay_text: delayText,
      current_speed_kmh: speedKmh,
      last_reported_station: {
        code: currentStation.station_code,
        name: currentStation.station_name,
        scheduled_departure: currentStation.departure,
        actual_departure:
          currentStation.departure !== '--:--'
            ? `${currentStation.departure} (+${delayMinutes}m)`
            : '--:--',
        stop_number: currentStation.stop_number,
      },
      next_upcoming_station: {
        code: nextStation.station_code,
        name: nextStation.station_name,
        scheduled_arrival: nextStation.arrival,
        expected_arrival:
          nextStation.arrival !== '--:--'
            ? `${nextStation.arrival} (+${delayMinutes}m)`
            : '--:--',
        distance_from_origin_km: nextStation.distance_km,
        platform: nextStation.platform || 1,
      },
      journey_progress: {
        distance_covered_km: distanceCovered,
        distance_remaining_km: distanceRemaining,
        total_distance_km: totalDistance,
        percentage_completed:
          totalDistance > 0 ? Math.round((distanceCovered / totalDistance) * 1000) / 10 : 0,
      },
    },
    source: `${train.source.name} (${train.source.code})`,
    destination: `${train.destination.name} (${train.destination.code})`,
    last_updated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

export function getStationInfoClient(query: string): StationInfoResult {
  const clean = query?.trim();
  if (!clean) {
    return { success: false, error: 'Station code or name cannot be empty.' };
  }

  const station = resolveStation(clean);
  if (!station) {
    return {
      success: false,
      error: `Station '${clean}' could not be identified.`,
      suggestion: 'Known stations include: SBC, KCG, SC, NDLS, MAS, MMCT, BSB.',
    };
  }

  const stnCode = station.code;
  const passing: NonNullable<StationInfoResult['trains']> = [];

  for (const train of TRAINS) {
    for (const stop of train.route) {
      if (stop.station_code === stnCode) {
        const isOrigin = stop.stop_number === 1;
        const isDestination = stop.stop_number === train.route.length;
        const role = isOrigin ? 'Originating' : isDestination ? 'Terminating' : 'Halt / Transit';

        passing.push({
          train_number: train.train_number,
          train_name: train.train_name,
          train_type: train.train_type,
          role_at_station: role,
          platform: stop.platform || 1,
          arrival: stop.arrival,
          departure: stop.departure,
          halt_minutes: stop.halt_minutes,
          route_summary: `${train.source.code} -> ${train.destination.code}`,
          running_days: train.running_days,
        });
        break;
      }
    }
  }

  passing.sort((a, b) => {
    const timeA = a.departure !== '--:--' ? a.departure : a.arrival;
    const timeB = b.departure !== '--:--' ? b.departure : b.arrival;
    return timeA.localeCompare(timeB);
  });

  return {
    success: true,
    station_code: station.code,
    station_name: station.name,
    city: station.city,
    state: station.state,
    railway_zone: station.zone || 'Indian Railways',
    aliases: station.aliases || [],
    total_passing_trains: passing.length,
    trains: passing,
  };
}

export function checkSeatAvailabilityClient(
  trainNumber: string,
  dateStr: string = 'tomorrow',
  classType: string = '3A'
): SeatAvailabilityResult {
  const cleanNum = trainNumber?.trim();
  if (!cleanNum) {
    return { success: false, error: 'Train number cannot be empty.' };
  }

  const train = TRAINS.find((t) => t.train_number === cleanNum);
  if (!train) {
    return { success: false, error: `Train number '${cleanNum}' not found.` };
  }

  const parsed = parseDate(dateStr) || { formatted: new Date().toISOString().slice(0, 10) };
  const normClass = classType.trim().toUpperCase();

  if (!train.classes.includes(normClass)) {
    return {
      success: false,
      error: `Class '${normClass}' is not offered on ${train.train_name} (${cleanNum}).`,
      available_classes_for_train: train.classes,
    };
  }

  const hash = getDeterministicHash(`${cleanNum}-${parsed.formatted}-${normClass}`);
  const bucket = hash % 100;

  let statusCode = '';
  let category: 'AVAILABLE' | 'RAC' | 'WAITLIST' = 'AVAILABLE';
  let confirmationProb = 100;
  let statusMsg = '';

  if (bucket < 55) {
    const seats = 4 + (hash % 78);
    statusCode = `AVAILABLE-${String(seats).padStart(2, '0')}`;
    category = 'AVAILABLE';
    confirmationProb = 100;
    statusMsg = `${seats} seats currently available for booking.`;
  } else if (bucket < 80) {
    const rac = 1 + (hash % 35);
    statusCode = `RAC ${rac}`;
    category = 'RAC';
    confirmationProb = Math.max(60, 95 - rac);
    statusMsg = `Reservation Against Cancellation (RAC ${rac}). High chance of berth confirmation.`;
  } else {
    const wl = 1 + (hash % 45);
    statusCode = `GNWL ${wl} / WL ${wl}`;
    category = 'WAITLIST';
    confirmationProb = Math.max(15, 80 - wl * 2);
    statusMsg = `General Waitlist (WL ${wl}). Confirmation probability approx ${confirmationProb}%.`;
  }

  const fareMultipliers: Record<string, number> = {
    '1A': 3.4,
    '2A': 2.1,
    '3A': 1.5,
    '3E': 1.35,
    'EC': 2.8,
    'CC': 1.45,
    'SL': 0.55,
    '2S': 0.28,
  };
  const multiplier = fareMultipliers[normClass] || 1.2;
  const fare = Math.round(train.distance_km * multiplier + 60);

  return {
    success: true,
    train_number: train.train_number,
    train_name: train.train_name,
    journey_date: parsed.formatted,
    class_code: normClass,
    quota: 'General (GN)',
    availability_status: statusCode,
    category,
    confirmation_probability_percentage: confirmationProb,
    status_detail: statusMsg,
    estimated_fare_inr: `₹${fare}`,
    classes_offered_by_train: train.classes,
    origin: `${train.source.name} (${train.source.code})`,
    destination: `${train.destination.name} (${train.destination.code})`,
  };
}

const QUOTAS = ['General (GN)', 'Tatkal (TQ)', 'Ladies (LD)', 'Senior Citizen (SS)'];
const BERTH_TYPES = [
  'Lower Berth (LB)',
  'Middle Berth (MB)',
  'Upper Berth (UB)',
  'Side Lower (SL)',
  'Side Upper (SU)',
];

export function getPnrStatusClient(pnrNumber: string) {
  const clean = pnrNumber ? pnrNumber.trim().replace(/[- ]/g, '') : '';
  if (!clean) {
    return {
      success: false,
      error: 'PNR number cannot be empty. Please enter a 10-digit PNR number.',
    };
  }

  if (clean.length !== 10 || !/^\d+$/.test(clean)) {
    return {
      success: false,
      error: `Invalid PNR format: '${pnrNumber}'. PNR must be exactly 10 numeric digits.`,
      suggestion: "Sample test PNRs: '4231892011' (Confirmed), '6521908432' (RAC), '8109234512' (Waitlist).",
    };
  }

  const hash = getDeterministicHash(clean);
  const train = TRAINS[hash % TRAINS.length];
  const quota = QUOTAS[Math.floor(hash / 10) % QUOTAS.length];
  const chartPrepared = hash % 10 < 4;
  const chartStatus = chartPrepared ? 'CHART PREPARED' : 'CHART NOT PREPARED';

  const numPassengers = 1 + (Math.floor(hash / 100) % 3);
  const classCode = train.classes[Math.floor(hash / 7) % train.classes.length] || '3A';

  const scenario = hash % 100;
  let overallCategory: 'CONFIRMED' | 'RAC' | 'WAITLISTED' = 'CONFIRMED';
  let confirmationProb = 100;
  let overallStatusText = 'Confirmed';

  if (scenario < 50) {
    overallCategory = 'CONFIRMED';
    confirmationProb = 100;
    overallStatusText = 'Confirmed';
  } else if (scenario < 75) {
    overallCategory = 'RAC';
    const racNo = 1 + (hash % 18);
    confirmationProb = Math.max(65, 96 - racNo * 2);
    overallStatusText = `RAC ${racNo}`;
  } else {
    overallCategory = 'WAITLISTED';
    const wlNo = 1 + (hash % 35);
    confirmationProb = Math.max(20, 85 - wlNo * 2);
    overallStatusText = `WL ${wlNo}`;
  }

  const coachPrefix =
    classCode === '3A'
      ? 'B'
      : classCode === '2A'
      ? 'A'
      : classCode === '1A'
      ? 'H'
      : classCode === 'CC'
      ? 'C'
      : 'S';

  const passengers = [];
  for (let i = 1; i <= numPassengers; i++) {
    const pHash = hash + i * 37;
    const berthNo = 1 + (pHash % 64);
    const coachNo = `${coachPrefix}${1 + (pHash % 6)}`;
    const berthType = BERTH_TYPES[pHash % BERTH_TYPES.length];

    let bookingStatus = '';
    let currentStatus = '';
    let coach = '';
    let berth: number | null = null;
    let bType = '';

    if (overallCategory === 'CONFIRMED') {
      bookingStatus = 'CNF';
      currentStatus = 'CNF';
      coach = coachNo;
      berth = berthNo;
      bType = berthType;
    } else if (overallCategory === 'RAC') {
      const pRac = (hash % 15) + i;
      bookingStatus = `RAC ${pRac + 4}`;
      currentStatus = `RAC ${pRac}`;
      coach = chartPrepared ? coachNo : 'To be allotted';
      berth = chartPrepared ? berthNo : null;
      bType = chartPrepared ? 'Side Lower (RAC)' : 'Allotted at charting';
    } else {
      const pWl = (hash % 25) + i;
      bookingStatus = `GNWL ${pWl + 12}`;
      currentStatus = `GNWL ${pWl}`;
      coach = 'None';
      berth = null;
      bType = 'No Berth (Waitlisted)';
    }

    passengers.push({
      passenger_number: i,
      booking_status: bookingStatus,
      current_status: currentStatus,
      coach,
      berth_number: berth,
      berth_type: bType,
      confirmation_probability: overallCategory !== 'CONFIRMED' ? confirmationProb : 100,
    });
  }

  return {
    success: true,
    pnr_number: clean,
    train_number: train.train_number,
    train_name: train.train_name,
    train_type: train.train_type,
    booking_date: '2026-10-20',
    journey_date: '2026-10-28',
    class_code: classCode,
    passenger_quota: quota,
    chart_status: chartStatus,
    overall_status: overallStatusText,
    overall_category: overallCategory,
    confirmation_probability_percentage: confirmationProb,
    boarding_station: {
      code: train.source.code,
      name: train.source.name,
      departure_time: train.departure_time,
    },
    destination_station: {
      code: train.destination.code,
      name: train.destination.name,
      arrival_time: train.arrival_time,
    },
    total_passengers: passengers.length,
    passengers,
  };
}
