const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
	name: {
    type: String,
    required: [true, 'Iltimos nomini kiriting']
	},
},{
	timestamps: true
});

module.exports = mongoose.model('Category', Schema);