const pool = require('./db');
const readline = require('readline-sync');
const fs = require('fs');

async function main() {
    try {
        // 1. Отображение регионов (из базы данных)
        const areasRes = await pool.query(`SELECT * FROM areas ORDER BY id`);
        const areas = areasRes.rows;

        console.log("\n=== SELECT AREA ===\n");

        areas.forEach(a => {
            console.log(`${a.id}. ${a.name}`);
        });

        const areaId = readline.question("\nEnter area ID: ");
        const selectedArea = areas.find(a => a.id == areaId);

        if (!selectedArea) {
            console.log(" Invalid area selected");
            return;
        }

        // 2. Скачать продукты по регионам
        const productsRes = await pool.query(`
            SELECT 
                p.id,
                p.name,
                p.price,
                c.name AS category
            FROM products p
            JOIN categories c ON c.id = p.category_id
            WHERE p.area_id = $1
            ORDER BY p.id
        `, [areaId]);

        const products = productsRes.rows;

        if (products.length === 0) {
            console.log(" No products found in this area");
            return;
        }

        console.log(`\n=== PRODUCTS IN ${selectedArea.name} ===\n`);

        products.forEach(p => {
            console.log(`${p.id}. ${p.name} | ${p.category} | ${p.price}`);
        });

        // 3. Выберите товар
        const productId = readline.question("\nSelect product ID: ");
        const selected = products.find(p => p.id == productId);

        if (!selected) {
            console.log(" Invalid product selected");
            return;
        }

        console.log("\n=== YOUR ORDER ===");
        console.log(`Product: ${selected.name}`);
        console.log(`Category: ${selected.category}`);
        console.log(`Price: ${selected.price}`);

        let confirm = readline.question("\nConfirm order? (y/n): ");

        // 4. IF CONFIRMED -> SAVE
        if (confirm.toLowerCase() === 'y') {
            saveOrder(selectedArea.name, selected, selected.price);
            console.log(" Order saved successfully!");
            return;
        }

        // 5.  IF n
        console.log("\n Order not confirmed. Applying retention logic...\n");

        const sameCategory = products.filter(
            p => p.category === selected.category
        );

        const cheapest = sameCategory.reduce((min, p) =>
            Number(p.price) < Number(min.price) ? p : min
        );

        let finalProduct = selected.name;
        let finalPrice = Number(selected.price);

        // CASE 1: Существует более дешевая альтернатива.
        if (cheapest.id != selected.id) {
            console.log(" Cheaper alternative found in same area/category:");
            console.log(`${cheapest.name} | ${cheapest.price}`);

            const alt = readline.question("\nAccept alternative? (y/n): ");

            if (alt.toLowerCase() === 'y') {
                finalProduct = cheapest.name;
                finalPrice = Number(cheapest.price);
            }
        }

        // CASE 2: Уже самая низкая цена -> применить скидку
        else {
            finalPrice = (finalPrice * 0.95).toFixed(2);

            console.log("\n You already selected the cheapest option!");
            console.log(" 5% discount applied");
            console.log(`New price: ${finalPrice}`);
        }

        // 6. Окончательное подтверждение
        const finalConfirm = readline.question("\nConfirm final offer? (y/n): ");

        if (finalConfirm.toLowerCase() === 'y') {
            saveOrder(selectedArea.name, selected, finalPrice);
            console.log(" Final order saved!");
        } else {
            console.log(" Order cancelled");
        }

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await pool.end();
    }
}

// сохранениe запроса в JSON-файл
function saveOrder(area, product, price) {
    if (!fs.existsSync('orders')) {
        fs.mkdirSync('orders');
    }

    const order = {
        area,
        product: product.name,
        category: product.category,
        price,
        date: new Date().toISOString()
    };

    const fileName = `orders/order-${Date.now()}.json`;

    fs.writeFileSync(fileName, JSON.stringify(order, null, 2));
}

main();