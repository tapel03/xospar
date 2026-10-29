CREATE TABLE IF NOT EXISTS assets (
  sym             text PRIMARY KEY,
  name            text NOT NULL,
  category        text NOT NULL,
  decimals        integer NOT NULL,
  quote_provider  text,
  quote_symbol    text,
  candle_routes   jsonb NOT NULL DEFAULT '[]',
  enabled         boolean NOT NULL DEFAULT true
);
