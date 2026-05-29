const pool = require('./db');
const readline = require('readline-sync');
const fs = require('fs');

async function main() {
    try {
        console.log('Choose region:');
        console.log('1. SPB: Saint Petersburg');
        console.log('2. MSK: Moscow');
        console.log('3. KRD: Krasnodar');

        const regionChoice = readline.question('Enter number: ');

        const regions = {
            1: 'spb',
            2: 'msk',
            3: 'krd'
        };

        if (!regions[regionChoice]) {
            console.log('Invalid region');
            return;
        }

        const region = regions[regionChoice];
        const priceColumn = `price_${region}`;

        const result = await pool.query(`
            SELECT products.id,
                   products.name,
                   categories.name AS category,
                   ${priceColumn} AS price
            FROM products
            JOIN categories
            ON products.category_id = categories.id
        `);

        const products = result.rows;

        console.log('\nAvailable materials:\n');

        products.forEach(p => {
            console.log(
                `${p.id}. ${p.name} | ${p.category} | ${p.price}`
            );
        });

        const productId =
            readline.question('\nSelect product ID: ');

        const selected =
            products.find(
                p => p.id == productId
            );

        if (!selected) {
            console.log('Invalid product');
            return;
        }

        console.log('\nYour order:');
        console.log(selected.name);
        console.log(`Price: ${selected.price}`);

        let confirm =
            readline.question(
                'Confirm order? (y/n): '
            );

        confirm = confirm.toLowerCase();

        if (confirm === 'y') {
            saveOrder(region, selected.name, selected.price);
            console.log('Order saved.');
            return;
        }

        const sameCategory =
            products.filter(
                p => p.category === selected.category
            );

        const cheapest =
            sameCategory.reduce(
                (min, p) =>
                    p.price < min.price ? p : min
            );

        let finalProduct = selected.name;
        let finalPrice = Number(selected.price);

        if (cheapest.id !== selected.id) {
            console.log('\nCheaper alternative found:');
            console.log(
                `${cheapest.name} - ${cheapest.price}`
            );

            const alt =
                readline.question(
                    'Accept alternative? (y/n): '
                );

            if (alt.toLowerCase() === 'y') {
                finalProduct = cheapest.name;
                finalPrice = Number(cheapest.price);
            }
        } else {
            finalPrice =
                (finalPrice * 0.95).toFixed(2);

            console.log(
                '\n5% discount available!'
            );
            console.log(
                `New price: ${finalPrice}`
            );
        }

        const finalConfirm =
            readline.question(
                'Confirm final offer? (y/n): '
            );

        if (finalConfirm.toLowerCase() === 'y') {
            saveOrder(
                region,
                finalProduct,
                finalPrice
            );
            console.log('Order saved.');
        } else {
            console.log('Order cancelled.');
        }

    } catch (err) {
        console.log(err.message);
    } finally {
        pool.end();
    }
}

function saveOrder(region, product, price) {

    if (!fs.existsSync('orders')) {
        fs.mkdirSync('orders');
    }

    const order = {
        region,
        product,
        price,
        date: new Date()
    };

    const fileName =
        `orders/order-${Date.now()}.json`;

    fs.writeFileSync(
        fileName,
        JSON.stringify(order, null, 2)
    );
}

main();