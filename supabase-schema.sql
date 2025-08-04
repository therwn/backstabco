-- Drop existing tables if they exist
DROP TABLE IF EXISTS city_prices;
DROP TABLE IF EXISTS black_market_items;
DROP TABLE IF EXISTS black_market_tables;

-- Create black_market_tables
CREATE TABLE black_market_tables (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    password TEXT,
    creator_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create black_market_items
CREATE TABLE black_market_items (
    id SERIAL PRIMARY KEY,
    table_id INTEGER REFERENCES black_market_tables(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    item_tier INTEGER NOT NULL,
    item_enchantment INTEGER NOT NULL,
    item_quality INTEGER NOT NULL,
    buy_price INTEGER NOT NULL,
    buy_quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create city_prices
CREATE TABLE city_prices (
    id SERIAL PRIMARY KEY,
    table_id INTEGER REFERENCES black_market_tables(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    city TEXT NOT NULL,
    sell_order INTEGER NOT NULL,
    buy_order INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_black_market_tables_creator_id ON black_market_tables(creator_id);
CREATE INDEX idx_black_market_items_table_id ON black_market_items(table_id);
CREATE INDEX idx_city_prices_table_id ON city_prices(table_id);
CREATE INDEX idx_city_prices_item_id ON city_prices(item_id);

-- Enable Row Level Security
ALTER TABLE black_market_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE black_market_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_prices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for black_market_tables
CREATE POLICY "Users can view all tables" ON black_market_tables
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own tables" ON black_market_tables
    FOR INSERT WITH CHECK (creator_id = (auth.jwt() ->> 'discordId'));

CREATE POLICY "Users can update their own tables" ON black_market_tables
    FOR UPDATE USING (creator_id = (auth.jwt() ->> 'discordId'));

CREATE POLICY "Users can delete their own tables" ON black_market_tables
    FOR DELETE USING (creator_id = (auth.jwt() ->> 'discordId'));

-- RLS Policies for black_market_items
CREATE POLICY "Users can view all items" ON black_market_items
    FOR SELECT USING (true);

CREATE POLICY "Users can insert items for their tables" ON black_market_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM black_market_tables 
            WHERE id = table_id 
            AND creator_id = (auth.jwt() ->> 'discordId')
        )
    );

CREATE POLICY "Users can update items for their tables" ON black_market_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM black_market_tables 
            WHERE id = table_id 
            AND creator_id = (auth.jwt() ->> 'discordId')
        )
    );

CREATE POLICY "Users can delete items for their tables" ON black_market_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM black_market_tables 
            WHERE id = table_id 
            AND creator_id = (auth.jwt() ->> 'discordId')
        )
    );

-- RLS Policies for city_prices
CREATE POLICY "Users can view all city prices" ON city_prices
    FOR SELECT USING (true);

CREATE POLICY "Users can insert city prices for their tables" ON city_prices
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM black_market_tables 
            WHERE id = table_id 
            AND creator_id = (auth.jwt() ->> 'discordId')
        )
    );

CREATE POLICY "Users can update city prices for their tables" ON city_prices
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM black_market_tables 
            WHERE id = table_id 
            AND creator_id = (auth.jwt() ->> 'discordId')
        )
    );

CREATE POLICY "Users can delete city prices for their tables" ON city_prices
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM black_market_tables 
            WHERE id = table_id 
            AND creator_id = (auth.jwt() ->> 'discordId')
        )
    ); 