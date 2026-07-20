const fs = require('fs');
const path = require('path');

exports.uploadImage = async (req, res, next) => {
  try {
    const { image, name } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'Please provide image data' });
    }

    // Extract base64 content
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique name
    const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
    const extension = (matches && matches[1]) || 'jpg';
    
    // Clean name input
    const cleanName = name ? name.replace(/[^a-zA-Z0-9.]/g, '_') : '';
    const filename = cleanName || `upload_${Date.now()}.${extension}`;

    // Target path in frontend public directory
    const targetDir = path.join(__dirname, '../../../frontend/public/image');
    
    // Ensure dir exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, filename);
    fs.writeFileSync(filePath, buffer);

    res.status(200).json({ 
      success: true, 
      filename: filename,
      message: 'Image uploaded successfully' 
    });
  } catch (error) {
    next(error);
  }
};
