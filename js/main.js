const max_iterations = 100;

function drawBurningShipFractal(canvas, drawFunc) {
  const context = canvas.getContext('2d');
	const canvas_image_data = context.createImageData(canvas.width, canvas.height);
	const image = canvas_image_data.data;
  const canvas_height = canvas.height;
  const canvas_width = canvas.width;
	for (let i = 0; i < canvas_height; i++) {
		for (let j = 0; j < canvas_width; j++) {
			const x0 = -1.80 + j * (-1.7 + 1.80) / canvas_width;
			const y0 = -0.08 + i * (0.01 + 0.08) / canvas_height;
			let x = 0;
			let y = 0;
			let iteration = 0;
			while ((x * x + y * y < 4) && (iteration < max_iterations)) {
				let x_n = x * x - y * y + x0;
				let y_n = 2 * Math.abs(x * y) + y0;
				x = x_n;
				y = y_n;
				iteration++;
			}
      const ind = i * canvas_width * 4 + j * 4;
      drawFunc(image, ind, iteration);
		}
	}
	context.putImageData(canvas_image_data, 0, 0);
}


{
  const canvas1 = document.getElementById('bsf-1');
	drawBurningShipFractal(canvas1, (image, ind, iteration) => {
    image[ind + 0] = 25 + iteration * 30;
    image[ind + 1] = 25 + iteration * 10;
    image[ind + 2] = 85 - iteration * 5;
		image[ind + 3] = 255;
    return image;
  });

  const canvas2 = document.getElementById('bsf-2');
	drawBurningShipFractal(canvas2, (image, ind, iteration) => {
    image[ind + 0] = Math.sin(0.016 * iteration + 4) * 230 + 25;
    image[ind + 1] = Math.sin(0.013 * iteration + 2) * 230 + 25;
    image[ind + 2] = Math.sin(0.01 * iteration + 1) * 230 + 25;
    image[ind + 3] = 255;
    return image;
  });
}
