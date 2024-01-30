import cookie from 'cookie';
import { add } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';
import { v4 } from 'uuid';

const withRewritenCookieHeader = (requestHeaders: Headers): { headers: Headers; userId: string } => {
	const cookies = requestHeaders.get(`cookie`);

	const parsedCookies = cookie.parse(cookies || ``);
	parsedCookies.userId = parsedCookies.userId || v4();

	const serializedCookies = [];
	for (const [key, value] of Object.entries(parsedCookies)) {
		serializedCookies.push(cookie.serialize(key, value, { expires: add(new Date(), { years: 1 }) }));
	}

	const newRequestHeaders = new Headers(requestHeaders);
	newRequestHeaders.set(`cookie`, serializedCookies.join(`; `));

	return { headers: newRequestHeaders, userId: parsedCookies.userId };
};

export const middleware = (request: NextRequest): NextResponse => {
	const { headers, userId } = withRewritenCookieHeader(request.headers);

	const response = NextResponse.next({
		request: {
			headers,
		},
	});

	response.cookies.set(`userId`, userId, {
		expires: add(new Date(), { years: 1 }),
	});

	return response;
};
