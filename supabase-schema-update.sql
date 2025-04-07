-- Create buyers table
CREATE TABLE buyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  rate DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * rate) STORED,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales view
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
  s.updated_at
FROM sales s
JOIN items i ON s.item_id = i.id
JOIN buyers b ON s.buyer_id = b.id;

-- Create trigger for updated_at on buyers
CREATE TRIGGER update_buyers_updated_at
BEFORE UPDATE ON buyers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updated_at on sales
CREATE TRIGGER update_sales_updated_at
BEFORE UPDATE ON sales
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

