import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

async function startServer() {
	const vite = await createViteServer({
		server: { middlewareMode: "html" },
	});

	app.post("/api/save-gallery", async (req, res) => {
		try {
			const newEntry = req.body;
			const galleryPath = path.resolve(
				__dirname,
				"../../Landing-Page/components/Gallery/galleryData.tsx",
			);

			let existingContent = fs.readFileSync(galleryPath, "utf8");

			const match = existingContent.match(
				/const galleryData\s*:\s*Gallery\[\]\s*=\s*(\[[\s\S]*?\]);/,
			);

			if (!match) {
				console.error("Failed to parse existing galleryData.tsx");
				return res
					.status(500)
					.json({ message: "Failed to parse existing galleryData.tsx" });
			}

			const existingArrayStr = match[1];

			let existingArray;
			try {
				existingArray = eval(existingArrayStr);
			} catch (e) {
				console.error("Eval parse failed", e);
				return res
					.status(500)
					.json({ message: "Failed to parse galleryData array" });
			}

			existingArray.push(newEntry);

			const fileContent = `import { Gallery } from "@/types/gallery";

			const galleryData: Gallery[] = ${JSON.stringify(existingArray, null, 2)};

			export default galleryData;`;

			fs.writeFileSync(galleryPath, fileContent);
			res.json({ message: "Gallery updated!" });
		} catch (err) {
			console.error("Failed to save gallery data", err);
			res.status(500).json({ message: "Failed to save gallery data" });
		}
	});

	app.use(vite.middlewares);

	app.listen(5000, () => {
		console.log("Server running on http://localhost:5000");
	});
}

startServer();
