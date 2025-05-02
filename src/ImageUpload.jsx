import { useState } from "react";
import galleryData from "../../Landing-Page/components/Gallery/galleryData.tsx";

const cloudName = "your_own_name";
const uploadPreset = "your_ow_preset";

function ImageUpload() {
	const [secureUrls, setSecureUrls] = useState([]);
	const [title, setTitle] = useState("");

	const uploadImage = () => {
		window.cloudinary.openUploadWidget(
			{
				cloudName,
				uploadPreset,
				folder: title,
			},
			(error, result) => {
				if (!error && result && result.event === "success") {
					setSecureUrls((prev) => [...prev, result.info.secure_url]);
				}
			},
		);
	};

	const saveGalleryData = async () => {
		if (secureUrls.length === 0 || title.trim() === "") {
			alert("Please upload images and enter a title first.");
			return;
		}

		const newId = galleryData.length + 2;
		const newEntry = {
			id: newId,
			image: secureUrls[0],
			title: title,
			album: {
				firstColumn: secureUrls.slice(0, 4).map((url, index) => ({
					id: index + 1,
					image: url,
				})),
				secondColumn: secureUrls.slice(4).map((url, index) => ({
					id: index + 1,
					image: url,
				})),
			},
		};

		try {
			const response = await fetch("http://localhost:5000/api/save-gallery", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newEntry),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();
			console.log("Gallery saved!", data);
			alert("Gallery saved successfully!");
		} catch (err) {
			console.error("Failed to save gallery data", err);
			alert("Failed to save gallery data");
		}
	};

	return (
		<div>
			<input
				placeholder="Enter Title (Folder Name)"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
			/>
			<br />
			<button onClick={uploadImage}>Upload Images</button>
			<button onClick={saveGalleryData}>Save to galleryData.js</button>

			<p>Uploaded URLs count: {secureUrls.length}</p>
		</div>
	);
}

export default ImageUpload;
