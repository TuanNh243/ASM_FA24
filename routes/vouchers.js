var express = require('express');
var router = express.Router();
const JWT = require('jsonwebtoken');
const config = require('../util/TokenConfig');
const Voucher = require('../models/voucherModel');

// Middleware for Token Verification
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) return res.status(401).json({ status: 401, message: "Authorization header missing" });

        const token = authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ status: 401, message: "Token missing" });

        JWT.verify(token, config.SECRETKEY, (err, decoded) => {
            if (err) return res.status(403).json({ status: 403, message: err.message });
            req.userId = decoded; // Attach decoded ID to request
            next();
        });
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(500).json({ status: 500, message: "Server error", error });
    }
};

// Route: Get all vouchers
router.get('/',         verifyToken, async (req, res) => {
    try {
        const vouchers = await Voucher.find();
        res.status(200).json({status: 200, message:"ok",data:
            vouchers});
    } catch (err) {
        console.error("Error fetching vouchers:", err);
        res.status(500).json({ message: err.message });
    }
});

// Route: Create a new voucher
router.post('/add', verifyToken, async (req, res) => {
    try {
        const { voucherType, voucherCon, dateAvai, dateUnVai, amount, trang_thai = true } = req.body;

        const newVoucher = new Voucher({ voucherType, voucherCon, dateAvai, dateUnVai, amount, trang_thai });
        const savedVoucher = await newVoucher.save();

        res.status(201).json(savedVoucher);
    } catch (error) {
        console.error("Error creating voucher:", error);
        res.status(500).json({ message: 'Error creating voucher', error });
    }

});


// Route: Update voucher by ID
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedVoucher = await Voucher.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedVoucher) return res.status(404).json({ message: 'Voucher not found' });

        res.status(200).json(updatedVoucher);
    } catch (error) {
        console.error("Error updating voucher:", error);
        res.status(500).json({ message: 'Error updating voucher', error });
    }
});


// Route: Filter vouchers by type
router.get('/type', async (req, res) => {
    try {
        const { voucherType } = req.query;

        if (!voucherType || typeof voucherType !== 'string') {
            return res.status(400).json({ message: 'Voucher type is required and must be a string' });
        }

        // Truy vấn theo voucherType
        const vouchers = await Voucher.find({ voucherType:voucherType });

        if (vouchers.length === 0) {
            return res.status(404).json({ message: `Không có voucher với loại: ${voucherType}` });
        }

        res.status(200).json(vouchers);
    } catch (err) {
        console.error("Lỗi khi tìm kiếm voucher:", err);
        res.status(500).json({ message: 'Lỗi khi tìm kiếm voucher', error: err });
    }
});

//Route: Get vouchers available / unavailable
router.get('/date', verifyToken, async (req, res) => {
  try {
      const { comparison } = req.query;
      const currentDate = new Date();

      if (!comparison) {
          return res.status(400).json({ message: 'Comparison parameter (before/after) is required' });
      }

      let filter = {};
      if (comparison === 'before') {
          filter.dateAvai = { $lt: currentDate };
      } else if (comparison === 'after') {
          filter.dateAvai = { $gte: currentDate };
      } else {
          return res.status(400).json({ message: 'Invalid comparison value. Use "before" or "after".' });
      }

      const vouchers = await Voucher.find(filter);
      res.status(200).json(vouchers);
  } catch (error) {
      console.error("Error filtering vouchers by availability date:", error);
      res.status(500).json({ message: 'Error filtering vouchers by date', error });
  }
});

// Route:Get vouchers amount >10
router.get('/amount/:amount', verifyToken, async (req, res) => {
    try {
        const { amount } = req.params;  
        const minAmount = parseFloat(amount); 
  
        if (isNaN(minAmount)) {
            return res.status(400).json({ message: 'Invalid amount parameter. It must be a number.' });
        }
  
        const vouchers = await Voucher.find({ amount: { $gt: minAmount } });
  
        if (vouchers.length === 0) {
            return res.status(404).json({ message: `No vouchers found with amount greater than ${minAmount}` });
        }
  
        res.status(200).json(vouchers);
    } catch (error) {
        console.error("Error fetching vouchers by amount:", error);
        res.status(500).json({ message: 'Error fetching vouchers by amount', error });
    }
  });


//Dynamic Routes
router.get('/:id', verifyToken, async (req, res) => {
  try {
      const { id } = req.params;
      const voucher = await Voucher.findById(id);
      if (!voucher) return res.status(404).json({ message: 'Voucher not found' });

      res.status(200).json(voucher);
  } catch (error) {
      console.error("Error fetching voucher by ID:", error);
      res.status(500).json({ message: 'Error fetching voucher', error });
  }
});

// Route: Delete voucher by ID
router.delete('/:id', verifyToken, async (req, res) => {
  try {
      const { id } = req.params;

      const deletedVoucher = await Voucher.findByIdAndDelete(id);
      if (!deletedVoucher) return res.status(404).json({ message: 'Voucher not found' });

      res.status(200).json({ message: 'Voucher deleted successfully' });
  } catch (error) {
      console.error("Error deleting voucher:", error);
      res.status(500).json({ message: 'Error deleting voucher', error });
  }
});

module.exports = router;
