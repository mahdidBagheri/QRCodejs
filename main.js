import {QRcode} from "./QRcodeScanner/Scanner.js"
import {dst_image_size} from "./Consts.js"

async function process()
{
    let qrcode = new QRcode();

    let image = await IJS.Image.load(document.getElementById('color').src);
    let result = await qrcode.detect(image);
    let result_data = qrcode.getRGBA_data()
    const code = jsQR(result_data, dst_image_size, dst_image_size);

    if (code) {
    console.log("Found QR code", code);
    document.getElementById("data").textContent = `code context: ${code.data}`
    }
    document.getElementById('result').src = result.toDataURL();

}

process()
