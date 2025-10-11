# API Documentation - Desi Roots E-commerce

This project uses **JSON Server** to provide a RESTful API for development. This setup allows you to implement features like user authentication, order management, and more.

## 🚀 Getting Started

### Start the Development Servers

```bash
npm run dev
```

This command starts both:
- **Vite Dev Server** on `http://localhost:5173` (Frontend)
- **JSON Server API** on `http://localhost:3001` (Backend API)

### Start Servers Separately

```bash
# Start only the frontend
npm run dev:vite

# Start only the API server
npm run dev:api
```

## 📡 API Endpoints

Base URL: `http://localhost:3001`

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products |
| GET | `/products/:id` | Get a single product |
| POST | `/products` | Create a new product |
| PUT | `/products/:id` | Update a product |
| PATCH | `/products/:id` | Partially update a product |
| DELETE | `/products/:id` | Delete a product |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get a single user |
| POST | `/users` | Register a new user |
| PUT | `/users/:id` | Update user details |
| DELETE | `/users/:id` | Delete a user |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | Get all orders |
| GET | `/orders/:id` | Get a single order |
| POST | `/orders` | Create a new order |
| PUT | `/orders/:id` | Update order status |
| DELETE | `/orders/:id` | Cancel/delete an order |

### Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reviews` | Get all reviews |
| GET | `/reviews/:id` | Get a single review |
| POST | `/reviews` | Add a new review |
| PUT | `/reviews/:id` | Update a review |
| DELETE | `/reviews/:id` | Delete a review |

### Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart` | Get cart items |
| POST | `/cart` | Add item to cart |
| DELETE | `/cart/:id` | Remove item from cart |

## 🔍 Query Parameters

JSON Server supports powerful filtering, sorting, and pagination:

### Filter

```bash
# Get products by category
GET /products?category=powder

# Get products in stock
GET /products?inStock=true

# Multiple filters
GET /products?category=karam&inStock=true
```

### Sort

```bash
# Sort by price ascending
GET /products?_sort=price&_order=asc

# Sort by price descending
GET /products?_sort=price&_order=desc

# Sort by multiple fields
GET /products?_sort=category,price&_order=asc,desc
```

### Pagination

```bash
# Get first 10 products
GET /products?_page=1&_limit=10

# Get products 11-20
GET /products?_page=2&_limit=10
```

### Search

```bash
# Full-text search in all fields
GET /products?q=chilli

# Search in specific field
GET /products?name_like=powder
```

### Relationships

```bash
# Get user with their orders
GET /users/1?_embed=orders

# Get order with user details
GET /orders/1?_expand=user
```

## 📝 Example API Calls

### JavaScript/React Examples

```javascript
// Get all products
const response = await fetch('http://localhost:3001/products');
const products = await response.json();

// Get a single product
const product = await fetch('http://localhost:3001/products/1');
const data = await product.json();

// Create a new product
const newProduct = await fetch('http://localhost:3001/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Garam Masala',
    price: '280',
    weight: '500gm',
    description: 'Aromatic spice blend',
    image: '/garam-masala.jpeg',
    inStock: true,
    category: 'powder'
  })
});

// Update a product
await fetch('http://localhost:3001/products/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ...existingProduct,
    price: '300' // Update price
  })
});

// Delete a product
await fetch('http://localhost:3001/products/1', {
  method: 'DELETE'
});
```

### Create a New Order

```javascript
const newOrder = {
  userId: 2,
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhone: "+919876543210",
  items: [
    {
      productId: 1,
      productName: "Plain Chilli Powder",
      quantity: 2,
      price: "250"
    }
  ],
  totalAmount: "500",
  status: "pending",
  shippingAddress: {
    street: "123 Main St",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001"
  },
  createdAt: new Date().toISOString()
};

const response = await fetch('http://localhost:3001/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(newOrder)
});
```

## 🔐 Future: Adding Authentication

The current setup has a basic user structure. You can extend it with authentication:

### Option 1: JSON Server Auth (Simple)
```bash
npm install json-server-auth
```

### Option 2: Custom Backend (Production)
For production, consider migrating to:
- **Node.js + Express** with JWT authentication
- **Firebase** for authentication and database
- **Supabase** for PostgreSQL database and auth
- **MongoDB + Mongoose** for NoSQL approach

## 🗄️ Database File

All data is stored in `db.json` at the project root. You can:
- Edit it directly to modify data
- Use the API to make changes (automatically saved)
- Reset to defaults by restoring from backup

### Backup Your Data

```bash
# Create a backup
cp db.json db.backup.json

# Restore from backup
cp db.backup.json db.json
```

## 🔧 Advanced Configuration

### Custom Routes

Create `routes.json`:

```json
{
  "/api/*": "/$1",
  "/products/:category": "/products?category=:category"
}
```

Then run:
```bash
json-server --watch db.json --routes routes.json --port 3001
```

### Middleware

For custom logic, create `middleware.js` and use it with JSON Server.

## 📚 Next Steps for Full Backend

### Implementing User Authentication

1. **Registration**: POST to `/users` with password hashing
2. **Login**: Check credentials and return JWT token
3. **Protected Routes**: Verify JWT before allowing access
4. **Sessions**: Store user sessions

### Order Management

1. **Place Order**: POST to `/orders` from cart
2. **Track Order**: GET `/orders?userId=X`
3. **Update Status**: Admin can PATCH `/orders/:id`
4. **Email Notifications**: Integrate email service

### Product Management (Admin)

1. **Add Product**: POST `/products` (admin only)
2. **Update Inventory**: PATCH `/products/:id`
3. **Delete Product**: DELETE `/products/:id`
4. **Upload Images**: Implement file upload

## 🚀 Deployment Note

**JSON Server is for development only.** For production:
1. Build a real backend (Node.js/Express, Python/Django, etc.)
2. Use a real database (PostgreSQL, MongoDB, MySQL)
3. Implement proper authentication and authorization
4. Add input validation and security measures

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use a different port
json-server --watch db.json --port 3002
```

### CORS Issues

JSON Server has CORS enabled by default. If you face issues:

```bash
json-server --watch db.json --port 3001 --host 0.0.0.0
```

## 📖 Resources

- [JSON Server Documentation](https://github.com/typicode/json-server)
- [RESTful API Design](https://restfulapi.net/)
- [JWT Authentication](https://jwt.io/)

