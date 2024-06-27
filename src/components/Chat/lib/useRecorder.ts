import { useRef } from 'react';

interface Result {
	record: () => Promise<Blob>;
	stop: () => void;
}

export const useRecorder = (): Result => {
	const currentMediaRecorder = useRef<MediaRecorder>();

	return {
		stop: () => currentMediaRecorder.current?.stop(),
		record: async () => {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			const mediaRecorder = new MediaRecorder(stream);

			currentMediaRecorder.current = mediaRecorder;

			const promise = new Promise<Blob>((resolve, reject) => {
				let audioChunks: Blob[] = [];

				const onStart = (): void => {
					audioChunks = [];
				};
				const onDataAvailable = (e: BlobEvent): void => {
					audioChunks.push(e.data);
				};
				const onError = (e: Event): void => {
					reject(e);
				};
				const onStop = (): void => {
					const audioBlob = new Blob(audioChunks, {
						type: audioChunks[0].type,
					});

					stream.getTracks().forEach(track => track.stop());

					resolve(audioBlob);

					mediaRecorder.removeEventListener(`start`, onStart);
					mediaRecorder.removeEventListener(`dataavailable`, onDataAvailable);
					mediaRecorder.removeEventListener(`stop`, onStop);
					mediaRecorder.removeEventListener(`error`, onError);
				};

				mediaRecorder.addEventListener(`start`, onStart);
				mediaRecorder.addEventListener(`dataavailable`, onDataAvailable);
				mediaRecorder.addEventListener(`stop`, onStop);
				mediaRecorder.addEventListener(`error`, onError);
			});

			// https://community.openai.com/t/whisper-api-cannot-read-files-correctly/93420/47
			mediaRecorder.start(1000);

			return promise;
		},
	};
};
