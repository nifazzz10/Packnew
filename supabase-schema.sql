-- Create workers table
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create packing_entries table
CREATE TABLE packing_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  quantity INTEGER NOT NULL,
  rate DECIMAL(10, 2) NOT NULL,
  company TEXT NOT NULL CHECK (company IN ('NCC', 'ICD', 'CC')),
  total DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * rate) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create views for easier querying
CREATE VIEW packing_entries_view AS
SELECT 
  pe.id,
  pe.worker_id,
  w.name as worker_name,
  pe.item_id,
  i.name as item_name,
  pe.date,
  pe.quantity,
  pe.rate,
  pe.company,
  pe.total,
  pe.created_at,
  pe.updated_at
FROM packing_entries pe
JOIN workers w ON pe.worker_id = w.id
JOIN items i ON pe.item_id = i.id;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_workers_updated_at
BEFORE UPDATE ON workers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packing_entries_updated_at
BEFORE UPDATE ON packing_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

