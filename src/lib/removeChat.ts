import { prisma } from './prisma';

export const removeChat = async (chatId: string): Promise<void> => {
	await prisma.chat.delete({
		where: {
			id: chatId,
		},
	});
};
