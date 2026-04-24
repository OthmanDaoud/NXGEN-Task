INSERT INTO "Device" ("id", "name", "created_at")
VALUES
  ('0673d486-8f42-4bfc-b900-3d442b7b9f19', 'demo-sensor-1', '2026-01-01T00:00:00.000Z'),
  ('8e6bb6ad-e7d8-4638-a645-88d0d9f4f4cc', 'demo-sensor-2', '2026-01-01T00:00:00.000Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Data" ("id", "device_id", "metric", "unit", "value", "timestamp")
VALUES
  ('615f6a7e-c395-4ea1-a31d-047f9f01f94d', '0673d486-8f42-4bfc-b900-3d442b7b9f19', 'Temperature', 'C', 24.6, '2026-01-10T09:00:00.000Z'),
  ('2eb2a236-fc73-4072-bb8f-0a58d6f7c369', '0673d486-8f42-4bfc-b900-3d442b7b9f19', 'Humidity', '%', 52.1, '2026-01-10T09:00:00.000Z'),
  ('3bb43f0d-70ed-4777-82cf-a112ed8dc970', '0673d486-8f42-4bfc-b900-3d442b7b9f19', 'Atmospheric pressure', 'hPa', 1008.4, '2026-01-10T09:00:00.000Z'),
  ('87cb1758-c739-4258-b13d-b8f57c524f7f', '0673d486-8f42-4bfc-b900-3d442b7b9f19', 'Temperature', 'C', 25.1, '2026-01-10T10:00:00.000Z'),
  ('93c543c1-7c2e-472f-8508-74b51f34f0de', '0673d486-8f42-4bfc-b900-3d442b7b9f19', 'Humidity', '%', 49.8, '2026-01-10T10:00:00.000Z'),
  ('9c1ca09a-a212-434b-a337-05081f6ac34e', '0673d486-8f42-4bfc-b900-3d442b7b9f19', 'Atmospheric pressure', 'hPa', 1009.1, '2026-01-10T10:00:00.000Z'),
  ('7f31f8bd-7cec-4827-9158-e34cc1f628f2', '8e6bb6ad-e7d8-4638-a645-88d0d9f4f4cc', 'Temperature', 'C', 23.4, '2026-01-10T09:30:00.000Z'),
  ('7bf8499c-f5cf-4cf4-aaef-cfde15d77d7b', '8e6bb6ad-e7d8-4638-a645-88d0d9f4f4cc', 'Humidity', '%', 46.5, '2026-01-10T09:30:00.000Z'),
  ('bc39d645-f8c9-4c6b-8230-fd6b6ac712f3', '8e6bb6ad-e7d8-4638-a645-88d0d9f4f4cc', 'Atmospheric pressure', 'hPa', 1007.7, '2026-01-10T09:30:00.000Z')
ON CONFLICT ("id") DO NOTHING;
