-- Migration 008: Create vehicle_requests table
-- Tracks customer requests when their vehicle is not found in the DWH

CREATE TYPE vehicle_request_status AS ENUM ('pending', 'resolved', 'rejected');

CREATE TABLE IF NOT EXISTS vehicle_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(200),
    message TEXT,
    status vehicle_request_status NOT NULL DEFAULT 'pending',
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX vehicle_requests_user_idx ON vehicle_requests (user_id);
CREATE INDEX vehicle_requests_status_idx ON vehicle_requests (status);
CREATE INDEX vehicle_requests_created_idx ON vehicle_requests (created_at);
