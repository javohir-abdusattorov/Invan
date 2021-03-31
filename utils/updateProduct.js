const ErrorResponse = require('../utils/errorResponse');
const Product = require('../models/productModel');
const Variant = require('../models/variantModel');
const User = require('../models/userModel');
const productStockAlert = JSON.parse(process.env.PRODUCT_STOCK_ALERT)

exports.redirectSellerProducts = async(seller) => {
	for (let i = 0; i < seller.products.length; i++) {
		let product = seller.products[i]
		let updatedVariant = await Variant.findOneAndUpdate(
	    { _id: product.variant },
	    { $inc: { inStock: product.qty } },
	    { new: true }
	  );
	}
}

const deleteProduct = async(id) => {
	await Product.deleteOne({ _id: id });
};

const getVariantReminder = (inStock, redNorm, yellowNorm) => {
	if (inStock < 1) return productStockAlert[3]
	else if (inStock <= redNorm) return productStockAlert[2]
	else if (inStock <= yellowNorm) return productStockAlert[1]
	else return productStockAlert[0]
}

exports.createOriginalVariant = async(variant, productID, next) => {
	if (variant.cost > variant.price) return next(new ErrorResponse('Некорректные данные', 401)), deleteProduct(product._id)
	let margin = parseInt((variant.price - variant.cost) / (variant.cost / 100))
	let reminder = getVariantReminder(variant.inStock, variant.redNorm, variant.yellowNorm)

	const newVariant = await Variant.create({
		product: productID,
		price: variant.price,
		cost: variant.cost,
		margin,
		discount: variant.discount,
		type: 'original',
		valute: variant.valute,
		inStock: variant.inStock,
		reminder,
		yellowNorm: variant.yellowNorm,
		redNorm: variant.redNorm,
  })
	
	let updatingProduct = await Product.findById(productID)
	updatingProduct.options.push({ key: 'Option', value: 'orginal', variant: newVariant._id })
	updatingProduct.save()
}

exports.createVariants = async(variants, options, productID, next) => {
	let productOptions = []
	for (let i = 0; i < variants.length; i++) {
		let variant = variants[i]
		if (variants[i].price && variants[i].cost && variants[i].valute && variants[i].inStock && variants[i].yellowNorm && variants[i].redNorm) {
			if (variant.cost > variant.price) return next(new ErrorResponse('Некорректные данные', 401)), deleteProduct(productID)
			let margin = parseInt((variant.price - variant.cost) / (variant.cost / 100))
			let reminder = getVariantReminder(variant.inStock, variant.redNorm, variant.yellowNorm)

			const newVariant = await Variant.create({
				product: productID,
				name: `${options[i].key}: ${options[i].value}`,
				price: variant.price,
				cost: variant.cost,
				margin,
				discount: variant.discount,
				valute: variant.valute,
				inStock: variant.inStock,
				reminder,
				yellowNorm: variant.yellowNorm,
				redNorm: variant.redNorm,
		  })

			productOptions.push({ key: options[i].key, value: options[i].value, variant: newVariant._id })
		}
	}

	let updatingProduct = await Product.findById(productID)
	for (let i = 0; i < productOptions.length; i++) {
		updatingProduct.options.push({ key: productOptions[i].key, value: productOptions[i].value, variant: productOptions[i].variant })
	}

	await updatingProduct.save()
	return updatingProduct
}

exports.deleteProductVariants = async(id) => {
	await Variant.deleteMany({ product: id })
};

exports.updateVariantReminder = (variant) => {
	return getVariantReminder(variant.inStock, variant.redNorm, variant.yellowNorm)
}