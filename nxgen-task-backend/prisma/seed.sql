INSERT INTO "Device" ("id", "name", "created_at")
VALUES
  ('0673d486-8f42-4bfc-b900-3d442b7b9f19', 'demo-sensor-1', NOW()),
  ('8e6bb6ad-e7d8-4638-a645-88d0d9f4f4cc', 'demo-sensor-2', NOW())
ON CONFLICT ("id") DO UPDATE
SET "name" = EXCLUDED."name";

WITH devices AS (
  SELECT "id" FROM "Device"
),
time_points AS (
  SELECT generate_series(
    TIMESTAMP '2026-01-01 00:00:00',
    TIMESTAMP '2026-04-30 18:00:00',
    INTERVAL '6 hours'
  ) AS ts
),
metrics AS (
  SELECT *
  FROM (
    VALUES
      ('Temperature', 'C'),
      ('Humidity', '%'),
      ('Atmospheric pressure', 'hPa')
  ) AS metric_values(metric, unit)
),
month_profiles AS (
  SELECT *
  FROM (
    VALUES
      (1, -3.5::double precision, 8.0::double precision, -4.5::double precision),
      (2, -1.0::double precision, 4.5::double precision, -1.5::double precision),
      (3, 1.5::double precision, 0.0::double precision, 1.0::double precision),
      (4, 4.0::double precision, -3.0::double precision, 3.5::double precision)
  ) AS monthly_adjustments(month_no, temp_shift, humidity_shift, pressure_shift)
),
seed_data AS (
  SELECT
    md5(CONCAT('seed|', d."id", '|', m.metric, '|', to_char(t.ts, 'YYYY-MM-DD HH24:MI:SS'))) AS id,
    d."id" AS device_id,
    m.metric,
    m.unit,
    CASE m.metric
      WHEN 'Temperature' THEN (
        20
        + mp.temp_shift
        + ((EXTRACT(DAY FROM t.ts)::int % 7) * 0.4)
        + ((EXTRACT(HOUR FROM t.ts)::int / 6) * 0.3)
      )::double precision
      WHEN 'Humidity' THEN (
        48
        + mp.humidity_shift
        + ((EXTRACT(DAY FROM t.ts)::int % 9) * 0.8)
        - ((EXTRACT(HOUR FROM t.ts)::int / 6) * 0.6)
      )::double precision
      WHEN 'Atmospheric pressure' THEN (
        1006
        + mp.pressure_shift
        + ((EXTRACT(DAY FROM t.ts)::int % 5) * 0.6)
        + ((EXTRACT(HOUR FROM t.ts)::int / 6) * 0.2)
      )::double precision
    END AS value,
    t.ts AS "timestamp"
  FROM devices d
  CROSS JOIN time_points t
  CROSS JOIN metrics m
  JOIN month_profiles mp ON mp.month_no = EXTRACT(MONTH FROM t.ts)::int
)
INSERT INTO "Data" ("id", "device_id", "metric", "unit", "value", "timestamp")
SELECT id, device_id, metric, unit, value, "timestamp"
FROM seed_data
ON CONFLICT ("id") DO UPDATE
SET
  "device_id" = EXCLUDED."device_id",
  "metric" = EXCLUDED."metric",
  "unit" = EXCLUDED."unit",
  "value" = EXCLUDED."value",
  "timestamp" = EXCLUDED."timestamp";
