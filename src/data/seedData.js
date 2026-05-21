/**
 * Offline canonical seed data. Used by the repos whenever Supabase is not
 * configured. Row-shaped (snake_case) so Model.fromRow() consumes it directly.
 * Mirrors supabase/seed.sql.
 */

export const SEED_PROJECTS = [
  { id: 1,  title: 'Solar Phone Charger',     category: 'Electronics', difficulty: 'Easy',   duration: '3–5 hours', description: 'Build a solar-powered USB charger using a 6V panel, USB module and basic breadboard wiring. No soldering required for the first 4 steps.', emoji: '⚡', color: 'teal-img',   creator_id: null, creator_name: 'Ahmad Khalil',   status: 'published', enrolled: 142, completion: 68, rating: 4.9, type: 'guided', step_count: 6 },
  { id: 2,  title: 'Smart Water Sensor',      category: 'Agriculture', difficulty: 'Medium', duration: '1–2 days',  description: 'Build a capacitive soil moisture sensor with an Arduino Nano that sends SMS alerts when water levels drop below threshold.', emoji: '🌱', color: 'amber-img',  creator_id: null, creator_name: 'Siti Rahimah',   status: 'published', enrolled: 98,  completion: 52, rating: 4.7, type: 'guided', step_count: 8 },
  { id: 3,  title: 'Recycled Wind Turbine',   category: 'Renewable',   difficulty: 'Easy',   duration: '1–2 hours', description: 'Construct a functional wind turbine from recycled plastic bottles and a DC motor. Learn about kinetic-to-electrical energy conversion.', emoji: '♻️', color: 'green-img',  creator_id: null, creator_name: 'David Anak Lee', status: 'published', enrolled: 76,  completion: 44, rating: 4.6, type: 'guided', step_count: 5 },
  { id: 4,  title: 'Arduino Plant Monitor',   category: 'Coding',      difficulty: 'Hard',   duration: '2+ weeks',  description: 'Full IoT project: soil sensor + DHT11 temp/humidity + OLED display + Blynk dashboard. All code provided with detailed explanations.', emoji: '🤖', color: 'purple-img', creator_id: null, creator_name: 'Ahmad Khalil',   status: 'published', enrolled: 203, completion: 31, rating: 4.8, type: 'guided', step_count: 10 },
  { id: 5,  title: 'Biogas Generator',        category: 'Agriculture', difficulty: 'Medium', duration: '1 week',    description: 'Build a small-scale biogas digester from recycled materials. Learn about anaerobic digestion and renewable energy from organic waste.', emoji: '🔬', color: 'green-img',  creator_id: null, creator_name: 'Liyana Binti',   status: 'published', enrolled: 55,  completion: 39, rating: 4.5, type: 'guided', step_count: 7 },
  { id: 6,  title: 'LED Circuit Board',       category: 'Electronics', difficulty: 'Easy',   duration: '1–2 hours', description: 'Master the fundamentals of circuit design: resistors, LEDs, breadboards and multimeters. The perfect first electronics project.', emoji: '💡', color: 'amber-img',  creator_id: null, creator_name: 'Ahmad Khalil',   status: 'published', enrolled: 188, completion: 89, rating: 5.0, type: 'guided', step_count: 4 },
  { id: 7,  title: 'Rain Gauge Station',      category: 'Agriculture', difficulty: 'Easy',   duration: '3–5 hours', description: 'Build a tipping-bucket rain gauge connected to an Arduino that logs rainfall data to a local SD card.', emoji: '🌧️', color: 'teal-img',   creator_id: null, creator_name: 'Nurul Hana',     status: 'published', enrolled: 44,  completion: 61, rating: 4.4, type: 'guided', step_count: 5 },
  { id: 8,  title: 'Hydroponics Controller',  category: 'Agriculture', difficulty: 'Hard',   duration: '2+ weeks',  description: 'Automated hydroponic system with pH sensor, nutrient pump control, grow lights on timer and real-time monitoring via web dashboard.', emoji: '🥬', color: 'green-img',  creator_id: null, creator_name: 'Kevin Jawa',     status: 'published', enrolled: 67,  completion: 28, rating: 4.6, type: 'guided', step_count: 9 },
  { id: 9,  title: 'Ultrasonic Distance Meter', category: 'Coding',    difficulty: 'Easy',   duration: '1–2 hours', description: 'Build a handheld distance meter using HC-SR04 ultrasonic sensor and a 16×2 LCD display. Great intro to sensors and I2C communication.', emoji: '📡', color: 'purple-img', creator_id: null, creator_name: 'Siti Rahimah',   status: 'published', enrolled: 91,  completion: 74, rating: 4.7, type: 'guided', step_count: 4 },
  { id: 10, title: 'Solar Water Heater',      category: 'Renewable',   difficulty: 'Medium', duration: '1 week',    description: 'Construct a passive solar water heating panel from copper pipe and recycled materials. Measure temperature rise with a DS18B20 sensor.', emoji: '☀️', color: 'amber-img',  creator_id: null, creator_name: 'David Anak Lee', status: 'published', enrolled: 38,  completion: 55, rating: 4.5, type: 'guided', step_count: 6 },
  { id: 11, title: 'Earthquake Detector',     category: 'Coding',      difficulty: 'Hard',   duration: '1–2 days',  description: 'Seismograph built with MPU-6050 accelerometer, SD logging and real-time FFT analysis. Data visualised using Processing on a PC.', emoji: '📳', color: 'red-img',    creator_id: null, creator_name: 'Ahmad Khalil',   status: 'published', enrolled: 29,  completion: 18, rating: 4.8, type: 'guided', step_count: 8 },
  { id: 12, title: 'Vertical Garden Planter', category: 'Agriculture', difficulty: 'Easy',   duration: '3–5 hours', description: 'Build a self-watering vertical garden from PVC pipes and recycled plastic bottles. Includes a simple drip-irrigation timer circuit.', emoji: '🌿', color: 'green-img',  creator_id: null, creator_name: 'Liyana Binti',   status: 'published', enrolled: 112, completion: 82, rating: 4.9, type: 'guided', step_count: 4 },
];

