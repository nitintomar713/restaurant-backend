const MenuItem = require("../Models/MenuItem");
const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../utils/cloudinary');




function deleteLocalFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) console.error('Failed to delete local file:', err);
    else console.log('Deleted local file:', filePath);
  });
}

const createMenuItem = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    console.log("Uploading file from local disk to Cloudinary:", req.file.path);

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'menu',
    });

    deleteLocalFile(req.file.path);

    const {
      name,
      category,
      priceHalf,
      priceFull,
      type,
      isAvailable,
      showInMenu,
    } = req.body;

    if (!name || !category || (!priceHalf && !priceFull)) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const newItem = new MenuItem({
      name,
      category,
      priceHalf: Number(priceHalf) || 0,
      priceFull: Number(priceFull) || 0,
      image: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      type: uploadResult.resource_type,
      isAvailable: isAvailable !== "false",
      showInMenu: showInMenu !== "false",
    });

    await newItem.save();

    console.log(`✅ Created menu item: ${newItem._id} (${newItem.name})`);

    res.status(201).json({ message: "Menu item created", item: newItem });

  } catch (error) {
    console.error('❌ Error in createMenuItem:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

const getMenuItems = async (req, res) => {
  try {
    console.log("📥 [Menu API] GET /api/menu - Fetching all menu items...");
    const items = await MenuItem.find({}).sort({ createdAt: -1 });
    console.log(`📊 Retrieved ${items.length} items`);
    res.status(200).json(items);
  } catch (error) {
    console.error("❌ Error fetching menu items:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📥 [Menu API] PUT /api/menu/${id} - Updating menu item`);
    console.log("📦 Keys in req.body:", Object.keys(req.body));
    console.log("📁 req.file:", req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      path: req.file.path,
      filename: req.file.filename,
      size: req.file.size,
    } : null);

    const {
      name,
      category,
      priceHalf,
      priceFull,
      type,
      isAvailable,
      showInMenu,
    } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (priceHalf) updateData.priceHalf = Number(priceHalf);
    if (priceFull) updateData.priceFull = Number(priceFull);
    if (type) updateData.type = type;
    if (typeof isAvailable !== "undefined") updateData.isAvailable = isAvailable !== "false";
    if (typeof showInMenu !== "undefined") updateData.showInMenu = showInMenu !== "false";

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "menu",
        resource_type: req.file.mimetype.startsWith("video/") ? "video" : "image",
        public_id: `${Date.now()}-${req.file.originalname.split('.').slice(0, -1).join('.')}`,
      });

      deleteLocalFile(req.file.path);

      updateData.image = uploadResult.secure_url;
      updateData.public_id = uploadResult.public_id;
      updateData.type = uploadResult.resource_type;

      console.log("🖼️ Updating image to:", updateData.image);
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedItem) {
      console.warn(`⚠️ Menu item not found: ${id}`);
      return res.status(404).json({ error: "Menu item not found" });
    }

    console.log(`✅ Menu item updated: ${updatedItem._id} (${updatedItem.name})`);
    res.status(200).json({ message: "Menu item updated", item: updatedItem });
  } catch (error) {
    console.error("❌ Error updating menu item:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📥 [Menu API] DELETE /api/menu/${id} - Deleting menu item`);

    const deletedItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedItem) {
      console.warn(`⚠️ Menu item not found for deletion: ${id}`);
      return res.status(404).json({ error: "Menu item not found" });
    }

    console.log(`🗑️ Menu item deleted: ${deletedItem._id} (${deletedItem.name})`);
    res.status(200).json({ message: "Menu item deleted", item: deletedItem });
  } catch (error) {
    console.error("❌ Error deleting menu item:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

module.exports = {
  createMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
};
