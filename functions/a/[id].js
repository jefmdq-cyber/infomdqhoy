export async function onRequest({ params, request, env }) {
  try {
    const u = new URL(request.url);
    const slug = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
    const g = (a, ...ks) => { for (const k of ks) if (a[k] != null && a[k] !== '') return a[k]; return ''; };
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

    // --- SI PIDEN /a/og-algo, DEVOLVEMOS LA IMAGEN GENERADA ---
    if (params.id.startsWith('og-')) {
      let texto = decodeURIComponent(params.id.replace(/^og-/, '')).replace(/-/g, ' ').toUpperCase().slice(0, 70);
      const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#334155"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><rect x="40" y="40" width="1120" height="550" rx="32" fill="white" fill-opacity="0.05" stroke="white" stroke-opacity="0.1"/><text x="80" y="120" font-family="Arial Black" font-size="32" font-weight="900" fill="#facc15">INFO MDQ HOY</text><text x="80" y="300" font-family="Arial" font-size="64" font-weight="900" fill="white">${esc(texto)}</text><text x="80" y="380" font-family="Arial" font-size="26" fill="#cbd5e1">Mar del Plata • Alfar y toda la ciudad</text></svg>`;
      return new Response(svg, { headers: { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400' } });
    }

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

    const listaTxt = await getText('/lista-avisos.json');
    if (listaTxt.trim().startsWith('<')) throw new Error('lista-avisos.json devuelve HTML, no existe');
    const archivos = JSON.parse(listaTxt);
    const lista = [];
    for (const f of archivos) {
      try {
        const txt = await getText('/' + f.replace(/^\//,''));
        const data = JSON.parse(txt);
        if (Array.isArray(data)) lista.push(...data); else lista.push(data);
      } catch {}
    }

    if (params.id === '_ids') {
      return new Response(JSON.stringify(lista.map((a, i) => ({ n: i + 1, id: g(a,'id'), titulo: g(a,'titulo','title','nombre'), archivo: archivos[i] || '', enlace: '/a/' + slug(g(a,'id','slug','titulo','title','nombre')) })), null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' } });
    }

    let clave = params.id; try { clave = decodeURIComponent(clave); } catch {}
    const k = slug(clave);
    let a = lista.find(x => String(g(x,'id')).trim() === clave.trim());
    if (!a) a = lista.find(x => [g(x,'id'), g(x,'slug'), g(x,'titulo','title','nombre')].some(v => v !== '' && slug(v) === k));
    if (!a) return new Response('Aviso no encontrado: ' + clave, { status: 404 });

    const titulo = g(a, 'titulo', 'title', 'nombre') || 'Aviso';
    const desc = (g(a, 'descripcion', 'description', 'texto', 'detalle') || '').slice(0, 200) || titulo;

    function buscarImg(o) {
      let directo = g(o, 'imagen_frente', 'imagen', 'image', 'foto', 'foto_frente', 'img', 'foto_perfil', 'fotos', 'imagenes', 'galeria');
      if (directo) {
        let txt = Array.isArray(directo) ? directo[0] : (typeof directo === 'object' ? directo.url || directo.src || '' : directo);
        if (txt && typeof txt === 'string') {
          let m = txt.match(/src=["']([^"']+\.(?:webp|jpg|jpeg|png))/i);
          if (m) return m[1];
          if (/\.(webp|jpg|jpeg|png)/i.test(txt) && !txt.includes('amapola_logo')) return txt;
        }
      }
      let html = g(o, 'htmlCustom', 'html');
      if (html && typeof html === 'string') {
        let m = html.match(/src=["']([^"']+\.(?:webp|jpg|jpeg|png))/i);
        if (m && !m[1].includes('amapola_logo')) return m[1];
      }
      for (let k in o) {
        let v = o[k];
        if (typeof v === 'string' && /\.(webp|jpg|jpeg|png)/i.test(v) && !v.includes('amapola_logo') && v.length < 200) {
          let m = v.match(/src=["']([^"']+\.(?:webp|jpg|jpeg|png))/i);
          if (m) return m[1];
          return v;
        }
      }
      return '';
    }

    let imgCruda = buscarImg(a);
    let img;
    if (!imgCruda) {
      // 2da parte: si no hay foto, usa la imagen generada del mismo archivo
      img = u.origin + '/a/og-' + slug(g(a, 'id', 'slug', 'titulo', 'title', 'nombre'));
    } else {
      img = String(imgCruda).split(',')[0].trim().replace(/^"+|"+$/g, '');
      if (!/^https?:\/\//.test(img)) img = u.origin + '/' + img.replace(/^\.?\//, '');
    }
    
    const destino = u.origin + '/?aviso=' + encodeURIComponent(slug(g(a, 'id', 'slug', 'titulo', 'title', 'nombre')));
    return new Response(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(titulo)}</title><meta property="og:type" content="article"><meta property="og:site_name" content="Info MDQ Hoy"><meta property="og:title" content="${esc(titulo)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${esc(img)}"><meta property="og:url" content="${esc(u.href)}"><meta name="twitter:card" content="summary_large_image"><noscript><meta http-equiv="refresh" content="0;url=${esc(destino)}"></noscript></head><body><script>location.replace(${JSON.stringify(destino)})</script><a href="${esc(destino)}">Ver ${esc(titulo)}</a></body></html>`, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  } catch (e) {
    return new Response('Error Worker: ' + e.message + '\n' + e.stack, { status: 500 });
  }
}
