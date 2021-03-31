const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
	seller: {		
		type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'User'
	},
	customer: {
		type: String,
		required: true
	},
	orderItems: [
		{
			title: { type: String, required: true },			
      qty: { type: Number, required: true },
      price: { type: Number, required: true },
      variant: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Variant'
      }
		}
	],
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
}, {
	timestamps: true,
});

module.exports = mongoose.model('Order', Schema);