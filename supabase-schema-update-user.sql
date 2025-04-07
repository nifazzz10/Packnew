-- Add user_id column to existing tables
ALTER TABLE workers ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE items ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE buyers ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE packing_entries ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE sales ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update views to include user_id
DROP VIEW IF EXISTS packing_entries_view;
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
  pe.updated_at,
  pe.user_id
FROM packing_entries pe
JOIN workers w ON pe.worker_id = w.id
JOIN items i ON pe.item_id = i.id;

DROP VIEW IF EXISTS sales_view;
CREATE VIEW sales_view AS
SELECT 
  s.id,
  s.item_id,
  i.name as item_name,
  s.buyer_id,
  b.name as buyer_name,
  s.quantity,
  s.rate,
  s.total,
  s.date,
  s.created_at,
  s.updated_at,
  s.user_id
FROM sales s
JOIN items i ON s.item_id = i.id
JOIN buyers b ON s.buyer_id = b.id;

