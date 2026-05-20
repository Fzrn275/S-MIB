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

function placeholderSteps(projectId, count) {
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
