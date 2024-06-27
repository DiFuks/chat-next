import OpenAI, { toFile } from 'openai';

export const POST = async (request: Request): Promise<Response> => {
	const formData = await request.formData();
	const file = formData.get(`file`) as File;
	const apiKey = formData.get(`apiKey`) as string;

	const openai = new OpenAI({
		apiKey,
	});

	const openAIFile = await toFile(file, `audio.${file.type.split(`/`).pop()}`);

	const transcription = await openai.audio.transcriptions.create({
		file: openAIFile,
		model: `whisper-1`,
	});

	console.log(transcription);

	return new Response(JSON.stringify(transcription), {
		headers: {
			'Content-Type': `application/json`,
		},
	});
};
