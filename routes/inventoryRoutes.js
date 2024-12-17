import Router from 'express'
import { upload } from '../middleware/uploadMiddleware.js';
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const router = Router();

// Derive the directory name using fileURLToPath and dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// routes

// create inventory item

router.post('/', upload.single('image'), async (req, res) => {
    const { name, category, price, quantityAvailable, createdAt, itemId, availability, preparationTime } = req.body;
    const imagePath = req.file ? `/images/${req.file.filename}` : null;  // Store image path
    const newItem = new Inventory({
      name,
      category,
      price: Number(price),
      quantityAvailable: Number(quantityAvailable),
      image: imagePath,
      createdAt: new Date(createdAt),
      itemId,
      availability: availability === 'true',
      updatedAt: new Date().toISOString(),
      preparationTime,
    });
  
    console.log(newItem)
  
    try {
      await newItem.save();
      res.status(201).json({ message: 'Item created successfully', newItem });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error saving item to the database' });
    }
  })
  
 router.get('/:itemId', async (req, res) => {
    const { itemId } = req.params;
  
    // Find the item by itemId
    const item = await Inventory.findOne({ itemId });
  
    if (!item || !item.image) {
      return res.status(404).json({ message: 'Item or image not found' });
    }
  
    // Resolve the absolute path to the image
    const imagePath = `${__dirname}/${item.image}`;
    console.log(imagePath)
  
    // Send the image as a file from the server
    res.sendFile(imagePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ message: 'Error serving image' });
      }
    });
  });
  
  
  // update inventory item 
  
  // PUT /:itemId
 router.put('/:itemId', async (req, res) => {
    try {
      const { itemId } = req.params;
      const updates = req.body;
  
      const updatedItem = await Inventory.findOneAndUpdate(
        { itemId },
        { ...updates, updatedAt: new Date().toISOString() },
        { new: true }
      );
  
      if (!updatedItem) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }
  
      res.status(200).json({ message: 'Inventory item updated successfully', item: updatedItem });
    } catch (error) {
      res.status(500).json({ error: 'Error updating inventory item', details: error.message });
    }
  });
  
  // delete inventory
  
  // DELETE /:itemId
 router.delete('/:itemId', async (req, res) => {
    try {
      const { itemId } = req.params;
  
      const deletedItem = await Inventory.findOneAndDelete({ itemId });
  
      if (!deletedItem) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }
  
      res.status(200).json({ message: 'Inventory item deleted successfully', item: deletedItem });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting inventory item', details: error.message });
    }
  });
  
  // get all inventory items
  
  // GET 
 router.get('/', async (req, res) => {
    try {
      console.log("Fetching inventory items")
      const items = await Inventory.find();
      // Add base URL to image paths so they can be accessed from the frontend
      // Map items to include the image path for the frontend
      const updatedItems = items.map(item => ({
        ...item.toObject(),
        imageUrl: `images/${item.image}`,  // Relative URL for the image
      }));
  
      res.status(200).json({ updatedItems });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching inventory items', details: error.message });
    }
  });
  
  // get specific inventory with itemId
  
  // GET /:itemId  
 router.get('/:itemId', async (req, res) => {
    try {
      const { itemId } = req.params;
  
      const item = await Inventory.findOne({ itemId });
  
      if (!item) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }
  
      res.status(200).json({ item });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching inventory item', details: error.message });
    }
  });
  
  
  // add or reduce inventory
  
  // PATCH /:itemId/quantity
 router.patch('/:itemId/quantity', async (req, res) => {
    try {
      const { itemId } = req.params;
      const { quantityChange } = req.body; // `quantityChange` can be positive (add) or negative (reduce)
  
      const item = await Inventory.findOne({ itemId });
  
      if (!item) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }
  
      const updatedQuantity = item.quantityAvailable + quantityChange;
  
      if (updatedQuantity < 0) {
        return res.status(400).json({ error: 'Insufficient inventory quantity' });
      }
  
      item.quantityAvailable = updatedQuantity;
      item.availability = updatedQuantity > 0;
      item.updatedAt = new Date().toISOString();
  
      await item.save();
  
      res.status(200).json({ message: 'Inventory quantity updated successfully', item });
    } catch (error) {
      res.status(500).json({ error: 'Error updating inventory quantity', details: error.message });
    }
  });




export default router;