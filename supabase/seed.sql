-- ============================================================================
-- S-MIB — Day 3 seed data. Run AFTER schema_day3.sql in the Supabase SQL editor.
-- Global, shared data only (projects, steps, badge catalog). Per-user progress
-- and earned badges are NOT seeded — real learners start empty and earn XP.
-- ============================================================================

-- ── projects (ids 1–12) ──────────────────────────────────────────────────────
insert into public.projects
  (id, title, category, difficulty, duration, description, emoji, color, creator_name, status, enrolled, completion, rating, type, step_count)
overriding system value
values
  (1, 'Solar Phone Charger', 'Electronics', 'Easy',  '3–5 hours', 'Build a solar-powered USB charger using a 6V panel, USB module and basic breadboard wiring. No soldering required for the first 4 steps.', '⚡', 'teal-img',  'Ahmad Khalil',  'published', 142, 68, 4.9, 'guided', 6),
  (2, 'Smart Water Sensor', 'Agriculture', 'Medium', '1–2 days',  'Build a capacitive soil moisture sensor with an Arduino Nano that sends SMS alerts when water levels drop below threshold.', '🌱', 'amber-img', 'Siti Rahimah',  'published', 98,  52, 4.7, 'guided', 8),
  (3, 'Recycled Wind Turbine', 'Renewable', 'Easy',  '1–2 hours', 'Construct a functional wind turbine from recycled plastic bottles and a DC motor. Learn about kinetic-to-electrical energy conversion.', '♻️', 'green-img', 'David Anak Lee','published', 76,  44, 4.6, 'guided', 5),
  (4, 'Arduino Plant Monitor', 'Coding',    'Hard',  '2+ weeks',  'Full IoT project: soil sensor + DHT11 temp/humidity + OLED display + Blynk dashboard. All code provided with detailed explanations.', '🤖', 'purple-img','Ahmad Khalil',  'published', 203, 31, 4.8, 'guided', 10),
  (5, 'Biogas Generator',     'Agriculture','Medium','1 week',    'Build a small-scale biogas digester from recycled materials. Learn about anaerobic digestion and renewable energy from organic waste.', '🔬', 'green-img', 'Liyana Binti',  'published', 55,  39, 4.5, 'guided', 7),
  (6, 'LED Circuit Board',    'Electronics','Easy',  '1–2 hours', 'Master the fundamentals of circuit design: resistors, LEDs, breadboards and multimeters. The perfect first electronics project.', '💡', 'amber-img', 'Ahmad Khalil',  'published', 188, 89, 5.0, 'guided', 4),
  (7, 'Rain Gauge Station',   'Agriculture','Easy',  '3–5 hours', 'Build a tipping-bucket rain gauge connected to an Arduino that logs rainfall data to a local SD card.', '🌧️', 'teal-img',  'Nurul Hana',    'published', 44,  61, 4.4, 'guided', 5),
  (8, 'Hydroponics Controller','Agriculture','Hard', '2+ weeks',  'Automated hydroponic system with pH sensor, nutrient pump control, grow lights on timer and real-time monitoring via web dashboard.', '🥬', 'green-img', 'Kevin Jawa',    'published', 67,  28, 4.6, 'guided', 9),
  (9, 'Ultrasonic Distance Meter','Coding','Easy',   '1–2 hours', 'Build a handheld distance meter using HC-SR04 ultrasonic sensor and a 16×2 LCD display. Great intro to sensors and I2C communication.', '📡', 'purple-img','Siti Rahimah',  'published', 91,  74, 4.7, 'guided', 4),
  (10,'Solar Water Heater',   'Renewable',  'Medium','1 week',    'Construct a passive solar water heating panel from copper pipe and recycled materials. Measure temperature rise with a DS18B20 sensor.', '☀️', 'amber-img', 'David Anak Lee','published', 38,  55, 4.5, 'guided', 6),
  (11,'Earthquake Detector',  'Coding',     'Hard',  '1–2 days',  'Seismograph built with MPU-6050 accelerometer, SD logging and real-time FFT analysis. Data visualised using Processing on a PC.', '📳', 'red-img',   'Ahmad Khalil',  'published', 29,  18, 4.8, 'guided', 8),
  (12,'Vertical Garden Planter','Agriculture','Easy','3–5 hours', 'Build a self-watering vertical garden from PVC pipes and recycled plastic bottles. Includes a simple drip-irrigation timer circuit.', '🌿', 'green-img', 'Liyana Binti',  'published', 112, 82, 4.9, 'guided', 4);

select setval(pg_get_serial_sequence('public.projects','id'), 12, true);

