-- Добавление колонки для хранения IP-адреса устройства при подключении
ALTER TABLE users ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);