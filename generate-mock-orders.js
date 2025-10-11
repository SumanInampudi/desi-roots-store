import fs from 'fs';

// Products available
const products = [
  { id: "1", name: "Plain Chilli Powder", price: "250", weight: "500gm" },
  { id: "2", name: "Curry Powder", price: "200", weight: "500gm" },
  { id: "3", name: "Kobbari Karam", price: "300", weight: "500gm" },
  { id: "4", name: "Nalla Karam", price: "280", weight: "500gm" },
  { id: "5", name: "Turmeric Root Powder", price: "250", weight: "500gm" }
];

// Order statuses with their probabilities
const statuses = [
  { name: "delivered", weight: 50 },  // 50% delivered
  { name: "shipped", weight: 20 },    // 20% shipped
  { name: "processing", weight: 15 }, // 15% processing
  { name: "pending", weight: 10 },    // 10% pending
  { name: "cancelled", weight: 5 }    // 5% cancelled
];

// Customer names (Indian names)
const firstNames = [
  "Rajesh", "Priya", "Amit", "Sneha", "Vijay", "Anita", "Suresh", "Divya",
  "Kiran", "Lakshmi", "Ravi", "Pooja", "Arun", "Meera", "Sandeep", "Kavita",
  "Mohan", "Shalini", "Prakash", "Neha", "Ganesh", "Swati", "Dinesh", "Nisha",
  "Kumar", "Rani", "Mahesh", "Asha", "Venkat", "Deepa", "Ramesh", "Geetha",
  "Sanjay", "Madhuri", "Naresh", "Saritha", "Kishore", "Sridevi", "Murthy", "Padma"
];

const lastNames = [
  "Kumar", "Sharma", "Reddy", "Patel", "Singh", "Rao", "Gupta", "Nair",
  "Iyer", "Menon", "Verma", "Joshi", "Naidu", "Chopra", "Bhatia", "Mehta",
  "Agarwal", "Malhotra", "Pillai", "Desai", "Kulkarni", "Shetty", "Kapoor", "Goyal"
];

// Indian cities
const cities = [
  { name: "Mumbai", state: "Maharashtra" },
  { name: "Delhi", state: "Delhi" },
  { name: "Bangalore", state: "Karnataka" },
  { name: "Hyderabad", state: "Telangana" },
  { name: "Chennai", state: "Tamil Nadu" },
  { name: "Kolkata", state: "West Bengal" },
  { name: "Pune", state: "Maharashtra" },
  { name: "Ahmedabad", state: "Gujarat" },
  { name: "Jaipur", state: "Rajasthan" },
  { name: "Lucknow", state: "Uttar Pradesh" },
  { name: "Kochi", state: "Kerala" },
  { name: "Visakhapatnam", state: "Andhra Pradesh" },
  { name: "Nagpur", state: "Maharashtra" },
  { name: "Indore", state: "Madhya Pradesh" },
  { name: "Coimbatore", state: "Tamil Nadu" }
];

// Helper functions
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomElement = (arr) => arr[randomInt(0, arr.length - 1)];

const weightedRandomStatus = () => {
  const totalWeight = statuses.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const status of statuses) {
    random -= status.weight;
    if (random <= 0) return status.name;
  }
  return statuses[0].name;
};

const generatePhoneNumber = () => {
  return `+91${randomInt(7000000000, 9999999999)}`;
};

const generatePincode = () => {
  return `${randomInt(100000, 999999)}`;
};

const generateEmail = (name) => {
  const cleanName = name.toLowerCase().replace(/\s+/g, '');
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  return `${cleanName}${randomInt(1, 999)}@${randomElement(domains)}`;
};

// Generate a random date within the last year
const generateOrderDate = () => {
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  
  const timestamp = oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime());
  return new Date(timestamp);
};

