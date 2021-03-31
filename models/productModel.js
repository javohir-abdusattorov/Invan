const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'Iltimos nomini kiriting'],
	},
	image: {
		type: String
	},
	color: {
		type: String
	},
	representation: {
		type: String,
		enum: JSON.parse(process.env.PRODUCT_REPRESENTATION),
		required: true
	},
	SKU: {
		type: String,
		unique: true,
		required: true
	},
	options: [
		{
			key: String,
			value: String,
			variant: {
		    type: mongoose.Schema.Types.ObjectId,
		    ref: 'Variant'
			}
		}
	],
	category: {
		name: {
			type: String,
			required: true 
		},
		category: {
			type: mongoose.Schema.Types.ObjectId, 
      required: true,
      ref: 'Category'
		}
	},
	soldBy: {
		type: String,
    enum: JSON.parse(process.env.PRODUCT_SOLD_BY),
    required: true
	},
	defaultUnit: {
		type: String,
		enum: JSON.parse(process.env.PRODUCT_DEFAULT_UNITS),
		required: true
	},
}, {
	timestamps: true,
});

//Creating indexes
Schema.index({ 
  title: 'text'
});

//Custom partial search method
Schema.statics = {
  searchPartial: function(q, callback) {
    return this.find({
      $or: [
        { "title": new RegExp(q, "gi") }
      ]
    }, callback);
  },

  searchFull: function (q, callback) {
    return this.find({
      $text: { $search: q, $caseSensitive: false }
    }, callback);
  },

  search: function(q, callback) {
    this.searchFull(q, (err, data) => {
      if (err) return callback(err, data);
      if (!err && data.length) return callback(err, data);
      if (!err && data.length === 0) return this.searchPartial(q, callback);
    });
  },
};

module.exports = mongoose.model('Product', Schema);