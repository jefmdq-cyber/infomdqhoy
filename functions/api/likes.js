export async function onRequest({ request, env }) {
  const u = new URL(request.url);
  const method = request.method;

  // Si es GET, solo lee y devuelve el valor actual
  if (method === 'GET') {
    const id = u.searchParams.get('id');
    if (!id) return new Response('0', { headers: { 'Access-Control-Allow-Origin': '*' } });
    const count = await env.KV_LIKES.get('likes_' + id) || '0';
    return new Response(count, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/plain' }
    });
  }

  // Si es POST, incrementa el contador y lo guarda en KV
  if (method === 'POST') {
    try {
      const body = await request.json();
      const id = body.id;
      if (!id) return new Response('0', { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });

      const key = 'likes_' + id;
      let current = parseInt(await env.KV_LIKES.get(key) || '0', 10);
      current += 1;
      
      await env.KV_LIKES.put(key, current.toString());

      return new Response(current.toString(), {
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/plain' }
      });
    } catch (e) {
      return new Response('0', { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
