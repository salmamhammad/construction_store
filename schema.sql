DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS areas;

CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT REFERENCES categories(id),
    area_id INT REFERENCES areas(id),
    price NUMERIC(10,2) NOT NULL
);

INSERT INTO areas(name) VALUES
('SPB'),
('MSK'),
('KRD');

INSERT INTO categories(name) VALUES
('Insulation'),
('Aerated Concrete'),
('Cement'),
('Drywall'),
('Brick');

INSERT INTO products(name, category_id, area_id, price) VALUES
('Rockwool Scandic 50mm', 1, 1, 1075),
('Knauf Insulation 50mm', 1, 2, 900),
('Isover Warm House 50mm', 1, 3, 850),

('Aerated Concrete D400 SK', 2, 1, 450),
('Aerated Concrete D400 LSR', 2, 2, 430),

('Cement M500 50kg', 3, 1, 390),
('Cement Euro 50kg', 3, 2, 360),

('Drywall Knauf 12mm', 4, 1, 520),
('Drywall Gyproc 12mm', 4, 2, 500),

('Brick Red Standard', 5, 1, 25);