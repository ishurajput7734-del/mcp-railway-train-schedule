import { Station, Train } from '../types/railway';

export const STATIONS: Station[] = [
  {
    code: "SBC",
    name: "KSR Bengaluru City Junction",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "South Western Railway (SWR)",
    aliases: ["bengaluru", "bangalore", "ksr bengaluru", "bangalore city", "sbc"]
  },
  {
    code: "YPR",
    name: "Yesvantpur Junction",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "South Western Railway (SWR)",
    aliases: ["yesvantpur", "yeshvantpur", "ypr", "bengaluru", "bangalore"]
  },
  {
    code: "SMVB",
    name: "Sir M. Visvesvaraya Terminal Bengaluru",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "South Western Railway (SWR)",
    aliases: ["smvb", "smvt bengaluru", "baiyyappanahalli", "bengaluru", "bangalore"]
  },
  {
    code: "KCG",
    name: "Kacheguda",
    city: "Hyderabad",
    state: "Telangana",
    zone: "South Central Railway (SCR)",
    aliases: ["kacheguda", "hyderabad", "kcg"]
  },
  {
    code: "SC",
    name: "Secunderabad Junction",
    city: "Hyderabad",
    state: "Telangana",
    zone: "South Central Railway (SCR)",
    aliases: ["secunderabad", "hyderabad", "sc"]
  },
  {
    code: "HYB",
    name: "Hyderabad Deccan Nampally",
    city: "Hyderabad",
    state: "Telangana",
    zone: "South Central Railway (SCR)",
    aliases: ["nampally", "hyderabad deccan", "hyb", "hyderabad"]
  },
  {
    code: "MAS",
    name: "MGR Chennai Central",
    city: "Chennai",
    state: "Tamil Nadu",
    zone: "Southern Railway (SR)",
    aliases: ["chennai", "chennai central", "mgr chennai", "madras", "mas"]
  },
  {
    code: "MYS",
    name: "Mysuru Junction",
    city: "Mysuru",
    state: "Karnataka",
    zone: "South Western Railway (SWR)",
    aliases: ["mysuru", "mysore", "mys"]
  },
  {
    code: "NDLS",
    name: "New Delhi",
    city: "Delhi",
    state: "Delhi",
    zone: "Northern Railway (NR)",
    aliases: ["new delhi", "delhi", "ndls"]
  },
  {
    code: "NZM",
    name: "Hazrat Nizamuddin",
    city: "Delhi",
    state: "Delhi",
    zone: "Northern Railway (NR)",
    aliases: ["hazrat nizamuddin", "nizamuddin", "delhi", "nzm"]
  },
  {
    code: "MMCT",
    name: "Mumbai Central",
    city: "Mumbai",
    state: "Maharashtra",
    zone: "Western Railway (WR)",
    aliases: ["mumbai central", "mumbai", "bombay", "mmct", "bct"]
  },
  {
    code: "CSMT",
    name: "Chhatrapati Shivaji Maharaj Terminus",
    city: "Mumbai",
    state: "Maharashtra",
    zone: "Central Railway (CR)",
    aliases: ["csmt", "cst", "mumbai csmt", "mumbai", "bombay vt"]
  },
  {
    code: "HWH",
    name: "Howrah Junction",
    city: "Kolkata",
    state: "West Bengal",
    zone: "Eastern Railway (ER)",
    aliases: ["howrah", "kolkata", "calcutta", "hwh"]
  },
  {
    code: "BSB",
    name: "Varanasi Junction",
    city: "Varanasi",
    state: "Uttar Pradesh",
    zone: "Northern Railway (NR)",
    aliases: ["varanasi", "banaras", "kashi", "bsb"]
  },
  {
    code: "ADI",
    name: "Ahmedabad Junction",
    city: "Ahmedabad",
    state: "Gujarat",
    zone: "Western Railway (WR)",
    aliases: ["ahmedabad", "amdavad", "adi"]
  },
  {
    code: "TPTY",
    name: "Tirupati",
    city: "Tirupati",
    state: "Andhra Pradesh",
    zone: "South Central Railway (SCR)",
    aliases: ["tirupati", "tpty"]
  },
  {
    code: "KRNT",
    name: "Kurnool City",
    city: "Kurnool",
    state: "Andhra Pradesh",
    zone: "South Central Railway (SCR)",
    aliases: ["kurnool", "kurnool city", "krnt"]
  },
  {
    code: "DHNE",
    name: "Dhone Junction",
    city: "Dhone",
    state: "Andhra Pradesh",
    zone: "South Central Railway (SCR)",
    aliases: ["dhone", "dhne"]
  },
  {
    code: "GTL",
    name: "Guntakal Junction",
    city: "Guntakal",
    state: "Andhra Pradesh",
    zone: "South Central Railway (SCR)",
    aliases: ["guntakal", "gtl"]
  },
  {
    code: "ATP",
    name: "Anantapur",
    city: "Anantapur",
    state: "Andhra Pradesh",
    zone: "South Central Railway (SCR)",
    aliases: ["anantapur", "atp"]
  },
  {
    code: "DMM",
    name: "Dharmavaram Junction",
    city: "Dharmavaram",
    state: "Andhra Pradesh",
    zone: "South Western Railway (SWR)",
    aliases: ["dharmavaram", "dmm"]
  },
  {
    code: "HUP",
    name: "Hindupur",
    city: "Hindupur",
    state: "Andhra Pradesh",
    zone: "South Western Railway (SWR)",
    aliases: ["hindupur", "hup"]
  },
  {
    code: "YNK",
    name: "Yelahanka Junction",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "South Western Railway (SWR)",
    aliases: ["yelahanka", "ynk"]
  },
  {
    code: "KPD",
    name: "Katpadi Junction",
    city: "Vellore",
    state: "Tamil Nadu",
    zone: "Southern Railway (SR)",
    aliases: ["katpadi", "vellore", "kpd"]
  },
  {
    code: "AJJ",
    name: "Arakkonam Junction",
    city: "Arakkonam",
    state: "Tamil Nadu",
    zone: "Southern Railway (SR)",
    aliases: ["arakkonam", "ajj"]
  },
  {
    code: "KJM",
    name: "Krishnarajapuram",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "South Western Railway (SWR)",
    aliases: ["krishnarajapuram", "kjm", "k r puram"]
  },
  {
    code: "BWT",
    name: "Bangarapet Junction",
    city: "Bangarapet",
    state: "Karnataka",
    zone: "South Western Railway (SWR)",
    aliases: ["bangarapet", "bwt"]
  },
  {
    code: "BPL",
    name: "Bhopal Junction",
    city: "Bhopal",
    state: "Madhya Pradesh",
    zone: "West Central Railway (WCR)",
    aliases: ["bhopal", "bpl"]
  },
  {
    code: "VGLJ",
    name: "Virangana Lakshmibai Jhansi",
    city: "Jhansi",
    state: "Uttar Pradesh",
    zone: "North Central Railway (NCR)",
    aliases: ["jhansi", "vglj", "virangana lakshmibai"]
  },
  {
    code: "GWL",
    name: "Gwalior Junction",
    city: "Gwalior",
    state: "Madhya Pradesh",
    zone: "North Central Railway (NCR)",
    aliases: ["gwalior", "gwl"]
  },
  {
    code: "AGC",
    name: "Agra Cantt",
    city: "Agra",
    state: "Uttar Pradesh",
    zone: "North Central Railway (NCR)",
    aliases: ["agra", "agra cantt", "agc"]
  },
  {
    code: "ST",
    name: "Surat",
    city: "Surat",
    state: "Gujarat",
    zone: "Western Railway (WR)",
    aliases: ["surat", "st"]
  },
  {
    code: "BRC",
    name: "Vadodara Junction",
    city: "Vadodara",
    state: "Gujarat",
    zone: "Western Railway (WR)",
    aliases: ["vadodara", "baroda", "brc"]
  },
  {
    code: "RTM",
    name: "Ratlam Junction",
    city: "Ratlam",
    state: "Madhya Pradesh",
    zone: "Western Railway (WR)",
    aliases: ["ratlam", "rtm"]
  },
  {
    code: "KOTA",
    name: "Kota Junction",
    city: "Kota",
    state: "Rajasthan",
    zone: "West Central Railway (WCR)",
    aliases: ["kota", "kota jn"]
  },
  {
    code: "CNB",
    name: "Kanpur Central",
    city: "Kanpur",
    state: "Uttar Pradesh",
    zone: "North Central Railway (NCR)",
    aliases: ["kanpur", "kanpur central", "cnb"]
  },
  {
    code: "PRYJ",
    name: "Prayagraj Junction",
    city: "Prayagraj",
    state: "Uttar Pradesh",
    zone: "North Central Railway (NCR)",
    aliases: ["prayagraj", "allahabad", "pryj"]
  },
  {
    code: "DDU",
    name: "Pt. Deen Dayal Upadhyaya Junction",
    city: "Mughalsarai",
    state: "Uttar Pradesh",
    zone: "East Central Railway (ECR)",
    aliases: ["mughalsarai", "ddu", "deen dayal upadhyaya"]
  },
  {
    code: "DNR",
    name: "Danapur",
    city: "Patna",
    state: "Bihar",
    zone: "East Central Railway (ECR)",
    aliases: ["danapur", "patna", "dnr"]
  }
];

