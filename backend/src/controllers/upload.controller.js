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
    
    // Clean name input and prefix with timestamp to ensure unique URLs and avoid cache collisions
    const cleanName = name ? name.replace(/[^a-zA-Z0-9.]/g, '_') : `photo.${extension}`;
    const filename = `${Date.now()}_${cleanName}`;

    // Target 1: Frontend public directory
    const devDir = path.join(__dirname, '../../../frontend/public/image');
    if (!fs.existsSync(devDir)) {
      try { fs.mkdirSync(devDir, { recursive: true }); } catch (e) {}
    }
    try {
      fs.writeFileSync(path.join(devDir, filename), buffer);
    } catch (e) {
      console.warn('Could not write to devDir:', e.message);
    }

    // Target 2: Production web root (/var/www/html/charoensri/image)
    const prodDir = '/var/www/html/charoensri/image';
    if (fs.existsSync(prodDir)) {
      try {
        fs.writeFileSync(path.join(prodDir, filename), buffer);
      } catch (e) {
        console.warn('Could not write to prodDir:', e.message);
      }
    }

    res.status(200).json({ 
      success: true, 
      filename: filename,
      message: 'Image uploaded successfully' 
    });
  } catch (error) {
    next(error);
  }
};
