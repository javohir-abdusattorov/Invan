const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/error');
const colors = require('colors');
const connectDB = require('./config/db');

//Load env vars
dotenv.config({path: './config/config.env'});

// Connect to Database
connectDB();

const app = express();

// Body Parser
app.use(express.json());

// Load dev middlewares
if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
}

// File Upload
app.use(fileupload());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Registr routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/category', require('./routes/categoryRoutes'));
app.use('/api/v1/variants', require('./routes/variantRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));

app.use(errorHandler); 

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.white.bold);
});

// Hande unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red.bold);
  // Close server & exit process
  server.close(() => process.exit(1));
});