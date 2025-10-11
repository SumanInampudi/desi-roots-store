import fs from 'fs';

// Calculate shipping charges
const calculateShipping = (subtotal) => {
  if (subtotal >= 1000) {
    return 0; // Free shipping
  } else if (subtotal >= 500) {
    return Math.round(subtotal * 0.05); // 5% of subtotal
  } else {
    return 50; // Flat ₹50
  }
};

console.log('Reading database...');
const dbPath = './db.json';
let db;

try {
  const dbContent = fs.readFileSync(dbPath, 'utf8');
  db = JSON.parse(dbContent);
} catch (error) {
  console.error('Error reading db.json:', error);
  process.exit(1);
}

console.log(`Found ${db.orders.length} orders to update...\n`);

// Update each order
let updated = 0;
db.orders = db.orders.map((order, index) => {
  // If order already has shipping charges, skip it
  if (order.hasOwnProperty('shippingCharges')) {
    return order;
  }

  // Calculate values
  const subtotal = order.totalAmount || 0; // Original totalAmount is now subtotal
  const shippingCharges = calculateShipping(subtotal);
  const totalAmount = subtotal + shippingCharges;
  const profit = Math.round(subtotal * 0.30); // 30% profit margin

  updated++;
  if (updated % 100 === 0) {
    console.log(`Updated ${updated} orders...`);
  }

  return {
    ...order,
    subtotal: subtotal,
    shippingCharges: shippingCharges,
    totalAmount: totalAmount,
    profit: profit
  };
});

// Write back to file
console.log('\nWriting updated data to database...');
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(`\n✅ Successfully updated ${updated} orders!`);

// Calculate statistics
const totalShipping = db.orders.reduce((sum, order) => sum + (order.shippingCharges || 0), 0);
const totalProfit = db.orders.reduce((sum, order) => {
  if (order.status !== 'cancelled') {
    return sum + (order.profit || 0);
  }
  return sum;
}, 0);
const freeShippingCount = db.orders.filter(order => order.shippingCharges === 0).length;

console.log('\nStatistics:');
console.log(`  Total Shipping Collected: ₹${totalShipping.toLocaleString('en-IN')}`);
console.log(`  Total Profit: ₹${totalProfit.toLocaleString('en-IN')}`);
console.log(`  Free Shipping Orders: ${freeShippingCount} (${(freeShippingCount/db.orders.length*100).toFixed(1)}%)`);
console.log(`  Orders with ₹50 flat shipping: ${db.orders.filter(o => o.shippingCharges === 50).length}`);
console.log(`  Orders with 5% shipping: ${db.orders.filter(o => o.shippingCharges > 0 && o.shippingCharges !== 50).length}`);

console.log('\nYou can now restart your JSON server to see the updated data!');

