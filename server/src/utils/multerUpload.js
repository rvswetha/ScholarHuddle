import multer from 'multer';

// Store the file in memory as a Buffer
const storage = multer.memoryStorage();

// Create the multer instance
const upload = multer({ storage: storage });

export default upload;