const { jsPDF } = jspdf;

const pdf = new jsPDF({
	unit: "px",
});

const pageWidth = pdf.internal.pageSize.getWidth();
const pageHeight = pdf.internal.pageSize.getHeight();

const imagePicker = document.getElementById("image-picker");
const marginSelect = document.getElementById("margin-select")
const form = document.getElementById("form");


async function handleSubmit (e) {
	e.preventDefault();
	showSpinner()
	const data = new FormData(e.target);
	const margin = parseInt(data.get("margin"))
	const images = Array.from(imagePicker.files)
	
	for (let index = 0; index < images.length; index++) {
		const image = images[index];
		await appendImage(image, index, margin);
	}
	
	savePDF()
}

form.addEventListener("submit", (e) => handleSubmit(e))
imagePicker.addEventListener("change", handleImageInputChange);

function appendImage(imageInput, index, margin) {
	const promise = new Promise((resolve) => {
		if (index > 0) pdf.addPage() // avoid creating a new page for the first image

		const url = URL.createObjectURL(imageInput)
	
		const imageInstance = new Image()
		imageInstance.src = url
		imageInstance.onload = () => {
			const imageWidth = imageInstance.width;
			const imageHeight = imageInstance.height;
			let { width, height } = determineImageDimension(imageWidth, imageHeight, pageWidth, pageHeight, margin);

			pdf.addImage(imageInstance, "jpg", margin, margin, width, height)
			resolve()		
		}
	})
	 
	return promise;
}


function determineImageDimension(imageWidth, imageHeight, pageWidth, pageHeight, margin) {
	let scaledWidth, scaledHeight;
	const imageRatio = imageWidth / imageHeight;
	const pageRatio = pageWidth / pageHeight;
	margin *= 2

	if (imageWidth <= pageWidth && imageHeight <= pageHeight) {
		scaledWidth = imageWidth - margin;
		scaledHeight = imageWidth / imageRatio
	} else {
		
		if (imageRatio >= pageRatio) {
			scaledWidth = pageWidth - margin;
			scaledHeight = scaledWidth / imageRatio
		} else {
			scaledHeight = pageHeight - margin;
			scaledWidth = scaledHeight * imageRatio
		}
	}
	return {
		width: scaledWidth,
		height: scaledHeight
	}
}


function savePDF() {
	let name = prompt("Save as");
	name = name ? name + ".pdf" : "output.pdf";
	pdf.save(name);
	window.location.reload();
}

function handleImageInputChange (e) {
	const images = Array.from(e.target.files);
	if (images.length > 0) {
		const labelEl = document.getElementById("image-picker-label");	
		const convertBtn = document.getElementById("convert-btn");
		const count = images.length;
		labelEl.textContent = "You have selected " + count + " image(s)"
		convertBtn.disabled = false;
	}
}


function showSpinner() {
	const convertBtn = document.getElementById("convert-btn");
	convertBtn.disabled = true;
	const spinner = document.getElementById("submit-spinner");
	const text = document.getElementById("submit-text");
	spinner.style.display = "block";
	text.style.display = "none"
}