const P1_STEPS = [
  { project_id: 1, step_n: 1, title: 'Gather Materials',      instruction: 'Collect all materials listed below. Check each one off before proceeding.', tip: 'Ask your teacher for the solar panel from the STEM kit if you do not have one.', materials: [{ name: 'Solar panel (6V, 1W)' }, { name: 'USB charging module (TP4056)' }, { name: 'Multimeter' }, { name: 'Connecting wires', quantity: 4 }, { name: 'Breadboard (half-size)' }, { name: '9V battery (for testing)' }], xp: 20, video_url: null, proof_required: true },
  { project_id: 1, step_n: 2, title: 'Set Up Solar Panel',    instruction: 'Orient the solar panel facing a window or light source. Connect the red wire to the positive terminal and the black wire to the negative terminal. Secure the panel with the provided clips.', tip: 'Panels work best at a 30–45° angle toward the light source — like a ramp, not flat.', materials: [{ name: 'Solar panel' }, { name: 'Mounting clips' }, { name: 'Red wire' }, { name: 'Black wire' }], xp: 30, video_url: null, proof_required: true },
  { project_id: 1, step_n: 3, title: 'Wire the Circuit',      instruction: 'Insert the USB module into the breadboard. Connect column A (positive rail) to the IN+ pin on the module. Connect column B (negative rail) to IN−. Double-check using the circuit diagram image below.', tip: 'The breadboard power rails run the full length of each side. Red stripe = positive, Blue stripe = negative.', materials: [{ name: 'Breadboard' }, { name: 'USB module' }, { name: 'Connecting wires' }], xp: 40, video_url: null, proof_required: true },
  { project_id: 1, step_n: 4, title: 'Test Output Voltage',   instruction: 'Set your multimeter to DC voltage (20V range). Touch the red probe to OUT+ and black probe to OUT− on the USB module. Point the panel at a bright light source. A healthy reading is 4.8V–5.2V.', tip: 'If your reading is below 4V, check wire connections first. Shadows on even 10% of the panel can drop output by 50%.', materials: [{ name: 'Multimeter' }, { name: 'Completed circuit from Step 3' }], xp: 50, video_url: null, proof_required: true },
  { project_id: 1, step_n: 5, title: 'Solder Connections',    instruction: 'Once voltage is confirmed, solder the four wire connections for a permanent build. Apply flux, heat the pad for 2 seconds then feed solder. Good joints are shiny and cone-shaped.', tip: 'Keep the soldering iron tip clean with a damp sponge. Bad joints look dull and lumpy — reheat and re-flow.', materials: [{ name: 'Soldering iron' }, { name: 'Solder wire' }, { name: 'Flux paste' }, { name: 'Wire strippers' }], xp: 60, video_url: null, proof_required: true },
  { project_id: 1, step_n: 6, title: 'Final Assembly & Test', instruction: 'Enclose the circuit in the provided case or fabricate one from cardboard. Attach the solar panel to the lid. Connect a phone and verify charging starts within 10 seconds of placing in sunlight.', tip: 'A charging phone means success! Take your proof photo and submit to earn your completion certificate.', materials: [{ name: 'Project case or cardboard' }, { name: 'Hot glue or tape' }, { name: 'Completed circuit' }], xp: 80, video_url: null, proof_required: true },
];

