let model;

async function loadModel() {
  model = await tf.loadGraphModel("TFJS/model.json");
}

function predictImage() {
  let image = cv.imread(canvas);

  // params=(input, output, method (i.e. convert color to gray),
  // color channels - used zero for it to be automatic based on previous method)
  cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 0);

  // increases contrast params (input, output, converts any rgb value above 175 to 255)
  // should make drawn image more pure white
  cv.threshold(image, image, 175, 255, cv.THRESH_BINARY);

  // find the contours for what was drawn on canvas
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(
    image,
    contours,
    hierarchy,
    cv.RETR_CCOMP,
    cv.CHAIN_APPROX_SIMPLE
  );

  // calculate the bounding rectangle for what was drawn on canvas
  let cnt = contours.get(0);
  let rect = cv.boundingRect(cnt);
  // crop the 'region of interest' (aka 'roi') and save it into the image variable.
  image = image.roi(rect);

  // Resize the Image (image will have its largest size equal to 20 pixels,
  // smaller side will be rescaled and thus be less than 20 pixels)
  // note: resizing is necessary as our model has been trained on 28 x 28 pixel images.
  // after resizing to max width of 20 pixels to a side, will add padding to make it 28 x 28.
  let height = image.rows;
  let width = image.cols;

  if (height > width) {
    height = 20;
    const scaleFactor = image.rows / height;
    width = Math.round(image.cols / scaleFactor);
  } else {
    width = 20;
    const scaleFactor = image.cols / width;
    height = Math.round(image.rows / scaleFactor);
  }

  let newSize = new cv.Size(width, height);
  cv.resize(image, image, newSize, 0, 0, cv.INTER_AREA);

  // add padding to make the final size of image to be 28 x 28
  // calculate padding for each side
  const LEFT = Math.ceil(4 + (20 - width) / 2);
  const RIGHT = Math.floor(4 + (20 - width) / 2);
  const TOP = Math.ceil(4 + (20 - height) / 2);
  const BOTTOM = Math.floor(4 + (20 - height) / 2);
  // console.log(`top: ${TOP}, bottom: ${BOTTOM}, left: ${LEFT}, right: ${RIGHT}`);

  // add the calculated padding (using black color) to the image
  const BLACK = new cv.Scalar(0, 0, 0, 0);
  cv.copyMakeBorder(
    image,
    image,
    TOP,
    BOTTOM,
    LEFT,
    RIGHT,
    cv.BORDER_CONSTANT,
    BLACK
  );

  // find the center of mass of the image
  cv.findContours(
    image,
    contours,
    hierarchy,
    cv.RETR_CCOMP,
    cv.CHAIN_APPROX_SIMPLE
  );
  cnt = contours.get(0);
  const Moments = cv.moments(cnt, false);
  // x coordinate of the center of mass
  let cx = Moments.m10 / Moments.m00;
  let cy = Moments.m01 / Moments.m00;
  //   console.log(`M00: ${Moments.m00}`);
  //   console.log(`Center of mass: cx: ${cx}, cy: ${cy}`);

  // center image based on center of mass
  const X_SHIFT = Math.round(image.cols / 2.0 - cx); // diff b/t midpoint and center of mass (horizontal)
  const Y_SHIFT = Math.round(image.cols / 2.0 - cy); // diff b/t midpoint and center of mass (vertical)
  // implement the shift calc'd above to shift the image
  newSize = new cv.Size(image.cols, image.rows);
  let M = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, X_SHIFT, 0, 1, Y_SHIFT]);
  cv.warpAffine(
    image,
    image,
    M,
    newSize,
    cv.INTER_LINEAR,
    cv.BORDER_CONSTANT,
    BLACK
  );

  // normalize pixel values by dividing by 255 to get a value between 0 and 1.
  let pixelValues = image.data;
  pixelValues = Float32Array.from(pixelValues); // converts array of integers to float values
  pixelValues = pixelValues.map((item) => {
    // normalize pixel values by dividing by 255 to get a value between 0 and 1.
    return item / 255.0;
  });
  //   console.log(`scaled array: ${pixelValues}`);

  // Create a Tensor
  const X = tf.tensor([pixelValues]); // makes a 2d array with pixel values.
  //   console.log(`Shape of Tensor: ${X.shape}`);
  //   console.log(`dtype of Tensor: ${X.dtype}`);

  // make a prediction
  const result = model.predict(X);
  result.print();

  // console.log(tf.memory());

  // download prediction value from tensor
  const output = result.dataSync()[0];

  // Testing only (delete later)
  //   const outputCanvas = document.createElement("CANVAS");
  //   cv.imshow(outputCanvas, image);
  //   document.body.appendChild(outputCanvas);

  // Cleanup - delete after creating (recommended in OpenCV documentation)
  image.delete();
  contours.delete();
  cnt.delete();
  hierarchy.delete();
  M.delete();
  X.dispose();
  result.dispose();

  return output;
}
