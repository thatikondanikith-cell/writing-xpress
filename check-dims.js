const fs = require('fs');

function getJPGDimensions(path) {
    const buffer = fs.readFileSync(path);
    // Find SOF (Start of Frame) marker
    let i = 0;
    while (i < buffer.length - 1) {
        if (buffer[i] === 0xFF && (buffer[i + 1] >= 0xC0 && buffer[i + 1] <= 0xC3)) {
            // SOF marker found
            const height = buffer.readUInt16BE(i + 5);
            const width = buffer.readUInt16BE(i + 7);
            return { width, height };
        }
        i++;
    }
    return null;
}

const path = 'public/uploads/logo.jpg';
if (fs.existsSync(path)) {
    console.log(JSON.stringify(getJPGDimensions(path)));
} else {
    console.log('File not found');
}
