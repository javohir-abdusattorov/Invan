const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
	product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
	},
	name: String,
	type: {
		type: String,
		enum: ['original', 'other'],
		default: 'other'
	},
	cost: {
		type: Number,
		min: 0,
		required: true
	},
	price: {
		type: Number,
		min: 0,
		required: true
	},
	margin: {
		type: Number,
		min: 0,
		required: true
	},
	discount: {
		type: Number,
		min: 0,
		max: 100,
		default: 0
	},
	valute: {
		type: String,
		min: 0,
		required: true,
		enum: JSON.parse(process.env.VALUTES)
	},
	inStock: {
		type: Number,
		min: 0,
		required: true
	},
	sold: {
		type: Number,
		min: 0,
		default: 0
	},
	reminder: {
		type: String,
    enum: JSON.parse(process.env.PRODUCT_STOCK_ALERT),
		required: true,
	},
	yellowNorm: {
		type: Number,
		min: 0,
		required: true
	},
	redNorm: {
		type: Number,
		min: 0,
		required: true
	},
}, {
	timestamps: true,
});

module.exports = mongoose.model('Variant', Schema);