export function placeholderSteps(projectId, count) {
  const out = [];
  for (let i = 1; i <= count; i++) {
    out.push({
      project_id: projectId, step_n: i, title: `Step ${i}`,
      instruction: `Follow the instructions for step ${i}. Detailed content for this project is coming soon.`,
      tip: null, materials: [], xp: 20 + 10 * (i - 1), video_url: null, proof_required: true,
    });
  }
  return out;
}

export const SEED_STEPS = SEED_PROJECTS.reduce((acc, p) => {
  acc[p.id] = p.id === 1 ? P1_STEPS : placeholderSteps(p.id, p.step_count);
  return acc;
}, {});

export const SEED_BADGES = [
  { code: 'first_build',      tier: 'bronze',    icon: '⚡', name: 'First Build',   description: 'Complete your first project step.' },
  { code: 'seven_day_streak', tier: 'bronze',    icon: '🔥', name: '7 Day Streak',  description: 'Log in 7 days in a row.' },
  { code: 'five_projects',    tier: 'silver',    icon: '🌿', name: '5 Projects',    description: 'Enrol in 5 different projects.' },
  { code: 'stem_explorer',    tier: 'silver',    icon: '🔬', name: 'STEM Explorer', description: 'Complete a project in 3 categories.' },
  { code: 'top_maker',        tier: 'gold',      icon: '🌟', name: 'Top Maker',     description: 'Reach the top 10 on the school leaderboard.' },
  { code: 'tvet_ready',       tier: 'legendary', icon: '🏆', name: 'TVET Ready',    description: 'Earn all category mastery certificates.' },
  { code: 'proof_photo',      tier: 'bronze',    icon: '📸', name: 'Proof Photo',   description: 'Submit your first proof photo.' },
  { code: 'lab_master',       tier: 'silver',    icon: '⚗️', name: 'Lab Master',    description: 'Complete 3 Electronics projects.' },
  { code: 'speed_builder',    tier: 'gold',      icon: '🚀', name: 'Speed Builder', description: 'Complete a project within 24 hours.' },
  { code: 'mastery',          tier: 'legendary', icon: '🎓', name: 'Mastery',       description: 'Achieve 100% on any project assessment.' },
  { code: 'team_player',      tier: 'bronze',    icon: '🤝', name: 'Team Player',   description: 'Collaborate on a group project.' },
  { code: 'global_rank',      tier: 'silver',    icon: '🌍', name: 'Global Rank',   description: 'Enter the Global top 100.' },
  { code: 'perfect_score',    tier: 'gold',      icon: '💯', name: 'Perfect Score', description: 'Get 100% on 5 step assessments.' },
  { code: 'explorer',         tier: 'bronze',    icon: '🗺️', name: 'Explorer',      description: 'Visit every category at least once.' },
  { code: 'science_star',     tier: 'silver',    icon: '🔭', name: 'Science Star',  description: 'Complete 3 Coding projects.' },
  { code: 'champion',         tier: 'legendary', icon: '👑', name: 'Champion',      description: 'Reach #1 on the Sarawak leaderboard.' },
];

/** Badge codes the offline demo learner has earned (first six). */
export const SEED_EARNED_CODES = ['first_build', 'seven_day_streak', 'five_projects', 'stem_explorer', 'top_maker', 'tvet_ready'];

/** Demo progress rows (no user_id; repos inject the current local user's id). */
export const SEED_DEMO_PROGRESS = [
  { project_id: 1, completed_step_numbers: [1, 2, 3],          xp_earned: 90,  last_step_at: null, is_bookmarked: false, is_manually_completed: false, step_proofs: {}, step_ratings: {} },
  { project_id: 2, completed_step_numbers: [1, 2, 3, 4, 5, 6], xp_earned: 270, last_step_at: null, is_bookmarked: false, is_manually_completed: false, step_proofs: {}, step_ratings: {} },
  { project_id: 3, completed_step_numbers: [1],                xp_earned: 20,  last_step_at: null, is_bookmarked: false, is_manually_completed: false, step_proofs: {}, step_ratings: {} },
  { project_id: 6, completed_step_numbers: [1, 2, 3, 4],       xp_earned: 140, last_step_at: null, is_bookmarked: false, is_manually_completed: false, step_proofs: {}, step_ratings: {} },
];

