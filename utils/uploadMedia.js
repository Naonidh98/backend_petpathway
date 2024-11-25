const cloudinary = require("cloudinary").v2;

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  const options = { folder };
  if (height) {
    options.height = height;
  }
  if (quality) {
    options.quality = quality;
  }
  options.resource_type = "auto";

  return await cloudinary.uploader.upload(file.tempFilePath, options);
};

exports.deleteImageFromCloudinary = async (image) => {
  const urlArray = image.split("/");

  const img = urlArray[urlArray.length - 1];

  const imgName = img.split(".")[0];

  console.log(imgName);

  await cloudinary.uploader.destroy(imgName, (error, result) => {});

  return true;
};
