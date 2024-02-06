import fs from 'fs';
import { mkdir } from 'fs/promises';
import streamWeb from 'node:stream/web';
import path from 'path';
import sharp from 'sharp';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { v4 } from 'uuid';

const downloadDir = path.join(process.cwd(), `public/images`);

export const downloadFile = async (url: string): Promise<string> => {
	const res = await fetch(url);
	if (!fs.existsSync(downloadDir)) {
		await mkdir(downloadDir);
	}

	const fileName = `${v4()}.webp`;

	const destination = path.join(downloadDir, fileName);
	const fileStream = fs.createWriteStream(destination, { flags: `wx` });

	if (!res.body) {
		throw new Error(`No body`);
	}

	await finished(
		Readable.fromWeb(res.body as streamWeb.ReadableStream)
			.pipe(sharp().webp())
			.pipe(fileStream),
	);
	console.log(`File downloaded to ${destination}`);

	return fileName;
};