export const TRAINS: Train[] = [
  {
    train_number: "12785",
    train_name: "Kacheguda Superfast Express",
    train_type: "Superfast Express",
    source: { code: "KCG", name: "Kacheguda", city: "Hyderabad" },
    destination: { code: "SBC", name: "KSR Bengaluru", city: "Bengaluru" },
    departure_time: "19:05",
    arrival_time: "06:25",
    duration: "11h 20m",
    running_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["1A", "2A", "3A", "SL"],
    pantry: false,
    distance_km: 622,
    route: [
      { stop_number: 1, station_code: "KCG", station_name: "Kacheguda", arrival: "--:--", departure: "19:05", halt_minutes: 0, distance_km: 0, day_count: 1, platform: 1 },
      { stop_number: 2, station_code: "KRNT", station_name: "Kurnool City", arrival: "22:28", departure: "22:30", halt_minutes: 2, distance_km: 236, day_count: 1, platform: 2 },
      { stop_number: 3, station_code: "DHNE", station_name: "Dhone Junction", arrival: "23:40", departure: "23:45", halt_minutes: 5, distance_km: 290, day_count: 1, platform: 1 },
      { stop_number: 4, station_code: "GTL", station_name: "Guntakal Junction", arrival: "00:55", departure: "01:00", halt_minutes: 5, distance_km: 358, day_count: 2, platform: 3 },
      { stop_number: 5, station_code: "ATP", station_name: "Anantapur", arrival: "02:08", departure: "02:10", halt_minutes: 2, distance_km: 426, day_count: 2, platform: 1 },
      { stop_number: 6, station_code: "DMM", station_name: "Dharmavaram Junction", arrival: "03:00", departure: "03:05", halt_minutes: 5, distance_km: 460, day_count: 2, platform: 2 },
      { stop_number: 7, station_code: "HUP", station_name: "Hindupur", arrival: "04:08", departure: "04:10", halt_minutes: 2, distance_km: 539, day_count: 2, platform: 1 },
      { stop_number: 8, station_code: "YNK", station_name: "Yelahanka Junction", arrival: "05:28", departure: "05:30", halt_minutes: 2, distance_km: 605, day_count: 2, platform: 4 },
      { stop_number: 9, station_code: "SBC", station_name: "KSR Bengaluru", arrival: "06:25", departure: "--:--", halt_minutes: 0, distance_km: 622, day_count: 2, platform: 5 }
    ]
  },
  {
    train_number: "12786",
    train_name: "Kacheguda Superfast Express",
    train_type: "Superfast Express",
    source: { code: "SBC", name: "KSR Bengaluru", city: "Bengaluru" },
    destination: { code: "KCG", name: "Kacheguda", city: "Hyderabad" },
    departure_time: "18:20",
    arrival_time: "05:40",
    duration: "11h 20m",
    running_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["1A", "2A", "3A", "SL"],
    pantry: false,
    distance_km: 622,
    route: [
      { stop_number: 1, station_code: "SBC", station_name: "KSR Bengaluru", arrival: "--:--", departure: "18:20", halt_minutes: 0, distance_km: 0, day_count: 1, platform: 5 },
      { stop_number: 2, station_code: "YNK", station_name: "Yelahanka Junction", arrival: "18:50", departure: "18:52", halt_minutes: 2, distance_km: 17, day_count: 1, platform: 3 },
      { stop_number: 3, station_code: "HUP", station_name: "Hindupur", arrival: "20:00", departure: "20:02", halt_minutes: 2, distance_km: 83, day_count: 1, platform: 2 },
      { stop_number: 4, station_code: "DMM", station_name: "Dharmavaram Junction", arrival: "21:40", departure: "21:45", halt_minutes: 5, distance_km: 162, day_count: 1, platform: 1 },
      { stop_number: 5, station_code: "ATP", station_name: "Anantapur", arrival: "22:18", departure: "22:20", halt_minutes: 2, distance_km: 196, day_count: 1, platform: 2 },
      { stop_number: 6, station_code: "GTL", station_name: "Guntakal Junction", arrival: "23:45", departure: "23:50", halt_minutes: 5, distance_km: 264, day_count: 1, platform: 4 },
      { stop_number: 7, station_code: "DHNE", station_name: "Dhone Junction", arrival: "01:05", departure: "01:10", halt_minutes: 5, distance_km: 332, day_count: 2, platform: 2 },
      { stop_number: 8, station_code: "KRNT", station_name: "Kurnool City", arrival: "02:08", departure: "02:10", halt_minutes: 2, distance_km: 386, day_count: 2, platform: 1 },
      { stop_number: 9, station_code: "KCG", station_name: "Kacheguda", arrival: "05:40", departure: "--:--", halt_minutes: 0, distance_km: 622, day_count: 2, platform: 1 }
    ]
  },
  {
    train_number: "20703",
    train_name: "Kacheguda - Yesvantpur Vande Bharat Express",
    train_type: "Vande Bharat Express",
    source: { code: "KCG", name: "Kacheguda", city: "Hyderabad" },
    destination: { code: "YPR", name: "Yesvantpur Junction", city: "Bengaluru" },
    departure_time: "05:30",
    arrival_time: "14:00",
    duration: "8h 30m",
    running_days: ["Mon", "Tue", "Thu", "Fri", "Sat", "Sun"],
    classes: ["CC", "EC"],
    pantry: true,
    distance_km: 618,
    route: [
      { stop_number: 1, station_code: "KCG", station_name: "Kacheguda", arrival: "--:--", departure: "05:30", halt_minutes: 0, distance_km: 0, day_count: 1, platform: 3 },
      { stop_number: 2, station_code: "KRNT", station_name: "Kurnool City", arrival: "08:18", departure: "08:20", halt_minutes: 2, distance_km: 236, day_count: 1, platform: 1 },
      { stop_number: 3, station_code: "ATP", station_name: "Anantapur", arrival: "10:10", departure: "10:12", halt_minutes: 2, distance_km: 426, day_count: 1, platform: 2 },
      { stop_number: 4, station_code: "DMM", station_name: "Dharmavaram Junction", arrival: "10:50", departure: "10:52", halt_minutes: 2, distance_km: 460, day_count: 1, platform: 1 },
      { stop_number: 5, station_code: "YPR", station_name: "Yesvantpur Junction", arrival: "14:00", departure: "--:--", halt_minutes: 0, distance_km: 618, day_count: 1, platform: 1 }
    ]
  },
  {
    train_number: "20704",
    train_name: "Yesvantpur - Kacheguda Vande Bharat Express",
    train_type: "Vande Bharat Express",
    source: { code: "YPR", name: "Yesvantpur Junction", city: "Bengaluru" },
    destination: { code: "KCG", name: "Kacheguda", city: "Hyderabad" },
    departure_time: "14:45",
    arrival_time: "23:15",
    duration: "8h 30m",
    running_days: ["Mon", "Tue", "Thu", "Fri", "Sat", "Sun"],
    classes: ["CC", "EC"],
    pantry: true,
    distance_km: 618,
    route: [
      { stop_number: 1, station_code: "YPR", station_name: "Yesvantpur Junction", arrival: "--:--", departure: "14:45", halt_minutes: 0, distance_km: 0, day_count: 1, platform: 1 },
      { stop_number: 2, station_code: "DMM", station_name: "Dharmavaram Junction", arrival: "17:40", departure: "17:42", halt_minutes: 2, distance_km: 158, day_count: 1, platform: 2 },
      { stop_number: 3, station_code: "ATP", station_name: "Anantapur", arrival: "18:15", departure: "18:17", halt_minutes: 2, distance_km: 192, day_count: 1, platform: 1 },
      { stop_number: 4, station_code: "KRNT", station_name: "Kurnool City", arrival: "20:08", departure: "20:10", halt_minutes: 2, distance_km: 382, day_count: 1, platform: 2 },
      { stop_number: 5, station_code: "KCG", station_name: "Kacheguda", arrival: "23:15", departure: "--:--", halt_minutes: 0, distance_km: 618, day_count: 1, platform: 2 }
    ]
  },
  {
    train_number: "22691",
    train_name: "Bengaluru Rajdhani Express",
    train_type: "Rajdhani Express",
    source: { code: "SBC", name: "KSR Bengaluru", city: "Bengaluru" },
    destination: { code: "NZM", name: "Hazrat Nizamuddin", city: "Delhi" },
    departure_time: "20:00",
    arrival_time: "05:30",
    duration: "33h 30m",
    running_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["1A", "2A", "3A"],
    pantry: true,
    distance_km: 2365,
    route: [
      { stop_number: 1, station_code: "SBC", station_name: "KSR Bengaluru", arrival: "--:--", departure: "20:00", halt_minutes: 0, distance_km: 0, day_count: 1, platform: 8 },
      { stop_number: 2, station_code: "DMM", station_name: "Dharmavaram Junction", arrival: "22:58", departure: "23:00", halt_minutes: 2, distance_km: 176, day_count: 1, platform: 1 },
      { stop_number: 3, station_code: "ATP", station_name: "Anantapur", arrival: "23:28", departure: "23:30", halt_minutes: 2, distance_km: 209, day_count: 1, platform: 2 },
      { stop_number: 4, station_code: "GTL", station_name: "Guntakal Junction", arrival: "00:45", departure: "00:50", halt_minutes: 5, distance_km: 277, day_count: 2, platform: 1 },
      { stop_number: 5, station_code: "SC", station_name: "Secunderabad Junction", arrival: "07:05", departure: "07:15", halt_minutes: 10, distance_km: 687, day_count: 2, platform: 10 },
      { stop_number: 6, station_code: "BPL", station_name: "Bhopal Junction", arrival: "19:00", departure: "19:10", halt_minutes: 10, distance_km: 1662, day_count: 2, platform: 2 },
      { stop_number: 7, station_code: "VGLJ", station_name: "Virangana Lakshmibai Jhansi", arrival: "22:20", departure: "22:28", halt_minutes: 8, distance_km: 1954, day_count: 2, platform: 5 },
      { stop_number: 8, station_code: "GWL", station_name: "Gwalior Junction", arrival: "23:28", departure: "23:30", halt_minutes: 2, distance_km: 2051, day_count: 2, platform: 2 },
      { stop_number: 9, station_code: "AGC", station_name: "Agra Cantt", arrival: "00:48", departure: "00:50", halt_minutes: 2, distance_km: 2169, day_count: 3, platform: 2 },
      { stop_number: 10, station_code: "NZM", station_name: "Hazrat Nizamuddin", arrival: "05:30", departure: "--:--", halt_minutes: 0, distance_km: 2365, day_count: 3, platform: 1 }
    ]
  },
  {
    train_number: "12007",
    train_name: "Chennai - Mysuru Shatabdi Express",
    train_type: "Shatabdi Express",
    source: { code: "MAS", name: "MGR Chennai Central", city: "Chennai" },
    destination: { code: "MYS", name: "Mysuru Junction", city: "Mysuru" },
    departure_time: "06:00",
    arrival_time: "13:00",
    duration: "7h 00m",
    running_days: ["Mon", "Tue", "Wed", "Fri", "Sat", "Sun"],
    classes: ["CC", "EC"],
    pantry: true,
    distance_km: 497,
    route: [
      { stop_number: 1, station_code: "MAS", station_name: "MGR Chennai Central", arrival: "--:--", departure: "06:00", halt_minutes: 0, distance_km: 0, day_count: 1, platform: 2 },
      { stop_number: 2, station_code: "KPD", station_name: "Katpadi Junction", arrival: "07:38", departure: "07:40", halt_minutes: 2, distance_km: 130, day_count: 1, platform: 1 },
      { stop_number: 3, station_code: "SBC", station_name: "KSR Bengaluru", arrival: "10:45", departure: "10:50", halt_minutes: 5, distance_km: 359, day_count: 1, platform: 7 },
      { stop_number: 4, station_code: "MYS", station_name: "Mysuru Junction", arrival: "13:00", departure: "--:--", halt_minutes: 0, distance_km: 497, day_count: 1, platform: 1 }
    ]
  },
  {
    train_number: "12608",
    train_name: "Lalbagh Superfast Express",
    train_type: "Superfast Express",
    source: { code: "SBC", name: "KSR Bengaluru", city: "Bengaluru" },
    destination: { code: "MAS", name: "MGR Chennai Central", city: "Chennai" },
    departure_time: "06:20",
    arrival_time: "12:15",
    duration: "5h 55m",
    running_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["CC", "2S"],
    pantry: false,
    distance_km: 359,
    route: [
      { stop_number: 1, station_code: "SBC", station_name: "KSR Bengaluru", arrival: "--:--", departure: "06:20", halt_minutes: 0, distance_km: 0, day_count: 1, platform: 3 },
      { stop_number: 2, station_code: "KJM", station_name: "Krishnarajapuram", arrival: "06:34", departure: "06:35", halt_minutes: 1, distance_km: 14, day_count: 1, platform: 2 },
      { stop_number: 3, station_code: "BWT", station_name: "Bangarapet Junction", arrival: "07:18", departure: "07:20", halt_minutes: 2, distance_km: 70, day_count: 1, platform: 4 },
      { stop_number: 4, station_code: "KPD", station_name: "Katpadi Junction", arrival: "09:43", departure: "09:45", halt_minutes: 2, distance_km: 229, day_count: 1, platform: 2 },
      { stop_number: 5, station_code: "AJJ", station_name: "Arakkonam Junction", arrival: "10:33", departure: "10:35", halt_minutes: 2, distance_km: 290, day_count: 1, platform: 2 },
      { stop_number: 6, station_code: "MAS", station_name: "MGR Chennai Central", arrival: "12:15", departure: "--:--", halt_minutes: 0, distance_km: 359, day_count: 1, platform: 4 }
    ]
  },
  {
    train_number: "12951",
    train_name: "Mumbai Central - New Delhi Tejas Rajdhani Express",
    train_type: "Tejas Rajdhani Express",
    source: { code: "MMCT", name: "Mumbai Central", city: "Mumbai" },
    destination: { code: "NDLS", name: "New Delhi", city: "Delhi" },
    departure_time: "17:00",
    arrival_time: "08:32",
    duration: "15h 32m",
    running_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["1A", "2A", "3A"],
    pantry: true,
    distance_km: 1386,
    route: [
      { stop_number: 1, station_code: "MMCT", station_name: "Mumbai Central", arrival: "--:--", departure: "17:00", halt_minutes: 0, distance_km: 0, day_count: 1, platform: 1 },
      { stop_number: 2, station_code: "ST", station_name: "Surat", arrival: "19:43", departure: "19:48", halt_minutes: 5, distance_km: 263, day_count: 1, platform: 1 },
      { stop_number: 3, station_code: "BRC", station_name: "Vadodara Junction", arrival: "21:06", departure: "21:16", halt_minutes: 10, distance_km: 393, day_count: 1, platform: 2 },
      { stop_number: 4, station_code: "RTM", station_name: "Ratlam Junction", arrival: "00:25", departure: "00:28", halt_minutes: 3, distance_km: 653, day_count: 2, platform: 5 },
      { stop_number: 5, station_code: "KOTA", station_name: "Kota Junction", arrival: "03:15", departure: "03:20", halt_minutes: 5, distance_km: 920, day_count: 2, platform: 1 },
      { stop_number: 6, station_code: "NDLS", station_name: "New Delhi", arrival: "08:32", departure: "--:--", halt_minutes: 0, distance_km: 1386, day_count: 2, platform: 2 }
    ]
  },
  {
    train_number: "22436",
    train_name: "New Delhi - Varanasi Vande Bharat Express",
    train_type: "Vande Bharat Express",
    source: { code: "NDLS", name: "New Delhi", city: "Delhi" },
    destination: { code: "BSB", name: "Varanasi Junction", city: "Varanasi" },
    departure_time: "06:00",
    arrival_time: "14:00",
    duration: "8h 00m",
    running_days: ["Tue", "Wed", "Fri", "Sat", "Sun"],
    classes: ["CC", "EC"],
    pantry: true,
    distance_km: 759,
    route: [
      { stop_number: 1, station_code: "NDLS", station_name: "New Delhi", arrival: "--:--", departure: "06:00", halt_minutes: 0, distance_km: 0, day_count: 1, platform: 16 },
      { stop_number: 2, station_code: "CNB", station_name: "Kanpur Central", arrival: "10:08", departure: "10:10", halt_minutes: 2, distance_km: 440, day_count: 1, platform: 5 },
      { stop_number: 3, station_code: "PRYJ", station_name: "Prayagraj Junction", arrival: "12:08", departure: "12:10", halt_minutes: 2, distance_km: 634, day_count: 1, platform: 6 },
      { stop_number: 4, station_code: "BSB", station_name: "Varanasi Junction", arrival: "14:00", departure: "--:--", halt_minutes: 0, distance_km: 759, day_count: 1, platform: 1 }
    ]
  }
];
