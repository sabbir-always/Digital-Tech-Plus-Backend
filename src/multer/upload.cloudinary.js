import fs from "fs";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});


export const uploadCloudinary = async (localFilePath, folderName = "images") => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: 'auto', folder: folderName });
        if (response) { fs.unlinkSync(localFilePath) } // Clean local file after successful upload
        return response

    } catch (error) {
        // Remove the locally saved file in case of upload failure
        console.error('Cloudinary upload failed:', error);
        if (fs.existsSync(localFilePath)) { fs.unlinkSync(localFilePath) }
        return null;
    }
}

export const uploadMultipleCloudinary = async (localFilePaths, folderName = "images") => {
    try {
        if (!localFilePaths || localFilePaths.length === 0) return [];
        const uploadPromises = localFilePaths.map(async (localFilePath) => {
            try {
                const response = await cloudinary.uploader.upload(localFilePath, { resource_type: 'auto', folder: folderName });
                if (response && fs.existsSync(localFilePath)) { fs.unlinkSync(localFilePath) }
                return response;

            } catch (error) {
                console.error('Individual file upload failed:', error);
                if (fs.existsSync(localFilePath)) { fs.unlinkSync(localFilePath) }
                return null;
            }
        });

        const results = await Promise.all(uploadPromises);
        return results.filter(result => result !== null);

    } catch (error) {
        console.error('Multiple Cloudinary upload failed:', error);
        return [];
    }
}