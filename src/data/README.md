# Product Management Guide

This folder contains the product catalog for your Desi Roots E-commerce store.

## How to Manage Products

All products are stored in `products.json`. To add, edit, or remove products, simply modify this file.

### Product Structure

Each product has the following fields:

```json
{
  "id": 1,                              // Unique ID (number)
  "name": "Product Name",               // Display name
  "price": "250",                       // Price in rupees (string)
  "weight": "500gm",                    // Package weight
  "description": "Product description", // Full description
  "image": "/image-path.jpeg",         // Path to image in /public folder
  "searchKeywords": ["keyword1", "keyword2"], // Search terms
  "features": [                         // Product features
    {
      "text": "Feature Name",
      "icon": "Leaf",                   // Icon name: Leaf, Shield, Award, or Star
      "color": "bg-green-100 text-green-800" // Tailwind color classes
    }
  ]
}
```

### Available Icons

- `Leaf` - For natural/organic features
- `Shield` - For quality/protection features
- `Award` - For premium/quality features
- `Star` - For special/highlighted features

### Available Colors

Use these Tailwind color combinations:
- `bg-green-100 text-green-800` - Green theme
- `bg-blue-100 text-blue-800` - Blue theme
- `bg-purple-100 text-purple-800` - Purple theme
- `bg-amber-100 text-amber-800` - Amber/yellow theme
- `bg-red-100 text-red-800` - Red theme
- `bg-orange-100 text-orange-800` - Orange theme
- `bg-yellow-100 text-yellow-800` - Yellow theme

### How to Add a New Product

1. Open `products.json`
2. Copy an existing product object
3. Update the `id` to be unique (next number in sequence)
4. Update all fields with your new product information
5. Add the product image to the `/public` folder
6. Save the file
7. The website will automatically reload and show the new product!

### How to Edit a Product

1. Open `products.json`
2. Find the product by its `id` or `name`
3. Update any field you want to change
4. Save the file
5. Changes appear automatically!

### How to Remove a Product

1. Open `products.json`
2. Delete the entire product object (including the curly braces)
3. Make sure to remove any trailing commas
4. Save the file

### Tips

- Images should be placed in the `/public` folder
- Keep image file sizes reasonable (compress if needed)
- Search keywords help customers find products
- Use 2-4 features per product for best display
- Test your changes locally before deploying

### Example: Adding a New Spice

```json
{
  "id": 6,
  "name": "Garam Masala",
  "price": "280",
  "weight": "500gm",
  "description": "Aromatic blend of warming spices perfect for curries and traditional dishes.",
  "image": "/garam-masala.jpeg",
  "searchKeywords": ["garam", "masala", "warm", "spices", "blend", "curry"],
  "features": [
    {
      "text": "Premium Blend",
      "icon": "Star",
      "color": "bg-amber-100 text-amber-800"
    },
    {
      "text": "100% Natural",
      "icon": "Leaf",
      "color": "bg-green-100 text-green-800"
    },
    {
      "text": "Traditional Recipe",
      "icon": "Award",
      "color": "bg-purple-100 text-purple-800"
    },
    {
      "text": "No Additives",
      "icon": "Shield",
      "color": "bg-blue-100 text-blue-800"
    }
  ]
}
```

Remember: After making changes, commit and push to GitHub, and Netlify will automatically redeploy your site!

