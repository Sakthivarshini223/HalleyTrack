const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// --- 1. USER MODEL ---
const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'customer'), defaultValue: 'customer' }
}, { tableName: 'users' });

// --- 2. ORDER MODEL (Updated with all fields from Cart) ---
const Order = sequelize.define('Order', {
  id: { 
    type: DataTypes.BIGINT, 
    primaryKey: true, 
    autoIncrement: true 
  },
  user_id: { 
    type: DataTypes.BIGINT, 
    allowNull: true 
  }, 
  total_amount: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  },
  status: { 
    type: DataTypes.STRING, 
    defaultValue: 'Pending' 
  },
  
 
  first_name: { type: DataTypes.STRING },
  last_name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, allowNull: true },
  phone_number: { type: DataTypes.STRING },


  product_name: { 
    type: DataTypes.STRING, 
    defaultValue: 'Nexus Equipment' 
  },
  quantity: { 
    type: DataTypes.INTEGER, 
    defaultValue: 1 
  },

  
  street_address: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
  state: { type: DataTypes.STRING },
  postal_code: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING },
  
  
  created_by: { type: DataTypes.STRING, defaultValue: 'System' },
  order_date: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  }
}, { 
  tableName: 'orders', 
  timestamps: false 
});

// --- 3. PRODUCT MODEL ---
const Product = sequelize.define('Product', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  category: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  image_url: { type: DataTypes.TEXT('long') }
}, { tableName: 'products' });

// --- 4. ORDER ITEM MODEL (For deep reporting) ---
const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.BIGINT, allowNull: false },
  product_id: { type: DataTypes.BIGINT, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  price_at_purchase: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { tableName: 'order_items', timestamps: false });


User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

// Link Orders to Products via OrderItems 
Order.belongsToMany(Product, { through: OrderItem, foreignKey: 'order_id' });
Product.belongsToMany(Order, { through: OrderItem, foreignKey: 'product_id' });

// Direct access to OrderItems 
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

module.exports = { sequelize, User, Product, Order, OrderItem };