const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  sequelize,
  Product,
  Order,
  User,
  OrderItem,
} = require("./models/index");

const app = express();
const JWT_SECRET = "HALLY_TRACK_SECRET_ALPHA_9";

app.use(express.json({ limit: "50mb" }));
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- STATUS UPDATE ENDPOINT (NEW) ---
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const order = await Order.findByPk(orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ success: true, message: `Status updated to ${status}`, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- REMAINING ROUTES ---
app.get("/api/status", (req, res) => {
  res.json({ status: "ONLINE", system: "HALLY_TRACK_UPLINK" });
});

app.post("/api/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.create({
      name: name || email.split("@")[0],
      email,
      password: hashedPassword,
      role: role || "customer",
    });
    res
      .status(201)
      .json({ success: true, message: "Identity Uplink Successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "24h",
    });
    res.json({
      success: true,
      token,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.findAll({ order: [["id", "DESC"]] });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Fetch Failed" });
  }
});

app.post("/api/orders", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      email,
      totalAmount,
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
      items,
      product_name,
      quantity,
    } = req.body;
    const user = await User.findOne({ where: { email: email || "" } });
    const newOrder = await Order.create(
      {
        user_id: user ? user.id : null,
        total_amount: totalAmount || req.body.total_amount,
        status: req.body.status || "Pending",
        order_date: new Date(),
        first_name: firstName || req.body.first_name,
        last_name: lastName || req.body.last_name,
        email: email || req.body.email,
        phone_number: phone || req.body.phone_number,
        street_address: address || req.body.street_address,
        city: city || req.body.city,
        state: state || req.body.state,
        postal_code: postalCode || req.body.postal_code,
        country: country || req.body.country,
        product_name:
          product_name ||
          (items && items.length > 0 ? items[0].name : "System Order"),
        quantity: quantity || (items && items.length > 0 ? items.length : 1),
      },
      { transaction: t }
    );
    if (items && items.length > 0) {
      const itemsToCreate = items.map((item) => ({
        order_id: newOrder.id,
        product_id: item.product_id,
        quantity: item.quantity || 1,
        price_at_purchase: item.price,
      }));
      await OrderItem.bulkCreate(itemsToCreate, { transaction: t });
    }
    await t.commit();
    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const updateData = {
      ...req.body,
      total_amount: req.body.totalAmount || req.body.total_amount,
      first_name: req.body.firstName || req.body.first_name,
      last_name: req.body.lastName || req.body.last_name,
      phone_number: req.body.phone || req.body.phone_number,
      street_address: req.body.address || req.body.street_address,
      postal_code: req.body.postalCode || req.body.postal_code,
    };
    const [updated] = await Order.update(updateData, {
      where: { id: orderId },
    });
    if (updated) {
      const updatedOrder = await Order.findByPk(orderId);
      return res.status(200).json({ success: true, order: updatedOrder });
    }
    throw new Error("Order not found");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete("/api/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const deleted = await Order.destroy({ where: { id: orderId } });
    if (deleted)
      return res.status(200).json({ success: true, message: "Entry Purged" });
    throw new Error("Order not found");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/reports", async (req, res) => {
  try {
    const recentOrders = await Order.findAll({
      limit: 100,
      order: [["order_date", "DESC"]],
      include: [{ model: User, attributes: ["name", "email"] }],
    });
    res.json({ recentActivity: recentOrders });
  } catch (error) {
    res.status(500).json({ error: "Reporting Uplink Failure" });
  }
});

app.get("/api/dashboard-data", async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [["id", "DESC"]], raw: true });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Dashboard Sync Failure" });
  }
});

sequelize.sync().then(() => {
  app.listen(5000, () => console.log("\n HALLY_TRACK SERVER LIVE ON 5000"));
});
