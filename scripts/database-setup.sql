-- NBC LandSight Database Schema
-- Comprehensive database setup for cadastre and concessions management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('Administrator', 'Surveyor', 'Data Entry', 'Viewer', 'API User');
CREATE TYPE user_status AS ENUM ('Active', 'Inactive', 'Suspended');
CREATE TYPE parcel_status AS ENUM ('Registered', 'Pending', 'Under Review', 'Disputed', 'Cancelled');
CREATE TYPE concession_status AS ENUM ('Active', 'Application', 'Under Review', 'Renewal Pending', 'Suspended', 'Expired');
CREATE TYPE concession_type AS ENUM ('Mining', 'Forestry', 'Agriculture', 'Oil & Gas', 'Infrastructure');
CREATE TYPE compliance_level AS ENUM ('Excellent', 'Good', 'Fair', 'Poor');
CREATE TYPE log_level AS ENUM ('info', 'warning', 'error', 'debug');
CREATE TYPE api_key_status AS ENUM ('active', 'inactive', 'suspended');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'Viewer',
    status user_status NOT NULL DEFAULT 'Active',
    phone VARCHAR(20),
    department VARCHAR(100),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parcels table (Cadastre)
CREATE TABLE IF NOT EXISTS parcels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    county VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    owner VARCHAR(200) NOT NULL,
    area VARCHAR(50),
    land_use VARCHAR(200),
    coordinates TEXT,
    description TEXT,
    status parcel_status NOT NULL DEFAULT 'Pending',
    registered DATE,
    conflicts INTEGER DEFAULT 0,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    surveyor_name VARCHAR(100),
    survey_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Concessions table
CREATE TABLE IF NOT EXISTS concessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concession_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    type concession_type NOT NULL,
    company VARCHAR(200) NOT NULL,
    county VARCHAR(50) NOT NULL,
    area VARCHAR(50),
    status concession_status NOT NULL DEFAULT 'Application',
    issued DATE,
    expires DATE,
    revenue VARCHAR(50),
    compliance compliance_level,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level log_level NOT NULL,
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    user_name VARCHAR(100),
    ip_address INET,
    details JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    key_value VARCHAR(255) UNIQUE NOT NULL,
    institution VARCHAR(200) NOT NULL,
    permissions TEXT[] NOT NULL,
    status api_key_status NOT NULL DEFAULT 'active',
    created_at DATE NOT NULL,
    last_used VARCHAR(50) DEFAULT 'Never',
    request_count INTEGER DEFAULT 0,
    rate_limit INTEGER DEFAULT 1000,
    expires_at DATE,
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'unread',
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parcels_county ON parcels(county);
CREATE INDEX IF NOT EXISTS idx_parcels_status ON parcels(status);
CREATE INDEX IF NOT EXISTS idx_parcels_registered ON parcels(registered);
CREATE INDEX IF NOT EXISTS idx_concessions_type ON concessions(type);
CREATE INDEX IF NOT EXISTS idx_concessions_status ON concessions(status);
CREATE INDEX IF NOT EXISTS idx_concessions_county ON concessions(county);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- Insert sample data
INSERT INTO users (username, email, password_hash, full_name, role, status, phone, department) VALUES
('admin', 'admin@example.com', '$2b$10$example_hash', 'System Administrator', 'Administrator', 'Active', '+231-555-0001', 'IT Department'),
('surveyor1', 'surveyor1@example.com', '$2b$10$example_hash', 'John Doe', 'Surveyor', 'Active', '+231-555-0002', 'Survey Department'),
('dataentry1', 'dataentry1@example.com', '$2b$10$example_hash', 'Jane Smith', 'Data Entry', 'Active', '+231-555-0003', 'Records Department')
ON CONFLICT (username) DO NOTHING;

