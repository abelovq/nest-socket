import { v2 as cloudinary } from 'cloudinary';

export const cloudinaryUpload = async (
  filePath: string,
  type: 'image' | 'video',
) => {
  // Use the uploaded file's name as the asset's public ID and
  // allow overwriting the asset with new versions

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    resource_type: type,
  };

  try {
    const result = await cloudinary.uploader.upload(filePath, options);
    return result.secure_url;
  } catch (error) {
    console.error('cloudinary error', error);
  }
};

export const getFileType = (ext: string) => {
  const videoTypes = ['mp4'];
  return videoTypes.includes(ext) ? 'video' : 'image';
};
