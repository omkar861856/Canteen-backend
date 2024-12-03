import express, { json } from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import http from 'http'
import multer from 'multer'
import Grid from 'gridfs-stream'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'


// Derive the directory name using fileURLToPath and dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()

app.use(cors())
app.use(json())

const PORT = process.env.PORT;


// duplex communication establishment

const server = http.createServer(app)
const io = new Server(server, {
  cors:
  {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ['GET', 'POST']
  }
})

// websocket connections 

// Handle client connections
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Handle custom events
  socket.on('message', (data) => {
    console.log(`Message received: ${data}`);
    io.emit('message', data); // Broadcast to all clients
  });

  //Handling order update
  socket.on('order-update', (data) => {
    console.log(`${data}`);
    io.emit('order-update', data); // Broadcast to all clients
  });


  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Connection URL
const url = process.env.MONGO_URL
// const client = new MongoClient(url);


// async function connectDB() {
//     // Use connect method to connect to the server
//     await client.connect();
//     console.log('Connected successfully to mongo server');
//     const db = client.db(dbName);

//     return db;
// }

// const db = await connectDB();

// const usersCollection = db.collection('Users');

await mongoose.connect(url).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB:", err));


  const conn = mongoose.connection;
let gfs;

conn.once('open', () => {
  // Initialize GridFS
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads'); // Set GridFS collection to 'uploads'
});

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UsersSchema = new Schema({ 
  _id: ObjectId,
  email: String,
  password: String,
  date: { type: Date, default: Date.now },
  orders: Object
}, { collection: 'Users' });

const UserModel = mongoose.model('UserModel', UsersSchema)


app.use(json())
app.use(cors())

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.post('/signup', function (req, res) {

})

app.get('/signin', function (req, res) {
  res.send('Hello World')
})

// Order schema and routes 


// Routes
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  items: { type: Array, required: true }, // Array of items (adjust schema further if items have specific structure)
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'pending' }, // 'pending', 'completed', or 'cancelled'
  orderedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null } // Can be null if not completed yet
}, { collection: 'Orders' });

const Order = mongoose.model('Order', orderSchema);

// Create Order
app.post('/order', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({ message: "Order created successfully", order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Order for Completion or Cancellation
app.put('/order/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Expected status: 'Completed' or 'Cancelled'

  console.log(id, status)

  try {
    const order = await Order.findOneAndUpdate(
      { orderId: id },      // Search for the document by orderId
      { status },           // Update the status field
      { new: true }         // Return the updated document
    );    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order updated successfully", order });
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: err.message });
  }
});

// Delete Order (for Cancellation)
app.delete('/order/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findByIdAndDelete(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Orders
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    console.log(orders)
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Orders by UserId

app.get('/orders/:userId', async (req, res) => {
  const {userId} = req.params;
  try {
    const orders = await Order.find({userId: userId});
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// Get Specific Order by ID
app.get('/order/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// inventory schema

const inventorySchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  quantityAvailable: { type: Number, required: true },
  availability: { type: Boolean, required: true },
  image: {type: String, required: true},
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
}, { collection: "Inventory" });

const Inventory = mongoose.model('Inventory', inventorySchema);


// inventory routes


// multr storage 

const storage = multer.diskStorage({
  destination: (req,file,cb)=>{
    cb(null, 'images/')
  },
  filename: (req, file, cb)=>{
    cb(null, file.fieldname + Date.now() + '_' + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage
})

// create inventory item

app.post('/inventory',upload.single('image') ,async (req, res)=>{
  const { name, category, price, quantityAvailable, createdAt, itemId, availability } = req.body;
    const imagePath = req.file ? `/images/${req.file.filename}` : null;  // Store image path

    // Create new inventory item and save to DB
    const newItem = new Inventory({
        name,
        category,
        price: Number(price),
        quantityAvailable: Number(quantityAvailable),
        image: imagePath,
        createdAt: new Date(createdAt),
        itemId,
        availability: availability === 'true',
        updatedAt: new Date().toISOString()
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

app.get('/inventory/:itemId', async (req, res) => {
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

// PUT /inventory/:itemId
app.put('/inventory/:itemId', async (req, res) => {   
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

// DELETE /inventory/:itemId
app.delete('/inventory/:itemId', async (req, res) => {
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

// GET /inventory
app.get('/inventory', async (req, res) => {
  try {
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

// GET /inventory/:itemId
app.get('/inventory/:itemId', async (req, res) => {
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

// PATCH /inventory/:itemId/quantity
app.patch('/inventory/:itemId/quantity', async (req, res) => {
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

server.listen(PORT, console.log("Hello from the server side 3000"))