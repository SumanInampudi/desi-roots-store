import fs from 'fs';

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

// Sample expenses data
const expenses = [
  {
    id: "1",
    title: "Raw Materials - Spices",
    amount: 15000,
    category: "raw_materials",
    description: "Bulk purchase of red chillies and turmeric",
    date: "2025-01-15",
    paymentMethod: "Bank Transfer",
    vendor: "Spice Traders Ltd",
    createdAt: new Date("2025-01-15").toISOString(),
    updatedAt: new Date("2025-01-15").toISOString()
  },
  {
    id: "2",
    title: "Packaging Materials",
    amount: 8500,
    category: "packaging",
    description: "500g pouches and labels",
    date: "2025-01-20",
    paymentMethod: "Cash",
    vendor: "Pack Pro India",
    createdAt: new Date("2025-01-20").toISOString(),
    updatedAt: new Date("2025-01-20").toISOString()
  },
  {
    id: "3",
    title: "Electricity Bill",
    amount: 3200,
    category: "utilities",
    description: "Monthly electricity charges",
    date: "2025-02-05",
    paymentMethod: "Online",
    vendor: "State Electricity Board",
    createdAt: new Date("2025-02-05").toISOString(),
    updatedAt: new Date("2025-02-05").toISOString()
  },
  {
    id: "4",
    title: "Employee Salaries",
    amount: 45000,
    category: "salaries",
    description: "Monthly salaries for 3 employees",
    date: "2025-02-01",
    paymentMethod: "Bank Transfer",
    vendor: "Staff Payroll",
    createdAt: new Date("2025-02-01").toISOString(),
    updatedAt: new Date("2025-02-01").toISOString()
  },
  {
    id: "5",
    title: "Transportation Cost",
    amount: 5500,
    category: "logistics",
    description: "Delivery vehicle fuel and maintenance",
    date: "2025-02-10",
    paymentMethod: "Cash",
    vendor: "Local Transport",
    createdAt: new Date("2025-02-10").toISOString(),
    updatedAt: new Date("2025-02-10").toISOString()
  },
  {
    id: "6",
    title: "Marketing - Social Media Ads",
    amount: 12000,
    category: "marketing",
    description: "Facebook and Instagram advertising",
    date: "2025-02-15",
    paymentMethod: "Credit Card",
    vendor: "Meta Platforms",
    createdAt: new Date("2025-02-15").toISOString(),
    updatedAt: new Date("2025-02-15").toISOString()
  },
  {
    id: "7",
    title: "Rent - Warehouse",
    amount: 25000,
    category: "rent",
    description: "Monthly warehouse rent",
    date: "2025-03-01",
    paymentMethod: "Bank Transfer",
    vendor: "Property Management Co",
    createdAt: new Date("2025-03-01").toISOString(),
    updatedAt: new Date("2025-03-01").toISOString()
  },
  {
    id: "8",
    title: "Equipment Maintenance",
    amount: 6800,
    category: "maintenance",
    description: "Grinding machine repair and servicing",
    date: "2025-03-10",
    paymentMethod: "Cash",
    vendor: "Machine Service Co",
    createdAt: new Date("2025-03-10").toISOString(),
    updatedAt: new Date("2025-03-10").toISOString()
  },
  {
    id: "9",
    title: "Internet & Phone",
    amount: 2500,
    category: "utilities",
    description: "Monthly internet and phone bills",
    date: "2025-03-05",
    paymentMethod: "Online",
    vendor: "Telecom Provider",
    createdAt: new Date("2025-03-05").toISOString(),
    updatedAt: new Date("2025-03-05").toISOString()
  },
  {
    id: "10",
    title: "Office Supplies",
    amount: 3500,
    category: "office",
    description: "Stationery and printing materials",
    date: "2025-03-15",
    paymentMethod: "Cash",
    vendor: "Office Mart",
    createdAt: new Date("2025-03-15").toISOString(),
    updatedAt: new Date("2025-03-15").toISOString()
  }
];

// Add expenses to database
db.expenses = expenses;

// Write back to file
console.log('Writing expenses to database...');
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(`\n✅ Successfully added ${expenses.length} expenses!`);

// Calculate totals
const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
const byCategory = expenses.reduce((acc, exp) => {
  acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
  return acc;
}, {});

console.log('\nExpense Statistics:');
console.log(`  Total Expenses: ₹${totalExpenses.toLocaleString('en-IN')}`);
console.log('\nBy Category:');
Object.entries(byCategory).forEach(([cat, amount]) => {
  console.log(`  ${cat}: ₹${amount.toLocaleString('en-IN')}`);
});

console.log('\nYou can now restart your JSON server to see the expenses!');

