const express = require('express');
const router = express.Router();
const { sequelize } = require('../../models');

router.post('/orders', async (req, res) => {
  const { email, totalAmount, items } = req.body;
  const t = await sequelize.transaction();

  try {
    // 1. Insert into 'orders' table
    // FIX: Destructure to get the 'insertId' from the metadata
    const [orderId] = await sequelize.query(
      `INSERT INTO orders (user_id, total_amount, status, order_date) 
       VALUES ((SELECT id FROM users WHERE email = ? LIMIT 1), ?, 'pending', NOW())`,
      { 
        replacements: [email, totalAmount], 
        transaction: t,
        type: sequelize.QueryTypes.INSERT // Explicitly set type to get correct return value
      }
    );

    // 2. Insert into 'order_items' table
    for (const item of items) {
      await sequelize.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) 
         VALUES (?, ?, ?, ?)`,
        { 
          replacements: [orderId, item.product_id, item.quantity, item.price], 
          transaction: t 
        }
      );
    }

    await t.commit();
    res.status(201).json({ success: true, message: "Order stored in DB" });
  } catch (error) {
    if (t) await t.rollback();
    console.error("Order Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;