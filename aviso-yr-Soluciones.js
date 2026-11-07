
// AVISO YR SOLUCIONES - LOADER APARTE, NO TOCA avisos.js ORIGINAL
function asegurarContenedorYR(id){
  let c = document.getElementById(id);
  if(c) return c;
  c = document.createElement('div');
  c.id = id;
  c.style.cssText='max-width:760px;margin:0 auto 20px auto;padding:0 20px;box-sizing:border-box;';
  c.dataset.barrios = '["estacion-chapadmalal","chapadmalal"]';
  // Si estamos en comercios.html, meterlo en contenedor-barrios para que no se vaya después del footer
  const zonaBarrios = document.getElementById('contenedor-barrios');
  if(zonaBarrios){ zonaBarrios.appendChild(c); return c; }
  const ref = document.getElementById('features-wrapper');
  if(ref && ref.parentNode) ref.parentNode.insertBefore(c, ref.nextSibling);
  else document.body.appendChild(c);
  return c;
}

const slugYR = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

async function cargarAvisoYRSoluciones(){
  try{
    const res = await fetch('./yr-soluciones.json?v=' + Date.now());
    if(!res.ok) return;
    const yr = await res.json();
    const contenedor = asegurarContenedorYR('contenedor-aviso-yr-soluciones');

    if(contenedor && yr){
      contenedor.dataset.barrios = JSON.stringify(yr.barrios || ["estacion-chapadmalal"]);
      
      contenedor.innerHTML = `
        <div id="${slugYR(yr.id)}" data-search="${yr.search_tags}" style="box-sizing:border-box;width:100%;max-width:100%;margin:0 auto 20px auto;background:#0a1628;border-radius:28px;overflow:hidden;box-shadow:0 16px 45px rgba(0,0,0,0.3);border:2px solid #1e40af;font-family:Inter,system-ui,sans-serif;position:relative;">
          
          <!-- HEADER NEGRO CON LOGO YR -->
          <div style="background:linear-gradient(135deg,#020617 0%, #0f172a 50%, #1e293b 100%);padding:18px 20px;position:relative;overflow:hidden;border-bottom:3px solid #2563eb;">
            <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;background:radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%);pointer-events:none;"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;position:relative;z-index:1;">
              <div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <div style="background:#2563eb;color:white;font-weight:900;font-size:22px;padding:6px 10px;border-radius:8px;letter-spacing:-1px;box-shadow:0 4px 12px rgba(37,99,235,0.4);">YR</div>
                  <div style="color:white;font-weight:900;font-size:20px;letter-spacing:-0.5px;line-height:1;">SOLUCIONES<br><span style="font-size:11px;color:#93c5fd;letter-spacing:1px;">SERVICIO TÉCNICO ESPECIALIZADO</span></div>
                </div>
              </div>
              <div style="background:linear-gradient(90deg,#3b82f6,#60a5fa);color:white;font-size:9px;font-weight:900;padding:5px 10px;border-radius:999px;white-space:nowrap;">🇦🇷 SERVICIO OFICIAL</div>
            </div>
          </div>

          <!-- IMAGEN PRINCIPAL -->
          <div style="position:relative;overflow:hidden;background:#000;">
            <img src="${yr.imagen_fachada}" alt="${yr.nombre}" loading="lazy" style="display:block;width:100%;height:auto;max-height:380px;object-fit:cover;">
            <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(0deg, rgba(10,22,40,0.95) 0%, transparent 100%);padding:18px 16px 12px 16px;">
              <div style="color:white;font-weight:900;font-size:clamp(18px,4vw,24px);line-height:1;text-transform:uppercase;text-shadow:0 2px 8px rgba(0,0,0,0.8);">EN YR SOLUCIONES<br><span style="color:#60a5fa;font-size:clamp(22px,5vw,30px);">ARREGLAMOS</span></div>
              <div style="color:#e2e8f0;font-size:13px;font-weight:700;margin-top:4px;">Tu máquina vuelve a andar 🔧</div>
            </div>
          </div>

          <!-- CUERPO -->
          <div style="padding:18px 18px 20px 18px;background:#f8fafc;">
            
            <div style="background:#0f172a;color:white;border-radius:16px;padding:14px 16px;margin-bottom:14px;border:1px solid #1e40af;">
              <div style="font-size:13px;font-weight:900;color:#60a5fa;margin-bottom:6px;">¿Se rompió tu herramienta? La arreglamos</div>
              <div style="font-size:12.5px;font-weight:600;color:#cbd5e1;line-height:1.4;">${yr.descripcion}</div>
            </div>

            <!-- SERVICIO OFICIAL -->
            <div style="background:white;border:1.5px solid #e2e8f0;border-radius:14px;padding:12px;margin-bottom:14px;">
              <div style="font-size:10px;font-weight:900;color:#1e40af;letter-spacing:1px;margin-bottom:8px;text-align:center;">SERVICIO TÉCNICO OFICIAL</div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
                <div style="background:#facc15;color:#422006;font-weight:900;font-size:11px;padding:8px 4px;border-radius:8px;text-align:center;border:1px solid #eab308;">CROSSMASTER</div>
                <div style="background:#f97316;color:white;font-weight:900;font-size:12px;padding:8px 4px;border-radius:8px;text-align:center;">bta TOOLS</div>
                <div style="background:#0f172a;color:white;font-weight:800;font-size:10px;padding:8px 4px;border-radius:8px;text-align:center;border:1px solid #334155;">DOWEN PAGIO</div>
              </div>
            </div>

            <!-- DIRECCIÓN Y HORARIO -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
              <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:10px 12px;">
                <div style="font-size:10px;font-weight:900;color:#64748b;letter-spacing:0.5px;">📍 DIRECCIÓN</div>
                <div style="font-size:12px;font-weight:800;color:#0f172a;margin-top:2px;line-height:1.2;">${yr.direccion_completa}</div>
              </div>
              <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:10px 12px;">
                <div style="font-size:10px;font-weight:900;color:#64748b;">🕒 HORARIO</div>
                <div style="font-size:11px;font-weight:800;color:#0f172a;margin-top:2px;">${yr.horario}</div>
                <div style="font-size:10px;font-weight:700;color:#16a34a;margin-top:2px;">${yr.consultas}</div>
              </div>
            </div>

            <!-- BOTONES PRINCIPALES -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
              <a href="${yr.whatsapp_url}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#25D366;color:white;padding:13px 10px;border-radius:14px;font-weight:900;font-size:13px;text-decoration:none;box-shadow:0 6px 18px rgba(37,211,102,0.35);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19.05 4.94A9.82 9.82 0 0012.04 2C6.58 2 2.15 6.44 2.15 11.9c0 1.75.46 3.45 1.33 4.96L2 22l5.26-1.38a9.84 9.84 0 004.78 1.22h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.13-2.9-7zM12.05 20.3h-.01a8.19 8.19 0 01-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 01-1.27-4.54c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 012.41 5.82c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.15c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13s-.64.81-.79.97-.29.19-.54.06c-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.1-.51.11-.11.25-.29.37-.43.12-.15.16-.25.24-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.57c.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.48-.29z"/></svg>
                WhatsApp
              </a>
              <a href="${yr.maps_url}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#0f172a;color:white;padding:13px 10px;border-radius:14px;font-weight:900;font-size:13px;text-decoration:none;box-shadow:0 6px 18px rgba(15,23,42,0.2);">
                📍 Ver Mapa
              </a>
            </div>

            <!-- BOTONES SECUNDARIOS: IG, FB, WEB -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
              <a href="${yr.instagram_url}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:6px;background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);color:white;padding:11px 6px;border-radius:12px;font-weight:800;font-size:12px;text-decoration:none;">
                📸 IG
              </a>
              <a href="${yr.facebook_url}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:6px;background:#1877f2;color:white;padding:11px 6px;border-radius:12px;font-weight:800;font-size:12px;text-decoration:none;">
                f Facebook
              </a>
              <a href="${yr.web_url}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:6px;background:white;border:1.5px solid #e2e8f0;color:#0f172a;padding:11px 6px;border-radius:12px;font-weight:800;font-size:12px;text-decoration:none;">
                🌐 Web
              </a>
            </div>

            <div style="text-align:center;font-size:11px;color:#64748b;font-weight:700;margin-top:14px;">${yr.pie_texto}</div>
          </div>
        </div>
      `;

      try{
        if(typeof crearFooterSinIG === 'function'){
          contenedor.appendChild(crearFooterSinIG(yr.id, yr.nombre));
        }
      }catch(e){}
    }
  }catch(e){ console.error("Error YR Soluciones:", e); }
}

cargarAvisoYRSoluciones();
