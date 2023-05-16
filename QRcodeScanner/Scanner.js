import { Contour } from "../contourDetection/Contour.js";
import { threshold, close, cannyEdgeDetector, closeEdgeDtector } from "./Utils/ImageUtils.js";
import { find_transform } from "./Utils/calcUtils.js";
import {warp} from "./Utils/ImageUtils.js"
import { dst_image_size } from "../Consts.js";

class QRcode
{
    data = []
    async detect(image)
    {
        let SIZE = dst_image_size/25
        let PATTERN = [3.5 * SIZE,3.5 * SIZE, 3.5 * SIZE, 21.5 * SIZE, 21.5*SIZE,3.5*SIZE, 18.5*SIZE,18.5*SIZE]

        let GREY_image = image.grey();
        let THRESH_value = GREY_image.getThreshold()
        let THRESH_image = threshold(GREY_image,THRESH_value)

        let EDGE_image = cannyEdgeDetector(THRESH_image, {highThreshold:200, lowThreshold:250});
        // let EDGE_image = closeEdgeDtector(THRESH_image)
        let CLOSE_image = EDGE_image.erode({iterations : 1})

        let contour_detector = new Contour();
        let contours = contour_detector.detect_contours(CLOSE_image)
        let target_centers = contour_detector.find_target_contours_center(contours);
        
        let transform = find_transform(target_centers, PATTERN)
        let transformed_image = warp(THRESH_image, transform)
        this.data = transformed_image.data
        return transformed_image;
    }

    getRGBA_data()
    {
        let RGBA = []
        for (let i = 0; i<this.data.length; i++)
        {
            RGBA.push(this.data[i])
            RGBA.push(this.data[i])
            RGBA.push(this.data[i])
            RGBA.push(1)
        }
        return RGBA
    }
    
}

export {QRcode};