/** Offline demo creator's portfolio (mixed draft/review/published). */
export const SEED_CREATOR_PROJECTS = [
  { id: 1,  title: 'Solar Phone Charger',    category: 'Electronics', difficulty: 'Easy',   duration: '3–5 hours', description: 'Build a solar-powered USB charger using a 6V panel, USB module and basic breadboard wiring.', emoji: '⚡', color: 'teal-img',   creator_id: null, creator_name: 'Ahmad Khalil', status: 'published', enrolled: 142, completion: 68, rating: 4.9, type: 'guided', step_count: 6 },
  { id: 2,  title: 'Smart Water Sensor',     category: 'Agriculture', difficulty: 'Medium', duration: '1–2 days',  description: 'Capacitive soil moisture sensor with an Arduino Nano that sends SMS alerts.', emoji: '🌱', color: 'green-img',  creator_id: null, creator_name: 'Ahmad Khalil', status: 'published', enrolled: 98,  completion: 52, rating: 4.7, type: 'guided', step_count: 8 },
  { id: 3,  title: 'Biogas Generator',       category: 'Agriculture', difficulty: 'Medium', duration: '1 week',    description: 'Small-scale biogas digester from recycled materials.', emoji: '🔬', color: 'green-img',  creator_id: null, creator_name: 'Ahmad Khalil', status: 'review',    enrolled: 0,   completion: 0,  rating: 0,   type: 'guided', step_count: 7 },
  { id: 4,  title: 'Arduino Plant Monitor',  category: 'Coding',      difficulty: 'Hard',   duration: '2+ weeks',  description: 'Full IoT project: soil sensor + DHT11 + OLED + Blynk dashboard.', emoji: '🤖', color: 'purple-img', creator_id: null, creator_name: 'Ahmad Khalil', status: 'published', enrolled: 203, completion: 31, rating: 4.8, type: 'guided', step_count: 10 },
  { id: 5,  title: 'Wind Turbine Basics',    category: 'Renewable',   difficulty: 'Easy',   duration: '1–2 hours', description: 'Functional wind turbine from recycled bottles and a DC motor.', emoji: '♻️', color: 'green-img',  creator_id: null, creator_name: 'Ahmad Khalil', status: 'draft',     enrolled: 0,   completion: 0,  rating: 0,   type: 'guided', step_count: 5 },
  { id: 6,  title: 'LED Circuit Board',      category: 'Electronics', difficulty: 'Easy',   duration: '1–2 hours', description: 'Fundamentals of circuit design: resistors, LEDs, breadboards, multimeters.', emoji: '💡', color: 'teal-img',   creator_id: null, creator_name: 'Ahmad Khalil', status: 'published', enrolled: 188, completion: 89, rating: 5.0, type: 'guided', step_count: 4 },
  { id: 7,  title: 'Soil pH Tester',         category: 'Agriculture', difficulty: 'Easy',   duration: '3–5 hours', description: 'Measure soil pH with a probe and a microcontroller.', emoji: '🌱', color: 'green-img',  creator_id: null, creator_name: 'Ahmad Khalil', status: 'draft',     enrolled: 0,   completion: 0,  rating: 0,   type: 'guided', step_count: 4 },
  { id: 8,  title: 'Hydroponic System',      category: 'Agriculture', difficulty: 'Hard',   duration: '2+ weeks',  description: 'Automated hydroponic system with pH sensor and pump control.', emoji: '🥬', color: 'green-img',  creator_id: null, creator_name: 'Ahmad Khalil', status: 'published', enrolled: 76,  completion: 44, rating: 4.6, type: 'guided', step_count: 9 },
  { id: 9,  title: 'Ultrasonic Meter',       category: 'Coding',      difficulty: 'Easy',   duration: '1–2 hours', description: 'Handheld distance meter using HC-SR04 and a 16×2 LCD.', emoji: '📡', color: 'purple-img', creator_id: null, creator_name: 'Ahmad Khalil', status: 'published', enrolled: 91,  completion: 74, rating: 4.7, type: 'guided', step_count: 4 },
  { id: 10, title: 'Solar Water Heater',     category: 'Renewable',   difficulty: 'Medium', duration: '1 week',    description: 'Passive solar water heating panel from copper pipe.', emoji: '☀️', color: 'amber-img',  creator_id: null, creator_name: 'Ahmad Khalil', status: 'review',    enrolled: 0,   completion: 0,  rating: 0,   type: 'guided', step_count: 6 },
  { id: 11, title: 'Earthquake Detector',    category: 'Coding',      difficulty: 'Hard',   duration: '1–2 days',  description: 'Seismograph with MPU-6050, SD logging and FFT analysis.', emoji: '📳', color: 'red-img',    creator_id: null, creator_name: 'Ahmad Khalil', status: 'published', enrolled: 29,  completion: 18, rating: 4.8, type: 'guided', step_count: 8 },
];

