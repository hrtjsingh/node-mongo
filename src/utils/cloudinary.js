import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

cloudinary.config({
    cloud_name: 'dqoyaqd0l',
    api_key: '147374144343676',
    api_secret: '_XBuj-1luT4zfJKfH0BPSiHF7d4'
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        console.log(localFilePath)
        const response = await cloudinary.uploader.upload(localFilePath,
            { resource_type: "auto" });
        // console.log("FIle is uploaded in cloudinary")
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}


export { uploadOnCloudinary }