-- ── steps for project 1 (real content, ported from App.jsx:30-35) ─────────────
insert into public.steps (project_id, step_n, title, instruction, tip, materials, xp, proof_required) values
  (1, 1, 'Gather Materials', 'Collect all materials listed below. Check each one off before proceeding.', 'Ask your teacher for the solar panel from the STEM kit if you do not have one.',
     '[{"name":"Solar panel (6V, 1W)"},{"name":"USB charging module (TP4056)"},{"name":"Multimeter"},{"name":"Connecting wires","quantity":4},{"name":"Breadboard (half-size)"},{"name":"9V battery (for testing)"}]'::jsonb, 20, true),
  (1, 2, 'Set Up Solar Panel', 'Orient the solar panel facing a window or light source. Connect the red wire to the positive terminal and the black wire to the negative terminal. Secure the panel with the provided clips.', 'Panels work best at a 30–45° angle toward the light source — like a ramp, not flat.',
     '[{"name":"Solar panel"},{"name":"Mounting clips"},{"name":"Red wire"},{"name":"Black wire"}]'::jsonb, 30, true),
  (1, 3, 'Wire the Circuit', 'Insert the USB module into the breadboard. Connect column A (positive rail) to the IN+ pin on the module. Connect column B (negative rail) to IN−. Double-check using the circuit diagram image below.', 'The breadboard power rails run the full length of each side. Red stripe = positive, Blue stripe = negative.',
     '[{"name":"Breadboard"},{"name":"USB module"},{"name":"Connecting wires"}]'::jsonb, 40, true),
  (1, 4, 'Test Output Voltage', 'Set your multimeter to DC voltage (20V range). Touch the red probe to OUT+ and black probe to OUT− on the USB module. Point the panel at a bright light source. A healthy reading is 4.8V–5.2V.', 'If your reading is below 4V, check wire connections first. Shadows on even 10% of the panel can drop output by 50%.',
     '[{"name":"Multimeter"},{"name":"Completed circuit from Step 3"}]'::jsonb, 50, true),
  (1, 5, 'Solder Connections', 'Once voltage is confirmed, solder the four wire connections for a permanent build. Apply flux, heat the pad for 2 seconds then feed solder. Good joints are shiny and cone-shaped.', 'Keep the soldering iron tip clean with a damp sponge. Bad joints look dull and lumpy — reheat and re-flow.',
     '[{"name":"Soldering iron"},{"name":"Solder wire"},{"name":"Flux paste"},{"name":"Wire strippers"}]'::jsonb, 60, true),
  (1, 6, 'Final Assembly & Test', 'Enclose the circuit in the provided case or fabricate one from cardboard. Attach the solar panel to the lid. Connect a phone and verify charging starts within 10 seconds of placing in sunlight.', 'A charging phone means success! Take your proof photo and submit to earn your completion certificate.',
     '[{"name":"Project case or cardboard"},{"name":"Hot glue or tape"},{"name":"Completed circuit"}]'::jsonb, 80, true);

-- ── generated placeholder steps for projects 2–12 ────────────────────────────
-- xp = 20 + 10*(step_n-1); generic instruction so progress/% works everywhere.
do $$
declare
  p record;
  i int;
begin
  for p in select id, step_count from public.projects where id between 2 and 12 loop
    for i in 1..p.step_count loop
      insert into public.steps (project_id, step_n, title, instruction, tip, materials, xp, proof_required)
      values (p.id, i, 'Step ' || i,
              'Follow the instructions for step ' || i || '. Detailed content for this project is coming soon.',
              null, '[]'::jsonb, 20 + 10*(i-1), true)
      on conflict (project_id, step_n) do nothing;
    end loop;
  end loop;
end $$;

-- ── achievements catalog (16 badges, from App.jsx:81-98) ─────────────────────
insert into public.achievements (code, tier, icon, name, description) values
  ('first_build','bronze','⚡','First Build','Complete your first project step.'),
  ('seven_day_streak','bronze','🔥','7 Day Streak','Log in 7 days in a row.'),
  ('five_projects','silver','🌿','5 Projects','Enrol in 5 different projects.'),
  ('stem_explorer','silver','🔬','STEM Explorer','Complete a project in 3 categories.'),
  ('top_maker','gold','🌟','Top Maker','Reach the top 10 on the school leaderboard.'),
  ('tvet_ready','legendary','🏆','TVET Ready','Earn all category mastery certificates.'),
  ('proof_photo','bronze','📸','Proof Photo','Submit your first proof photo.'),
  ('lab_master','silver','⚗️','Lab Master','Complete 3 Electronics projects.'),
  ('speed_builder','gold','🚀','Speed Builder','Complete a project within 24 hours.'),
  ('mastery','legendary','🎓','Mastery','Achieve 100% on any project assessment.'),
  ('team_player','bronze','🤝','Team Player','Collaborate on a group project.'),
  ('global_rank','silver','🌍','Global Rank','Enter the Global top 100.'),
  ('perfect_score','gold','💯','Perfect Score','Get 100% on 5 step assessments.'),
  ('explorer','bronze','🗺️','Explorer','Visit every category at least once.'),
  ('science_star','silver','🔭','Science Star','Complete 3 Coding projects.'),
  ('champion','legendary','👑','Champion','Reach #1 on the Sarawak leaderboard.')
on conflict (code) do nothing;

-- ── OPTIONAL: populate a demo learner's progress + earned badges ──────────────
-- Replace the email below with a real registered learner, then uncomment & run.
-- do $$
-- declare uid uuid;
-- begin
--   select id into uid from public.profiles where email = 'demo@smib.app';
--   if uid is not null then
--     insert into public.progress (user_id, project_id, completed_step_numbers, xp_earned, last_step_at)
--     values (uid, 1, '{1,2,3}', 90, now()),
--            (uid, 2, '{1,2,3,4,5,6}', 210, now()),
--            (uid, 6, '{1,2,3,4}', 130, now())
--     on conflict (user_id, project_id) do nothing;
--     insert into public.user_achievements (user_id, achievement_code)
--     values (uid,'first_build'),(uid,'seven_day_streak'),(uid,'five_projects'),
--            (uid,'stem_explorer'),(uid,'top_maker'),(uid,'tvet_ready')
--     on conflict do nothing;
--   end if;
-- end $$;
