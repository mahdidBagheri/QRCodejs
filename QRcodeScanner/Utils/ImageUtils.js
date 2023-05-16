import { dst_image_size, image_size } from "../../Consts.js";

function copyImage(fromImage, toImage, x, y)
{
    let fromWidth = fromImage.width;
    let fromHeight = fromImage.height;
    let toWidth = toImage.width;
    let channels = fromImage.channels;
    for (let i = 0; i < fromWidth; i++) {
      for (let j = 0; j < fromHeight; j++) {
        for (let k = 0; k < channels; k++) {
          let source = (j * fromWidth + i) * channels + k;
          let target = ((y + j) * toWidth + x + i) * channels + k;
          toImage.data[target] = fromImage.data[source];
        }
      }
    }
}

function threshold(image, thresh)
{
    let imageWidth = image.width;
    let imageHeight = image.height;
    let channels = image.channels;
    if(channels > 1)
    {
      throw new Error("image should be grayscale");
    }
    for (let i = 0; i < imageWidth; i++) {
      for (let j = 0; j < imageHeight; j++) {
        let source = (j * imageWidth + i);
        if(image.data[source] > thresh)
        {
          image.data[source] = 255;

        }
        else
        {
          image.data[source] = 0;
        }
        
      }
    }
    return image;
}

function close(image, options = {}) {
  let {
    kernel = [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    iterations = 1,
  } = options;


  let dilatedImage = image.dilate({ kernel });
  let erodedImage = dilatedImage.erode({ kernel });
  

  return erodedImage;
}

const defaultOptions = {
  lowThreshold: 10,
  highThreshold: 30,
  gaussianBlur: 1.1
};

const Gx = [
  [-1, 0, +1],
  [-2, 0, +2],
  [-1, 0, +1]
];

const Gy = [
  [-1, -2, -1],
  [0, 0, 0],
  [+1, +2, +1]
];

function cannyEdgeDetector(image, options) {

  options = Object.assign({}, defaultOptions, options);

  const width = image.width;
  const height = image.height;
  const brightness = image.maxValue;

  const gfOptions = {
      sigma: options.gaussianBlur,
      radius: 3
  };

  const convOptions = {
    bitDepth: 32,
    mode: 'periodic'
};

  const gf = image.gaussianFilter(gfOptions);

  const gradientX = gf.convolution(Gy, convOptions);
  const gradientY = gf.convolution(Gx, convOptions);

  const G = gradientY.hypotenuse(gradientX);

  const Image = image.constructor;

  const nms = new Image(width, height, {
      kind: 'GREY',
      bitDepth: 32
  });

  const edges = new Image(width, height, {
      kind: 'GREY',
      bitDepth: 32
  });

  const finalImage = new Image(width, height, {
      kind: 'GREY'
  });

  // Non-Maximum supression
  for (var i = 1; i < width - 1; i++) {
      for (var j = 1; j < height - 1; j++) {
        nms.setValueXY(i, j, 0, G.getValueXY(i, j, 0));
      }
  }

  for (i = 0; i < width * height; ++i) {
      var currentNms = nms.data[i];
      var currentEdge = 0;
      if (currentNms > options.highThreshold) {
          currentEdge++;
          finalImage.data[i] = brightness;
      }
      if (currentNms > options.lowThreshold) {
          currentEdge++;
      }

      edges.data[i] = currentEdge;
  }
  return finalImage;
}

function warp(image, transformation)
{
  const width = image.width;
  const height = image.height;
  const srcImage = new IJS.Image(width, height, {kind: 'GREY',bitDepth: 8});
  copyImage(image, srcImage, 0, 0)

  const dstImage = new IJS.Image(dst_image_size, dst_image_size, {kind: 'GREY',bitDepth: 8});
  for (let i = 0; i < height; i++)
  {
    for (let j = 0; j < width; j++)
    { 
      if(i === 240 && j === 275)
      {
        let a = 0;
      }
      //console.log(`i:${i} j:${j}`)
      let intensity = image.getValueXY(j, i, 0);
      let dst_pixl = transformation.transform(i,j)
      if(dst_pixl[0] >= 0 && dst_pixl[1] >= 0 && dst_pixl[0] <= dst_image_size && dst_pixl[1] <= dst_image_size)
      {
        let source = (parseInt(Math.round(dst_pixl[0])) * dst_image_size + parseInt(Math.round(dst_pixl[1])))
        if(source > 0 && source < height*width)
        {
          dstImage.data[source] = intensity;
        }
      }

    }
  }
  return dstImage;
}

function closeEdgeDtector(image)
{
  const width = image.width;
  const height = image.height;
  let newImage = new IJS.Image(width, height, {kind: 'GREY',bitDepth: 8});
  copyImage(image, newImage, 0, 0)
  let closedImage = newImage.close({iterations : 2})
  let subtrackted_image = subtrackt(closedImage,newImage)
  return subtrackted_image
}

function subtrackt(image1, image2)
{
  const width = image1.width;
  const height = image1.height;
  let subtrackted = new IJS.Image(width, height, {kind: 'GREY',bitDepth: 8});
  
  for (let i = 0; i < height; i++)
  {
    for (let j = 0; j < width; j++)
    {
      let intensity1 = image1.getValueXY(i,j,0);
      let intensity2 = image2.getValueXY(i,j,0);
      let intensity = intensity1 - intensity2;
      // console.log(intensity)
      if(intensity > 0)
      {
        let source = i*height+j
        subtrackted.data[source] = intensity
      }

    }
  }
  return subtrackted;
}

export {copyImage};
export {threshold};
export {close};
export {cannyEdgeDetector};
export {warp};
export {closeEdgeDtector};