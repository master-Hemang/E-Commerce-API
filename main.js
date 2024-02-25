// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Database connection
const sequelize = new Sequelize('your_database_name', 'your_username', 'your_password', {
  host: 'localhost',
  dialect: 'postgres',
});

// Define models for Category, Product, User, Cart, and Order
const Category = sequelize.define('Category', {
  name: { type: DataTypes.STRING, allowNull: false },
});

const Product = sequelize.define('Product', {
  title: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  availability: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
});

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});

const Cart = sequelize.define('Cart', {
  quantity: { type: DataTypes.INTEGER, allowNull: false },
});

const Order = sequelize.define('Order', {
  // Order details
});

// Define relationships between models
Category.hasMany(Product);
Product.belongsTo(Category);

User.hasMany(Cart);
Cart.belongsTo(User);

Product.hasMany(Cart);
Cart.belongsTo(Product);

User.hasMany(Order);
Order.belongsTo(User);

// API routes

// User Registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ userId: user.id, username: user.username });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed. Please try again.' });
  }
});

// User Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user || !await bcrypt.compare(password, user.password)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, 'your-secret-key', { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware for JWT authentication
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized. Token not provided.' });
    return;
  }

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) {
      res.status(401).json({ error: 'Unauthorized. Invalid token.' });
      return;
    }

    req.userId = user.userId;
    next();
  });
};

// Protected API routes

// Category Listing
app.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Product Listing
app.get('/products/:categoryId', async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    const products = await Product.findAll({ where: { CategoryId: categoryId } });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Product Details
app.get('/product/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cart Management
app.post('/cart', authenticateUser, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.userId;

  try {
    const cartItem = await Cart.create({ ProductId: productId, UserId: userId, quantity });
    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/cart', authenticateUser, async (req, res) => {
  const userId = req.userId;

  try {
    const cartItems = await Cart.findAll({ where: { UserId: userId } });
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/cart/:cartItemId', authenticateUser, async (req, res) => {
  const cartItemId = req.params.cartItemId;
  const { quantity } = req.body;

  try {
    const cartItem = await Cart.findByPk(cartItemId);
    if (!cartItem) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json(cartItem);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/cart/:cartItemId', authenticateUser, async (req, res) => {
  const cartItemId = req.params.cartItemId;

  try {
    const cartItem = await Cart.findByPk(cartItemId);
    if (!cartItem) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    await cartItem.destroy();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Order Placement
app.post('/orders', authenticateUser, async (req, res) => {
  const userId = req.userId;

  try {
    // Get user's cart items
    const cartItems = await Cart.findAll({ where: { UserId: userId } });

    // Create order with cart items
    const order = await Order.create({ UserId: userId });

    // Move cart items to order items
    for (const cartItem of cartItems) {
      await order.createOrderItem({
        ProductId: cartItem.ProductId,
        quantity: cartItem.quantity,
      });

      await cartItem.destroy();
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Order History
app.get('/orders', authenticateUser, async (req, res) => {
  const userId = req.userId;

  try {
    const orders = await Order.findAll({ where: { UserId: userId } });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Order Details
app.get('/orders/:orderId', authenticateUser, async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const order = await Order.findByPk(orderId, { include: 'OrderItems' });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
