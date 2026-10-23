export async function onRequest({ params, request, env }) {
  try {
    const u = new URL(request.url);
    const slug = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
    const g = (a, ...ks) => { for (const k of ks) if (a[k] != null && a[k] !== '') return a[k]; return ''; };
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

    async function getText(path) {
      try {
        if (env && env.ASSETS) {
          const r = await env.ASSETS.fetch(new Request(u.origin + path));
          if (r.ok) return await r.text();
        }
      } catch {}
      const r2 = await fetch(u.origin + path);
      if (!r2.ok) throw new Error(path + ' -> ' + r2.status);
      return await r2.text();
    }

    // Lee la lista de archivos separados
    const listaTxt = await getText('/lista-avisos.json');
    if (listaTxt.trim().startsWith('<')) throw new Error('lista-avisos.json devuelve HTML, no existe');
    const archivos = JSON.parse(listaTxt);

    // Lee cada archivo separado y lo junta en memoria solo para el Worker
    const lista = [];
    for (const f of archivos) {
      try {
        const txt = await getText('/' + f.replace(/^\//,''));
        const data = JSON.parse(txt);
        if (Array.isArray(data)) lista.push(...data);
        else lista.push(data);
      } catch (e) {
        console.log('fallo ' + f + ': ' + e.message);
      }
    }

    if (params.id === '_ids') {
      return new Response(JSON.stringify(lista.map((a, i) => ({
        n: i + 1, id: g(a,'id'), titulo: g(a,'titulo','title','nombre'), archivo: archivos[i] || '', enlace: '/a/' + slug(g(a,'id','slug','titulo','title','nombre'))
      })), null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' } });
    }

    let clave = params.id; try { clave = decodeURIComponent(clave); } catch {}
    const k = slug(clave);
    let a = lista.find(x => String(g(x,'id')).trim() === clave.trim());
    if (!a) a = lista.find(x => [g(x,'id'), g(x,'slug'), g(x,'titulo','title','nombre')].some(v => v !== '' && slug(v) === k));
    if (!a) return new Response('Aviso no encontrado: ' + clave + '. Revisa /a/_ids', { status: 404 });

    const titulo = g(a, 'titulo', 'title', 'nombre') || 'Aviso';
    const desc = (g(a, 'descripcion', 'description', 'texto', 'detalle') || '').slice(0, 200) || titulo;
       // --- BUSCADOR DE FOTO A PRUEBA DE TODO ---
    function buscarImg(o) {
      // 1. Busca los nombres conocidos primero
      let directo = g(o, 'imagen_frente', 'imagen', 'image', 'foto', 'foto_frente', 'img', 'foto_perfil');
      if (directo) return directo;
      // 2. Si no, busca cualquier campo que contenga una imagen
      for (let k in o) {
        let v = o[k];
        if (typeof v === 'string' && /\.(webp|jpg|jpeg|png)$/i.test(v) && !v.includes('amapola_logo')) {
          return v;
        }
        if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string' && /\.(webp|jpg|jpeg|png)/i.test(v[0])) {
          return v[0];
        }
      }
      return '';
    }
    let img = String(buscarImg(a) || 'amapola_logo_transparente.webp');
    if (img.includes(',')) img = img.split(',')[0].trim();
    if (!/^https?:\/\//.test(img)) img = u.origin + '/' + img.replace(/^\.?\//, '');
    if (img.includes(',')) img = img.split(',')[0].trim();
    if (!/^https?:\/\//.test(img)) img = u.origin + '/' + img.replace(/^\.?\//, '');
    const destino = u.origin + '/?aviso=' + encodeURIComponent(slug(g(a, 'id', 'slug', 'titulo', 'title', 'nombre')));

    return new Response(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(titulo)}</title><meta property="og:type" content="article"><meta property="og:site_name" content="Info MDQ Hoy"><meta property="og:title" content="${esc(titulo)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${esc(img)}"><meta property="og:url" content="${esc(u.href)}"><meta name="twitter:card" content="summary_large_image"><noscript><meta http-equiv="refresh" content="0;url=${esc(destino)}"></noscript></head><body><script>location.replace(${JSON.stringify(destino)})</script><a href="${esc(destino)}">Ver ${esc(titulo)}</a></body></html>`, { headers: { 'content-type': 'text/html; charset=utf-8' } });

  } catch (e) {
    return new Response('Error Worker: ' + e.message + '\n' + e.stack, { status: 500 });
  }
}