// ── Parent flow seed (Day 5) ─────────────────────────────────────────────────
/**
 * Offline demo children for the Parent flow. Plain denormalized view objects
 * (there is no `children` table — see the Day 5 spec). `public_id` is the
 * learner's LRN id used by the Link Child lookup; the demo links `LRN-4821`.
 */
export const SEED_CHILDREN = [
  { id: '1', public_id: 'LRN-4821', name: 'Fazrin Ezan', init: 'FE', color: '#F59E0B', grade: 'Form 4', school: 'SMK Bandar Kuching', level: 4, rank: 'Maker Apprentice', xp: 620, xpMax: 1000, active: true,  lastSeen: 'Active now',         active_proj: 3, done_proj: 7, badges: 12, streak: 12, goal: 'Complete the Solar Phone Charger project and earn the Electronics Explorer badge before end of term.', goalDate: '30 June 2026' },
  { id: '2', public_id: 'LRN-2910', name: 'Nurul Hana',  init: 'NH', color: '#8B5CF6', grade: 'Form 2', school: 'SMK Bandar Kuching', level: 2, rank: 'Builder',          xp: 320, xpMax: 600,  active: false, lastSeen: 'Last active 2d ago', active_proj: 1, done_proj: 3, badges: 5,  streak: 3,  goal: 'Enrol in and complete 2 more projects to reach Level 3.',                                            goalDate: '31 July 2026' },
];

/** Children's activity feed (newest first). Mirrors App.jsx ACTIVITY_FEED. */
export const SEED_PARENT_ACTIVITY = [
  { child: 'Fazrin', init: 'FE', color: '#F59E0B', icon: '⚡', type: 'xp',     title: 'Completed Step 4 of Solar Phone Charger', sub: '+50 XP earned',            time: '2m', group: 'Today',     unread: true  },
  { child: 'Fazrin', init: 'FE', color: '#F59E0B', icon: '🏆', type: 'badge',  title: 'Unlocked "7 Day Streak" Badge',           sub: 'Bronze tier achievement',  time: '1h', group: 'Today',     unread: true  },
  { child: 'Nurul',  init: 'NH', color: '#8B5CF6', icon: '📚', type: 'enrol',  title: 'Enrolled in Arduino Plant Monitor',       sub: 'New project started',      time: '3h', group: 'Today',     unread: false },
  { child: 'Fazrin', init: 'FE', color: '#F59E0B', icon: '🔥', type: 'streak', title: '12-Day Streak Milestone!',                sub: 'Personal best so far',     time: '5h', group: 'Today',     unread: false },
  { child: 'Nurul',  init: 'NH', color: '#8B5CF6', icon: '⚡', type: 'xp',     title: 'Completed Step 2 of LED Circuit Board',   sub: '+30 XP earned',            time: '1d', group: 'Yesterday', unread: false },
  { child: 'Fazrin', init: 'FE', color: '#F59E0B', icon: '📊', type: 'lb',     title: 'Moved to #5 on School Leaderboard',       sub: 'Up 2 positions this week',  time: '2d', group: 'Yesterday', unread: false },
  { child: 'Nurul',  init: 'NH', color: '#8B5CF6', icon: '📜', type: 'cert',   title: 'Certificate Issued',                      sub: 'LED Circuit Board — completed', time: '3d', group: 'This Week', unread: false },
  { child: 'Fazrin', init: 'FE', color: '#F59E0B', icon: '🌟', type: 'badge',  title: 'Unlocked "5 Projects" Badge',             sub: 'Silver tier achievement',  time: '5d', group: 'This Week', unread: false },
];

