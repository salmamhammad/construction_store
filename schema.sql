CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT REFERENCES categories(id),
    price_spb NUMERIC(10,2),
    price_msk NUMERIC(10,2),
    price_krd NUMERIC(10,2)
);

INSERT INTO categories(name) VALUES
('Insulation'),
('Aerated Concrete'),
('Cement'),
('Drywall'),
('Brick');

INSERT INTO products
(name, category_id, price_spb, price_msk, price_krd)
VALUES
('Rockwool Scandic 50mm',1,1075,1100,950),
('Knauf TeploKnauf 50mm',1,860,900,1300),
('Aerated Concrete SK D400',2,450,430,420),
('Aerated Concrete LSR D400',2,580,550,580),
('Cement M500 50kg',3,390,400,380),
('Cement Euro 50kg',3,350,360,340),
('Drywall Knauf 12mm',4,520,500,480),
('Drywall Gyproc 12mm',4,490,510,470),
('Brick Red Standard',5,25,27,24),
('Brick Ceramic Premium',5,35,38,32);