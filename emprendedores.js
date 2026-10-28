// EMPRENDEDORES.JS - Renderizado modular directo desde emprendedores.json

function renderizarAviso(e) {
  // Si el objeto tiene el HTML artesanal guardado en el JSON, lo renderiza directo
  if (e.htmlCustom) {
    return e.htmlCustom;
  }

  // Tarjeta genérica de respaldo por las dudas
  return `
  <div class="card-emp" style="background:white;border-radius:16px;overflow:hidden;padding:16px;box-shadow:0 4px 12px rgba(0,0,0,.06);border:1px solid #e2e8f0;margin-bottom:14px;">
    <h3 style="margin:0 0 6px 0;font-size:19px;font-weight:900;color:#0f172a;">${e.nombre || 'Emprendimiento'}</h3>
    <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:6px;">${e.cat || ''}</div>
    <a href="https://wa.me/${e.wsp}" target="_blank" style="display:inline-block;background:#25D366;color:white;padding:10px 18px;border-radius:999px;font-weight:900;text-decoration:none;font-size:13px;">WhatsApp</a>
  </div>`;
}

// Carga e inyección dinámica desde emprendedores.json
document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById('grid-todos') || document.getElementById('contenedor-emprendedores');
  if (!contenedor) return;

  fetch('emprendedores.json')
    .then(res => res.json())
    .then(datos => {
if (Array.isArray(datos) && datos.length > 0) {
    contenedor.innerHTML = ''; // Limpiamos el contenedor
    datos.forEach(e => {
        // 1. Creamos un contenedor temporal para procesar el HTML del aviso
        const temp = document.createElement('div');
        temp.innerHTML = renderizarAviso(e);
        const cardEl = temp.firstElementChild;

        // 2. Si la tarjeta existe y tiene ID, le inyectamos el footer de corazones y redes
        if (cardEl && e.id) {
            const footer = crearFooterSinIG(e.id, e.nombre || 'Comercio del Barrio');
            cardEl.appendChild(footer);
        }

        // 3. Añadimos la tarjeta completa a la página
if (cardEl) {
  contenedor.appendChild(cardEl);
  // CARTEL PALABRA CLAVE DESPUÉS DE MADY
  if (e.id === "aviso-sabores-mady") {
    contenedor.insertAdjacentHTML('beforeend', `<div id="palabra-hoy" style="max-width:480px;margin:14px auto;padding:12px 16px;background:#fef9c3;border:2px dashed #f59e0b;border-radius:14px;text-align:center;font-weight:900;font-size:13px">🔑 Palabra clave de hoy: <span style="color:#a21caf">PREMIOS</span></div>`);
  }
}
    });
}
})
    .catch(err => {
      console.error("Error cargando emprendedores.json:", err);
      contenedor.innerHTML = '<div style="text-align:center;padding:20px;color:#ef4444;">Error al cargar los avisos.</div>';
    });
});