/** Parent-specific notifications. Mirrors App.jsx PARENT_NOTIFS. */
export const SEED_PARENT_NOTIFS = [
  { type: 'step',     icon: '⚡', bg: 'rgba(245,158,11,0.15)', title: 'Step Completed',     sub: 'Fazrin completed Step 4 of Solar Phone Charger. +50 XP.', time: '2m', unread: true,  group: 'Today'     },
  { type: 'badge',    icon: '🏅', bg: 'rgba(168,85,247,0.15)', title: 'Badge Unlocked',     sub: 'Fazrin earned the "7 Day Streak" Bronze badge.',          time: '1h', unread: true,  group: 'Today'     },
  { type: 'enrol',    icon: '📚', bg: 'rgba(14,116,144,0.15)', title: 'New Project Started', sub: 'Nurul enrolled in Arduino Plant Monitor.',               time: '3h', unread: false, group: 'Today'     },
  { type: 'streak',   icon: '🔥', bg: 'rgba(234,88,12,0.15)',  title: 'Streak Milestone',   sub: 'Fazrin has a 12-day learning streak — personal best!',    time: '5h', unread: false, group: 'Today'     },
  { type: 'step',     icon: '⚡', bg: 'rgba(245,158,11,0.15)', title: 'Step Completed',     sub: 'Nurul completed Step 2 of LED Circuit Board. +30 XP.',    time: '1d', unread: false, group: 'Yesterday' },
  { type: 'complete', icon: '✅', bg: 'rgba(22,101,52,0.15)',  title: 'Project Completed!', sub: 'Fazrin finished Solar Phone Charger and earned a cert.',  time: '2d', unread: false, group: 'Yesterday' },
  { type: 'goal',     icon: '🎯', bg: 'rgba(14,116,144,0.15)', title: 'Goal Progress',      sub: 'Fazrin is 80% towards their June goal.',                  time: '3d', unread: false, group: 'This Week' },
  { type: 'cert',     icon: '📜', bg: 'rgba(245,158,11,0.15)', title: 'Certificate Earned', sub: 'Fazrin earned a Project Completion certificate.',         time: '5d', unread: false, group: 'This Week' },
];

/**
 * Public creator directory keyed by full name. Powers the view-creator modal
 * shown from Child Progress (and reusable by the learner Project Detail).
 * Mirrors SharedExtras.jsx CREATORS.
 */
export const SEED_CREATORS = {
  'Ahmad Khalil':   { init: 'AK', color: '#F59E0B', role: 'STEM Educator',    org: 'SMK Bandar Kuching', bio: 'Maker since 2015. Passionate about hands-on electronics & solar projects. National finalist, MSTC Maker Faire 2023.', projects: 5, students: 1142, rating: 4.85, badges: 'Featured Creator · Verified', id: 'CRT-2037' },
  'Siti Rahimah':   { init: 'SR', color: '#22C55E', role: 'Robotics Coach',   org: 'SMK Bandar Kuching', bio: 'Specialises in Arduino & sensor-based agriculture projects. Mentor for the Sarawak State Robotics Team.', projects: 3, students: 287, rating: 4.7, badges: 'Verified', id: 'CRT-1193' },
  'David Anak Lee': { init: 'DL', color: '#0E7490', role: 'Renewable Energy', org: 'SMK Miri',           bio: 'Civil engineer turned educator. Builds wind, solar and micro-hydro projects from recycled materials.', projects: 2, students: 114, rating: 4.55, badges: 'Verified', id: 'CRT-3381' },
  'Liyana Binti':   { init: 'LB', color: '#22C55E', role: 'Agritech Mentor',  org: 'SMK Sibu',           bio: 'Champion of low-cost hydroponics and biogas. Trained over 200 rural youth makers across Borneo.', projects: 2, students: 167, rating: 4.7, badges: 'Verified', id: 'CRT-5527' },
  'Nurul Hana':     { init: 'NH', color: '#8B5CF6', role: 'Junior Creator',   org: 'SMK Bandar Kuching', bio: 'Form 5 student who turned her science fair project into a published rain gauge tutorial.', projects: 1, students: 44, rating: 4.4, badges: 'Student Creator', id: 'CRT-7742' },
  'Kevin Jawa':     { init: 'KJ', color: '#F59E0B', role: 'IoT Engineer',     org: 'SMK Bintulu',        bio: 'Industry-trained IoT specialist. Brings real-world automation projects to the classroom.', projects: 1, students: 67, rating: 4.6, badges: 'Industry Partner', id: 'CRT-8815' },
};
