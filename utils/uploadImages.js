const path = require('path');
const fs = require('fs');
const ErrorResponse = require('../utils/errorResponse');

const uploadImage = (file, uploadPath, getPath, next) => {
	file.name = `photo_${new Date().getTime() + 3}_${file.md5}${path.parse(file.name).ext}`;
	let filePath = `${uploadPath}/${file.name}`;
	let directPath = `${getPath}/${file.name}`;
	
	file.mv(filePath, (err) => {
		if (err) {
			console.log(err);
			return next(new ErrorResponse('Фотография не загруженa.', 500));
		}
	});
	return directPath;
};

exports.uploadProductImage = (file, next) => {
	let imagePath = uploadImage(file, process.env.PRODUCT_IMAGE_UPLOAD_PATH, process.env.PRODUCT_IMAGE_GET_PATH, next);
	return imagePath;
};

exports.uploadReviewImage = (file, next) => {
	let imagePath = uploadImage(file, process.env.REVIEW_IMAGE_UPLOAD_PATH, process.env.REVIEW_IMAGE_GET_PATH, next);
	return imagePath;
};

exports.uploadUserImage = (file, next) => {
	let imagePath = uploadImage(file, process.env.USER_IMAGE_UPLOAD_PATH, process.env.USER_IMAGE_GET_PATH, next);
	return imagePath;
};

exports.uploadComplaintImage = (file, next) => {
	let imagePath = uploadImage(file, process.env.COMPLAINT_IMAGE_UPLOAD_PATH, process.env.COMPLAINT_IMAGE_GET_PATH, next);
	return imagePath;
};

exports.deleteImages = (images) => {
	for (let i = 0; i < images.length; i++) {
		let imagePath = `./public/${images[i]}`;
		if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
	}
};