// Generate updated date based on status
const generateUpdatedDate = (createdAt, status) => {
  const created = new Date(createdAt);
  const now = new Date();
  
  switch (status) {
    case 'pending':
      // Pending orders: 30% are overdue (> 2 days old), 70% are recent
      if (Math.random() < 0.3) {
        // Overdue: 3-10 days ago
        const daysAgo = randomInt(3, 10);
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        return date;
      } else {
        // Recent: 0-2 days ago
        const hoursAgo = randomInt(0, 48);
        const date = new Date(now);
        date.setHours(date.getHours() - hoursAgo);
        return date;
      }
    
    case 'processing':
      // Processing orders: 25% overdue, 75% recent
      if (Math.random() < 0.25) {
        const daysAgo = randomInt(3, 7);
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        return date;
      } else {
        const hoursAgo = randomInt(1, 48);
        const date = new Date(created);
        date.setHours(date.getHours() + hoursAgo);
        return date;
      }
    
    case 'shipped':
      // Shipped orders: 20% overdue, 80% normal
      if (Math.random() < 0.2) {
        const daysAgo = randomInt(3, 8);
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        return date;
      } else {
        const daysAfter = randomInt(1, 2);
        const date = new Date(created);
        date.setDate(date.getDate() + daysAfter);
        return date;
      }
    
    case 'delivered':
      // Delivered orders: completed 3-30 days after creation
      const daysAfter = randomInt(3, 30);
      const date = new Date(created);
      date.setDate(date.getDate() + daysAfter);
      return date < now ? date : created;
    
    case 'cancelled':
      // Cancelled: 1-5 days after creation
      const cancelDays = randomInt(1, 5);
      const cancelDate = new Date(created);
      cancelDate.setDate(cancelDate.getDate() + cancelDays);
      return cancelDate < now ? cancelDate : created;
    
    default:
      return created;
  }
};

// Generate order items (1-4 products)
const generateOrderItems = () => {
  const itemCount = randomInt(1, 4);
  const selectedProducts = [];
  const usedIds = new Set();
  
  for (let i = 0; i < itemCount; i++) {
    let product;
    do {
      product = randomElement(products);
    } while (usedIds.has(product.id) && usedIds.size < products.length);
    
    usedIds.add(product.id);
    
    selectedProducts.push({
      productId: product.id,
      productName: product.name,
      quantity: randomInt(1, 5),
      price: product.price,
      weight: product.weight
    });
  }
  
  return selectedProducts;
};

// Calculate total amount
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + (parseInt(item.price) * item.quantity), 0);
};

// Generate a single order
const generateOrder = (id) => {
  const firstName = randomElement(firstNames);
  const lastName = randomElement(lastNames);
  const fullName = `${firstName} ${lastName}`;
  const city = randomElement(cities);
  const status = weightedRandomStatus();
  const createdAt = generateOrderDate();
  const updatedAt = generateUpdatedDate(createdAt, status);
  const items = generateOrderItems();
  
  return {
    id: id.toString(),
    userId: randomInt(1, 100).toString(),
    customerName: fullName,
    customerEmail: generateEmail(fullName),
    customerPhone: generatePhoneNumber(),
    items: items,
    totalAmount: calculateTotal(items),
    paymentMethod: "Cash on Delivery",
    status: status,
    shippingAddress: {
      addressLine1: `${randomInt(1, 999)} ${randomElement(['MG Road', 'Brigade Road', 'Main Street', 'Park Avenue', 'Gandhi Nagar', 'Nehru Street', 'Market Road'])}`,
      addressLine2: Math.random() > 0.5 ? `Near ${randomElement(['Bus Stop', 'Metro Station', 'Park', 'Temple', 'Mall', 'Hospital'])}` : "",
      city: city.name,
      state: city.state,
      pincode: generatePincode()
    },
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString()
  };
};

// Generate all orders
console.log('Generating 1000 mock orders...');
const orders = [];
for (let i = 1; i <= 1000; i++) {
  orders.push(generateOrder(i));
  if (i % 100 === 0) {
    console.log(`Generated ${i} orders...`);
  }
}

// Read existing db.json
console.log('Reading existing database...');
const dbPath = './db.json';
let db;

try {
  const dbContent = fs.readFileSync(dbPath, 'utf8');
  db = JSON.parse(dbContent);
} catch (error) {
  console.error('Error reading db.json:', error);
  process.exit(1);
}

// Replace orders
db.orders = orders;

// Write back to file
console.log('Writing to database...');
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log('\n✅ Successfully generated 1000 mock orders!');
console.log('\nOrder Statistics:');
const statusCounts = orders.reduce((acc, order) => {
  acc[order.status] = (acc[order.status] || 0) + 1;
  return acc;
}, {});

Object.entries(statusCounts).forEach(([status, count]) => {
  console.log(`  ${status}: ${count} orders (${(count/10).toFixed(1)}%)`);
});

console.log(`\nTotal Revenue: ₹${orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString('en-IN')}`);
console.log('\nYou can now restart your JSON server to see the new data!');

