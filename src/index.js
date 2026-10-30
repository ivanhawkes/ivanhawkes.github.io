export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        try {
            // 1. Attempt to fetch the static file directly from the asset pipeline
            const response = await env.ASSETS.fetch(request);

            // 2. Handle Custom 404 Pages gracefully if the file isn't found
            if (response.status === 404) {
                const notFoundResponse = await env.ASSETS.fetch(
                    new URL('/404.html', url.origin)
                );
                return new Response(notFoundResponse.body, {
                    ...notFoundResponse,
                    status: 404,
                    headers: {
                        ...notFoundResponse.headers,
                        'content-type': 'text/html; charset=utf-8',
                    },
                });
            }

            return response;
        } catch (err) {
            // 3. Fallback crash handler
            return new Response('Internal Server Error', { status: 500 });
        }
    },
};