-- Insert sample parcels
INSERT INTO parcels (parcel_id, type, county, district, owner, area, land_use, status, registered, conflicts) VALUES
('PAR-2024-001', 'Agricultural Land', 'Montserrado', 'Greater Monrovia', 'John Kpehe', '15.5 hectares', 'Rice farming', 'Registered', '2024-01-15', 0),
('PAR-2024-002', 'Residential Property', 'Margibi', 'Kakata', 'Mary Johnson', '0.25 hectares', 'Single family home', 'Registered', '2024-01-20', 0),
('PAR-2024-003', 'Commercial Property', 'Nimba', 'Ganta', 'Ganta Trading Co.', '2.1 hectares', 'Commercial complex', 'Pending', '2024-02-01', 1),
('PAR-2024-004', 'Industrial Site', 'Grand Bassa', 'Buchanan', 'Liberia Industrial Corp', '45.8 hectares', 'Manufacturing facility', 'Under Review', '2024-02-10', 0),
('PAR-2024-005', 'Agricultural Land', 'Bong', 'Gbarnga', 'Farmers Cooperative', '125.3 hectares', 'Cassava and vegetables', 'Registered', '2024-02-15', 0)
ON CONFLICT (parcel_id) DO NOTHING;

-- Insert sample concessions
INSERT INTO concessions (concession_id, name, type, company, county, area, status, issued, expires, revenue, compliance) VALUES
('CON-2024-001', 'Bong Iron Ore Mine', 'Mining', 'ArcelorMittal Liberia', 'Bong', '2,450 ha', 'Active', '2020-03-15', '2030-03-15', '$125.5M', 'Good'),
('CON-2024-002', 'Sapo Forest Concession', 'Forestry', 'Liberian Forest Products', 'Sinoe', '15,680 ha', 'Active', '2019-06-01', '2029-06-01', '$45.2M', 'Excellent'),
('CON-2024-003', 'Grand Kru Palm Plantation', 'Agriculture', 'Golden Veroleum Liberia', 'Grand Kru', '8,900 ha', 'Under Review', '2021-09-12', '2031-09-12', '$78.3M', 'Fair'),
('CON-2024-004', 'Nimba Mining Rights', 'Mining', 'China Union Investment', 'Nimba', '1,200 ha', 'Application', NULL, NULL, '-', NULL),
('CON-2024-005', 'Maryland Rubber Plantation', 'Agriculture', 'Firestone Liberia', 'Maryland', '12,500 ha', 'Active', '2018-11-20', '2028-11-20', '$92.1M', 'Good')
ON CONFLICT (concession_id) DO NOTHING;

-- Insert sample API keys
INSERT INTO api_keys (name, key_value, institution, permissions, status, created_at, request_count, rate_limit) VALUES
('Ministry of Finance API', 'nbc_live_sk_mof_2024_abc123def456', 'Ministry of Finance', ARRAY['read:cadastre', 'read:concessions', 'read:reports'], 'active', '2024-01-01', 1250, 2000),
('World Bank Data Access', 'nbc_live_sk_wb_2024_xyz789uvw012', 'World Bank', ARRAY['read:public_data', 'read:reports'], 'active', '2024-01-15', 890, 1000),
('EPA Environmental Data', 'nbc_live_sk_epa_2024_hij345klm678', 'Environmental Protection Agency', ARRAY['read:concessions', 'read:spatial'], 'active', '2024-02-01', 456, 500)
ON CONFLICT (key_value) DO NOTHING;

-- Insert sample system logs
INSERT INTO system_logs (level, category, message, user_name, ip_address) VALUES
('info', 'Authentication', 'User login successful', 'admin', '192.168.1.100'),
('info', 'Cadastre', 'New parcel registered: PAR-2024-001', 'surveyor1', '192.168.1.101'),
('warning', 'Concessions', 'Concession renewal deadline approaching: CON-2024-002', 'System', '127.0.0.1'),
('info', 'API', 'API key created for Ministry of Finance', 'admin', '192.168.1.100'),
('error', 'System', 'Database backup failed', 'System', '127.0.0.1');

-- Insert sample notifications
INSERT INTO notifications (title, message, type, priority, status) VALUES
('System Maintenance Scheduled', 'Scheduled maintenance on Sunday, March 15th from 2:00 AM to 6:00 AM', 'system', 'high', 'unread'),
('New Concession Application', 'New mining concession application received from China Union Investment', 'concession', 'medium', 'unread'),
('Parcel Registration Approved', 'Parcel PAR-2024-003 has been approved and registered', 'cadastre', 'low', 'read'),
('API Rate Limit Warning', 'Ministry of Finance API key approaching rate limit (85% used)', 'api', 'medium', 'unread'),
('Backup Completed', 'Daily database backup completed successfully', 'system', 'low', 'read');

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parcels_updated_at BEFORE UPDATE ON parcels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_concessions_updated_at BEFORE UPDATE ON concessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your environment)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nbc_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nbc_app_user;
