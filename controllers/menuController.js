const MenuItem = require('../Models/MenuItem');

// Create
exports.createMenuItem = async (req, res) => {
  try {
    console.log('[CREATE] Request Body:', req.body);
    console.log('[CREATE] Uploaded File:', req.file);

    const {
      name,
      category,
      priceHalf,
      priceFull,
      isAvailable,
      showInMenu
    } = req.body;

    const newItem = new MenuItem({
      name,
      category,
      priceHalf: priceHalf ? parseFloat(priceHalf) : undefined,
      priceFull: priceFull ? parseFloat(priceFull) : undefined,
      isAvailable: isAvailable === 'true',
      showInMenu: showInMenu === 'true',
      image: req.file ? req.file.filename : null
    });

    await newItem.save();
    console.log('[CREATE] New Item Saved Successfully');

    res.status(201).json(newItem);
  } catch (err) {
    console.error('[CREATE] Error Creating Menu Item:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get All
exports.getMenuItems = async (req, res) => {
  try {
    console.log('[GET ALL] Fetching Menu Items...');
    const items = await MenuItem.find();
    console.log(`[GET ALL] ${items.length} items fetched`);
    res.json(items);
  } catch (err) {
    console.error('[GET ALL] Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Update
exports.updateMenuItem = async (req, res) => {
  try {
    const itemId = req.params.id;

    const {
      name,
      category,
      priceHalf,
      priceFull,
      isAvailable,
      showInMenu
    } = req.body;

    const updatedData = {
      name,
      category,
      isAvailable: isAvailable === 'true',
      showInMenu: showInMenu === 'true'
    };

    if (priceHalf) updatedData.priceHalf = parseFloat(priceHalf);
    if (priceFull) updatedData.priceFull = parseFloat(priceFull);

    if (req.file) {
      updatedData.image = req.file.filename;
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(itemId, updatedData, {
      new: true
    });

    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('[UPDATE] Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

// Delete
exports.deleteMenuItem = async (req, res) => {
  try {
    console.log('[DELETE] Params:', req.params);
    const deleted = await MenuItem.findByIdAndDelete(req.params.id);

    if (!deleted) {
      console.log('[DELETE] No Item Found to Delete with ID:', req.params.id);
      return res.status(404).json({ error: 'Item not found' });
    }

    console.log('[DELETE] Item Deleted Successfully');
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    console.error('[DELETE] Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};
