// functions/api/sorteo.js - Versión 4 cifras con elección de número
// Guardar en: /functions/api/sorteo.js

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const { nombre, whatsapp, barrio, palabraClave, numeroElegido } = data;

    if (!nombre || !whatsapp || !barrio || !palabraClave) {
      return new Response(JSON.stringify({ error: "Faltan datos" }), { status: 400 });
    }

    const whatsappLimpio = whatsapp.replace(/\D/g, '').slice(-10);
    if (whatsappLimpio.length < 10) {
      return new Response(JSON.stringify({ error: "WhatsApp inválido" }), { status: 400 });
    }

    // Validar palabra clave
    const palabraHoy = await env.SORTEO_KV.get("palabra_hoy") || "AMAPOLA";
    if (palabraClave.trim().toUpperCase() !== palabraHoy.toUpperCase()) {
      return new Response(JSON.stringify({ error: "Palabra clave incorrecta. Buscala en la vidriera." }), { status: 400 });
    }

    // Validar participación diaria
    const hoy = new Date().toISOString().slice(0,10);
    const keyDiario = `participacion_${whatsappLimpio}_${hoy}`;
    const yaParticipo = await env.SORTEO_KV.get(keyDiario);
    if (yaParticipo) {
      return new Response(JSON.stringify({ error: `Ya participaste hoy con el número ${yaParticipo}. Volvé mañana.`, numero: yaParticipo }), { status: 400 });
    }

    let numeroFinal = null;

    // Si eligió número
    if (numeroElegido && String(numeroElegido).trim() !== "") {
      const numLimpio = String(numeroElegido).replace(/\D/g, '').padStart(4, '0');
      const numInt = parseInt(numLimpio);
      
      if (numInt < 1 || numInt > 9999) {
        return new Response(JSON.stringify({ error: "Elegí un número entre 0001 y 9999" }), { status: 400 });
      }
      
      // Verificar si ya está tomado
      const existe = await env.SORTEO_KV.get(`registro_${numLimpio}`);
      if (existe) {
        return new Response(JSON.stringify({ error: `El número ${numLimpio} ya está ocupado. Elegí otro o dejá vacío para uno automático.` }), { status: 409 });
      }
      
      numeroFinal = numLimpio;
    } else {
      // Asignar secuencial
      let contador = await env.SORTEO_KV.get("contador_sorteo");
      contador = contador ? parseInt(contador) + 1 : 1;

      // Saltar números ya ocupados por elección
      let intento = 0;
      while (intento < 10000) {
        const candidato = String(contador).padStart(4, '0');
        const existe = await env.SORTEO_KV.get(`registro_${candidato}`);
        if (!existe) {
          numeroFinal = candidato;
          break;
        }
        contador++;
        intento++;
      }

      if (!numeroFinal) {
        return new Response(JSON.stringify({ error: "Se llenaron los 9999 números. ¡Gracias!" }), { status: 400 });
      }
      
      await env.SORTEO_KV.put("contador_sorteo", String(contador));
    }

    // Guardar registro
    const registro = {
      numero: numeroFinal,
      nombre: nombre.trim(),
      whatsapp: whatsappLimpio,
      barrio: barrio.trim(),
      palabraClave: palabraClave.trim().toUpperCase(),
      fecha: new Date().toISOString(),
      ip: request.headers.get("CF-Connecting-IP") || "unknown"
    };

    await env.SORTEO_KV.put(keyDiario, numeroFinal, { expirationTtl: 86400 * 30 });
    await env.SORTEO_KV.put(`registro_${numeroFinal}`, JSON.stringify(registro));
    
    // Si fue elegido, también actualizar contador si es mayor
    if (numeroElegido) {
      let contadorActual = await env.SORTEO_KV.get("contador_sorteo");
      contadorActual = contadorActual ? parseInt(contadorActual) : 0;
      const numInt = parseInt(numeroFinal);
      if (numInt > contadorActual) {
        await env.SORTEO_KV.put("contador_sorteo", String(numInt));
      }
    }

    const listaKey = `lista_${hoy}`;
    let listaHoy = await env.SORTEO_KV.get(listaKey, { type: "json" }) || [];
    listaHoy.push(registro);
    await env.SORTEO_KV.put(listaKey, JSON.stringify(listaHoy));

    return new Response(JSON.stringify({ 
      success: true,
      numero: numeroFinal,
      mensaje: `¡Listo ${nombre}! Tu número es ${numeroFinal}`
    }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: "Error: " + e.message }), { status: 500 });
  }
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== "mdq2026") {
    return new Response("No autorizado", { status: 401 });
  }
  const contador = await env.SORTEO_KV.get("contador_sorteo") || "0";
  return new Response(JSON.stringify({ total: contador }), {
    headers: { "Content-Type": "application/json" }
  });
}
