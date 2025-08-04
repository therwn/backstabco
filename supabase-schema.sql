-- Black Market tabloları
CREATE TABLE black_market_tables (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255),
  creator_id VARCHAR(255) NOT NULL,
  creator_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Black Market item'ları
CREATE TABLE black_market_items (
  id SERIAL PRIMARY KEY,
  table_id INTEGER REFERENCES black_market_tables(id) ON DELETE CASCADE,
  item_id VARCHAR(255) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_tier INTEGER NOT NULL,
  item_enchantment INTEGER DEFAULT 0,
  item_quality INTEGER DEFAULT 1,
  buy_price INTEGER,
  buy_quantity INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Şehir fiyatları
CREATE TABLE city_prices (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES black_market_items(id) ON DELETE CASCADE,
  city VARCHAR(100) NOT NULL,
  sell_order INTEGER,
  buy_order INTEGER,
  quantity INTEGER,
  quality INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RLS (Row Level Security) politikaları
ALTER TABLE black_market_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE black_market_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_prices ENABLE ROW LEVEL SECURITY;

-- Black Market tabloları için RLS politikaları
CREATE POLICY "Users can view their own tables" ON black_market_tables
  FOR SELECT USING (creator_id = auth.uid()::text);

CREATE POLICY "Users can insert their own tables" ON black_market_tables
  FOR INSERT WITH CHECK (creator_id = auth.uid()::text);

CREATE POLICY "Users can update their own tables" ON black_market_tables
  FOR UPDATE USING (creator_id = auth.uid()::text);

CREATE POLICY "Users can delete their own tables" ON black_market_tables
  FOR DELETE USING (creator_id = auth.uid()::text);

-- Black Market item'ları için RLS politikaları
CREATE POLICY "Users can view items from their tables" ON black_market_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM black_market_tables 
      WHERE id = black_market_items.table_id 
      AND creator_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert items to their tables" ON black_market_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM black_market_tables 
      WHERE id = black_market_items.table_id 
      AND creator_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update items in their tables" ON black_market_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM black_market_tables 
      WHERE id = black_market_items.table_id 
      AND creator_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete items from their tables" ON black_market_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM black_market_tables 
      WHERE id = black_market_items.table_id 
      AND creator_id = auth.uid()::text
    )
  );

-- Şehir fiyatları için RLS politikaları
CREATE POLICY "Users can view city prices from their items" ON city_prices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM black_market_items 
      JOIN black_market_tables ON black_market_items.table_id = black_market_tables.id
      WHERE city_prices.item_id = black_market_items.id 
      AND black_market_tables.creator_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert city prices to their items" ON city_prices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM black_market_items 
      JOIN black_market_tables ON black_market_items.table_id = black_market_tables.id
      WHERE city_prices.item_id = black_market_items.id 
      AND black_market_tables.creator_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update city prices in their items" ON city_prices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM black_market_items 
      JOIN black_market_tables ON black_market_items.table_id = black_market_tables.id
      WHERE city_prices.item_id = black_market_items.id 
      AND black_market_tables.creator_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete city prices from their items" ON city_prices
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM black_market_items 
      JOIN black_market_tables ON black_market_items.table_id = black_market_tables.id
      WHERE city_prices.item_id = black_market_items.id 
      AND black_market_tables.creator_id = auth.uid()::text
    )
  ); 