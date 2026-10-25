function asegurarContenedor(id){
  let c = document.getElementById(id);
  if(c) return c;
  c = document.createElement('div');
  c.id = id;
  c.style.cssText='max-width:760px;margin:0 auto 20px auto;padding:0 20px;';
  const ref = document.getElementById('features-wrapper');
  if(ref && ref.parentNode) ref.parentNode.insertBefore(c, ref.nextSibling);
  else document.body.appendChild(c);
  return c;
}

function asegurarContenedorPadreAvisos(){
  let p = document.getElementById('contenedor-avisos') || document.getElementById('contenedor-aviso-farmacia') || document.getElementById('contenedor-todos-los-avisos');
  if(p) return p;
  p = document.createElement('div');
  p.id='contenedor-todos-los-avisos';
  p.style.cssText='max-width:760px;margin:0 auto;padding:0 20px;';
  const ref = document.getElementById('features-wrapper');
  if(ref && ref.parentNode) ref.parentNode.insertBefore(p, ref.nextSibling);
  else document.body.appendChild(p);
  return p;
}

const slug = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

function compartirFacebookReal(id){
  const url = encodeURIComponent(location.origin + '/a/' + slug(id));
  window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank', 'width=600,height=400');
}

function compartirWhatsAppReal(id, nombre){
  const url = location.origin + '/a/' + slug(id);
  const texto = encodeURIComponent('Mirá ' + nombre + ' en INFO MDQ HOY:\n' + url);
  window.open('https://wa.me/?text=' + texto, '_blank');
}

async function darAmorReal(id, btn){
  const storageKey = 'liked_'+id;
  const span = btn.querySelector('.corazon-num');
  const countActual = parseInt(span?.textContent || '0', 10);
  const yaVotado = localStorage.getItem(storageKey);
  if(yaVotado && countActual > 0){
    btn.animate([{transform:'scale(1)'},{transform:'scale(1.25)'},{transform:'scale(1)'}], {duration:200});
    return;
  }
  btn.disabled = true;
  btn.style.transform='scale(1.15)';
  try{
    const res = await fetch('/api/likes?v=' + Date.now(), {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({id}),
      cache: 'no-store'
    });
    if(!res.ok) throw new Error('fail');
    const totalReal = (await res.text()).trim();
    localStorage.setItem(storageKey,'1');
    if(span) span.textContent = totalReal;
    btn.style.background='#fecaca';
  }catch(e){
    console.error("Error guardando amor:", e);
  } finally {
    btn.style.transform='scale(1)';
    btn.disabled = false;
  }
}
window.darAmorReal = darAmorReal;

function crearFooterSinIG(id, nombre){
  const cont = document.createElement('div');
  cont.className='footer-amor-auto';
  cont.style.cssText="margin:12px 0 22px 0;background:#ffffff;border:2px solid #ffe4e6;border-radius:18px;box-shadow:0 6px 20px rgba(0,0,0,0.08);overflow:hidden";
  const yaLiked = localStorage.getItem('liked_'+id);
  cont.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 14px 12px 14px;gap:10px;">'
    +'<button type="button" onclick="event.stopPropagation(); darAmorReal(\''+id+'\', this)" data-like-id="'+id+'" style="display:flex;align-items:center;gap:8px;background:'+(yaLiked ? '#fecaca' : '#fff0f0')+';border:2px solid #fecaca;border-radius:999px;padding:10px 18px;font-weight:900;font-size:16px;cursor:pointer;">'
  +'<span style="font-size:18px;color:#ef4444">❤️</span><span class="corazon-num" style="font-size:16px;color:#be123c">0</span></button>'
    +'<div style="flex:1;text-align:left;padding-left:6px;"><div style="font-weight:900;font-size:13px;color:#0f172a;line-height:1.15;">Dale amor a tu comercio favorito y compartilo</div>'
    +'<div style="font-weight:600;font-size:11px;color:#64748b;margin-top:2px;">'+nombre+'</div></div></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 12px 12px 12px;background:#fff5f5;">'
    +'<button type="button" onclick="event.stopPropagation(); compartirFacebookReal(\''+id+'\')" style="display:flex;align-items:center;justify-content:center;gap:6px;background:#1877f2;color:#fff;border:none;border-radius:12px;padding:11px 6px;font-weight:800;font-size:13px;cursor:pointer;">f Facebook</button>'
    +'<button type="button" onclick="event.stopPropagation(); compartirWhatsAppReal(\''+id+'\',\''+nombre.replace(/'/g,"\\'")+'\')" style="display:flex;align-items:center;justify-content:center;gap:6px;background:#25D366;color:#fff;border:none;border-radius:12px;padding:11px 6px;font-weight:800;font-size:13px;cursor:pointer;">💬 WhatsApp</button></div>';
  fetch('/api/likes?id=' + encodeURIComponent(id) + '&v=' + Date.now(), {cache:'no-store'})
    .then(res => res.text())
    .then(count => {
      const span = cont.querySelector('.corazon-num');
      if(span) span.textContent = (count || '0').trim();
    })
    .catch(() => {
      const span = cont.querySelector('.corazon-num');
      const s = cont.querySelector('.corazon-num');
      if(s) s.textContent = '0';
    });
  return cont;
}


// ==========================================
// 1. CARGA DE FARMACIA VARA (Diseño Original Ajustado)
// ==========================================
async function cargarAvisoFarmacia() {
  try {
    const resFarmacia = await fetch('./farmacia-vara.json?v=' + Date.now());
    if (!resFarmacia.ok) return;
    const farmacia = await resFarmacia.json();
    const contenedorFarmacia = asegurarContenedorPadreAvisos();

    if (contenedorFarmacia && farmacia) {
      const wspLink = 'https://wa.me/' + farmacia.whatsapp;

      // Renderizar servicios
      let serviciosHtml = '';
      if (farmacia.servicios && farmacia.servicios.length > 0) {
        serviciosHtml = farmacia.servicios.map(s => '<div style="margin: 6px 0; font-size: 13px; font-weight: 800; color: #0f172a;">' + s + '</div>').join('');
      }

      // Renderizar obras sociales
      let obrasHtml = '';
      if (farmacia.obras_sociales && farmacia.obras_sociales.length > 0) {
        obrasHtml = farmacia.obras_sociales.map(o => 
          '<div style="display: flex; align-items: center; gap: 8px; margin: 6px 0;">' +
          '<span style="background:' + o.color + '; color: white; font-size: 11px; font-weight: 900; padding: 3px 8px; border-radius: 6px;">' + o.nombre + '</span>' +
          '<span style="font-size: 13px; font-weight: 800; color: #0f172a;">Atiende ' + o.nombre + '</span>' +
          '</div>'
        ).join('');
      }

      // Renderizar horarios
      let horariosHtml = '';
      if (farmacia.horarios_lineas && farmacia.horarios_lineas.length > 0) {
        horariosHtml = '<div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 12px 14px; margin: 12px 0;">' +
          (farmacia.horarios_titulo ? '<div style="font-size: 11px; font-weight: 900; color: #0f172a; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;"><span style="font-size: 14px;">⏱️</span> ' + farmacia.horarios_titulo + '</div>' : '') +
          farmacia.horarios_lineas.map(h => '<div style="font-size: 12px; font-weight: 700; color: #334155; margin: 2px 0;">' + h + '</div>').join('') +
          '</div>';
      }

      contenedorFarmacia.innerHTML = '<div id="' + slug(farmacia.id) + '" style="background:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.1); padding:14px; margin-bottom:20px;">' +
        // Cabecera superior negra
        '<div style="background:#0a0a0a; padding:14px 20px; display:flex; align-items:center; justify-content:space-between; border-radius:20px; margin:10px 10px 0 10px; box-shadow:0 4px 15px rgba(0,0,0,0.3);">' +
        '<div style="color:#ffffff; font-size:22px; font-weight:900; letter-spacing:1px; text-transform:uppercase;">' + farmacia.nombre + '</div>' +
        '<div style="width: 52px; height: 52px; background: linear-gradient(135deg, #a7f3d0 0%, #10b981 50%, #047857 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; position: relative; border: 3px solid #ffffff; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">' +
        '<div style="width: 32px; height: 12px; background: #ffffff; border-radius: 4px; position: absolute;"></div>' +
        '<div style="width: 12px; height: 32px; background: #ffffff; border-radius: 4px; position: absolute;"></div>' +
        '<div style="width: 12px; height: 12px; background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(16,185,129,0.4)); position: absolute; border-radius: 3px; z-index: 2;"></div></div></div>' +
        
        // Contenido principal en orden original
        '<div style="padding:14px;">' +
        (farmacia.imagen_frente ? '<div style="border-radius:16px; border:1px solid #e2e8f0; overflow:hidden; margin-bottom:14px;"><img src="' + farmacia.imagen_frente + '" alt="' + farmacia.nombre + '" style="width:100%; height:auto; display:block;"></div>' : '') +
        (farmacia.slogan ? '<div style="font-size: 18px; font-weight: 900; color: #064e3b; margin-bottom: 12px; line-height: 1.2;">' + farmacia.slogan + '</div>' : '') +
        
        serviciosHtml +
        obrasHtml +
        horariosHtml +

        // Barra de 3 botones (WhatsApp, Mapa, Dirección)
        '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; background: #86efac; border-radius: 16px; padding: 10px; margin: 16px 0; align-items: center; text-align: center; gap: 4px;">' +
          // WhatsApp
          '<a href="' + wspLink + '" target="_blank" onclick="event.stopPropagation()" style="text-decoration: none; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px; border-right: 1.5px solid rgba(0,0,0,0.1);">' +
            '<div style="width: 26px; height: 26px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 3px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M19.05 4.94A9.82 9.82 0 0012.03 2C6.48 2 2 6.44 2 11.93c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.37a9.82 9.82 0 004.78 1.22h.01c5.54 0 10.03-4.44 10.03-9.93a9.75 9.75 0 00-3.02-7.98z"/></svg></div>' +
            '<div style="color: #064e3b; font-weight: 900; font-size: 11.5px; line-height: 1.1;">WhatsApp</div>' +
            '<div style="color: #064e3b; font-weight: 800; font-size: 10.5px; margin-top: 1px;">' + (farmacia.whatsapp_texto || '') + '</div>' +
          '</a>' +
          // Ver en mapa
          '<a href="' + (farmacia.maps || farmacia.direccion_url || '#') + '" target="_blank" onclick="event.stopPropagation()" style="text-decoration: none; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px; border-right: 1.5px solid rgba(0,0,0,0.1);">' +
            '<div style="width: 26px; height: 26px; background: #0f766e; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 3px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"></path><circle cx="12" cy="9" r="2.5"></circle></svg></div>' +
            '<div style="color: #064e3b; font-weight: 900; font-size: 11px; line-height: 1.2;">Ver en<br>el mapa</div>' +
          '</a>' +
          // Dirección
          '<a href="' + (farmacia.direccion_url || farmacia.maps || '#') + '" target="_blank" onclick="event.stopPropagation()" style="text-decoration: none; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px;">' +
            '<div style="width: 26px; height: 26px; background: #14532d; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 3px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 21s-6-5.373-6-10a6 6 0 0 1 12 0c0 4.627-6 10-6 10z"></path><circle cx="12" cy="11" r="2"></circle></svg></div>' +
            '<div style="color: #064e3b; font-weight: 900; font-size: 10px; line-height: 1.1; text-align: center;">' + (farmacia.direccion || '') + '</div>' +
          '</a>' +
        '</div>' +

        // Botón de Instagram
        (farmacia.instagram ? '<a href="' + farmacia.instagram + '" target="_blank" style="display:block; margin: 0 0 10px 0; padding:12px; border-radius:14px; background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045); color:white; font-weight:900; text-align:center; text-decoration:none; font-size: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">📸 ' + (farmacia.instagram_user || '@farmaciavaraok') + '</a>' : '') +

        // Pie de texto
        (farmacia.pie_texto ? '<div style="text-align:center; font-size:11px; color:#64748b; font-weight:700; padding: 4px 0 6px 0;">' + farmacia.pie_texto + '</div>' : '') +

        '</div></div>';

      try { contenedorFarmacia.appendChild(crearFooterSinIG(farmacia.id, farmacia.nombre)); } catch (e) {}
    }
  } catch (error) {
    console.error("Error cargando Farmacia Vara:", error);
  }
}
cargarAvisoFarmacia();

// ==========================================
// 2. CARGA DE AMAPOLA'S DIETÉTICA
// ==========================================
async function cargarAvisoAmapolas() {
  try {
    const resAmapolas = await fetch('./amapolas-dietetica.json?v=' + Date.now());
    if (!resAmapolas.ok) return;
    const amapolas = await resAmapolas.json();
    const contenedorAmapolas = asegurarContenedor('contenedor-aviso-amapolas');

    if (contenedorAmapolas && amapolas) {
      let pillsHtml = '';
      if (amapolas.pills) {
        pillsHtml = amapolas.pills.map(function(p){
          return '<span class="amapola-pill '+ (p.clase||'') +'" style="background:'+p.color+'; color:'+p.texto_color+'; font-size:11px; font-weight:800; padding:4px 8px; border-radius:8px; display:inline-block;">'+p.texto+'</span>';
        }).join('');
      }

      contenedorAmapolas.innerHTML = '<div id="'+slug(amapolas.id)+'" class="amapola-card" onclick="abrirModalAmapola(this)" style="cursor:pointer; background:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.1); padding:14px; margin-bottom:20px;">'
        +'<div class="amapola-fachada-wrap" style="position:relative; border-radius:16px; overflow:hidden; margin-bottom:12px;">'
        +'<img src="'+amapolas.imagen_fachada+'" alt="'+amapolas.nombre+'" class="amapola-fachada" style="width:100%; height:auto; display:block;">'
        +(amapolas.logo_circle ? '<div class="amapola-logo-circle" style="position:absolute; bottom:10px; left:10px; width:60px; height:60px; background:white; border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.2);"><img src="'+amapolas.logo_circle+'" alt="Logo" style="width:90%; height:auto;"></div>' : '')
        +(amapolas.badge_top ? '<div class="amapola-badge-top" style="position:absolute; top:10px; right:10px; background:#2e7d32; color:white; font-size:10px; font-weight:900; padding:4px 8px; border-radius:12px;">'+amapolas.badge_top+'</div>' : '')
        +'</div>'
        +'<div class="amapola-title" style="font-size:20px; font-weight:900; color:#1e293b;">'+amapolas.nombre+'</div>'
        +'<div class="amapola-subtitle" style="font-size:13px; font-weight:700; color:#475569; margin-bottom:10px;">'+amapolas.subtitulo+'</div>'
        +'<div class="amapola-badges" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">'+pillsHtml+'</div>'
        +'<div class="amapola-ubicacion" style="margin-bottom:12px; padding:10px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;">'
        +'<div style="font-size:13px; color:#1E293B;"><b>📍 '+amapolas.direccion_titulo+'</b><br><small>'+amapolas.direccion_sub1+'</small><br><small style="font-size:11px; color:#2E7D32; font-weight:700;">'+amapolas.direccion_sub2+'</small></div></div>'
        +(amapolas.whatsapp_url ? '<a href="'+amapolas.whatsapp_url+'" target="_blank" rel="noopener noreferrer" class="amapola-btn btn-wsp" style="display:block; background:#25D366; color:white; text-align:center; padding:10px; border-radius:12px; font-weight:900; font-size:13px; text-decoration:none; margin-bottom:8px;">'+amapolas.whatsapp_btn_text+'</a>' : '')
        +(amapolas.maps_url ? '<a href="'+amapolas.maps_url+'" target="_blank" rel="noopener noreferrer" class="amapola-btn btn-maps" style="display:block; background:#0284c7; color:white; text-align:center; padding:10px; border-radius:12px; font-weight:900; font-size:13px; text-decoration:none; margin-bottom:8px;">📍 '+amapolas.maps_btn_text+'</a>' : '')
        +(amapolas.instagram_url ? '<a href="'+amapolas.instagram_url+'" target="_blank" rel="noopener noreferrer" class="amapola-btn btn-ig" style="display:block; background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045); color:white; text-align:center; padding:10px; border-radius:12px; font-weight:900; font-size:13px; text-decoration:none; margin-bottom:10px;">'+amapolas.instagram_user+'</a>' : '')
        +(amapolas.pie_texto ? '<div class="amapola-footer" style="text-align:center; font-size:11px; color:#64748b; font-weight:700;">'+amapolas.pie_texto+'</div>' : '')
        +'</div>';
      try{ contenedorAmapolas.appendChild(crearFooterSinIG(amapolas.id, amapolas.nombre)); }catch(e){}
    }
  } catch (error) {
    console.error("Error cargando Amapola's:", error);
  }
}
cargarAvisoAmapolas();

// ==========================================
// 3. CARGA DE FONOAUDIOLOGÍA (JULIA ELENA MOSCOLONI)
// ==========================================
async function cargarAvisoJulia() {
  try {
    const resJulia = await fetch('./julia-moscoloni.json?v=' + Date.now());
    if (!resJulia.ok) return;
    const julia = await resJulia.json();
    const contenedorJulia = document.getElementById('contenedor-aviso-fonoaudiologia') || asegurarContenedor('contenedor-aviso-fonoaudiologia');

    if (contenedorJulia && julia) {
      let espHtml = '';
      if (julia.especialidades) {
        espHtml = julia.especialidades.map(function(e){
          return '<div style="display:flex; align-items:center; gap:10px; background:white; border:1.5px solid #fde68a; border-left:4px solid '+e.border_color+'; padding:9px 10px; border-radius:12px; box-shadow:0 2px 8px rgba(15,23,42,0.04);">'
            +'<div style="width:32px; height:32px; min-width:32px; background:'+e.bg_icon+'; border-radius:10px; display:flex; align-items:center; justify-content:center;">'+e.svg+'</div>'
            +'<div style="flex:1;"><div style="font-size:13px; font-weight:800; color:#0f172a; line-height:1.1;">'+e.titulo+'</div><div style="font-size:11px; font-weight:500; color:#57534e; margin-top:1px;">'+e.subtitulo+'</div></div></div>';
        }).join('');
      }
      let lugaresHtml = '';
      if (julia.lugares) {
        lugaresHtml = julia.lugares.map(function(l){
          return '<a href="'+l.maps_url+'" target="_blank" onclick="event.stopPropagation()" style="display:grid; grid-template-columns:76px 1fr 66px; align-items:center; gap:8px; background:white; border:2px solid #0f766e; border-left:5px solid #0f766e; padding:8px 8px; border-radius:12px; text-decoration:none; box-sizing:border-box; width:100%;">'
            +'<span style="'+l.tag_style+'">'+l.tag+'</span>'
            +'<span style="font-size:12.5px; font-weight:900; color:#0f172a; line-height:1.15; min-width:0; word-break:break-word;">'+l.direccion+'</span>'
            +'<span style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1px; background:#fefce8; border:1.5px solid #fde68a; padding:5px 2px; border-radius:99px; flex-shrink:0;">'
            +'<span style="width:12px; height:12px; background:#EA4335; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:grid; place-items:center;"><span style="width:5px; height:5px; background:white; border-radius:50%; transform:rotate(45deg); display:block;"></span></span>'
            +'<span style="font-size:8px; font-weight:800; color:#92400e; line-height:1; text-align:center; margin-top:2px;">Ver<br>en<br>Maps</span></span></a>';
        }).join('');
      }

     contenedorJulia.innerHTML = '<div id="'+slug(julia.id)+'" class="card-emp destacado" data-barrio="alfar" data-cat="salud" onclick="abrirModalJulia(this)" style="cursor:pointer; display:block; padding:0; overflow:hidden; border:2px solid #fde68a; background:linear-gradient(180deg,#fffbeb 0%,#fef3c7 100%); border-radius:24px; position:relative; box-shadow:0 12px 32px rgba(15,23,42,0.12); max-width:760px; margin:0 auto 14px auto;">'
    +'<div style="background:linear-gradient(135deg,#0f766e 0%,#115e59 100%); padding:16px 16px 14px; position:relative; overflow:hidden;">'
        +'<div style="position:absolute; top:-40px; right:-40px; width:120px; height:120px; background:rgba(255,255,255,0.08); border-radius:50%;"></div>'
        +'<div style="position:absolute; bottom:-20px; left:40%; width:80px; height:80px; background:rgba(253,230,138,0.12); border-radius:50%;"></div>'
        +'<div style="display:flex; align-items:center; gap:12px; position:relative; z-index:1;">'
        +'<div style="width:76px; height:76px; min-width:76px; border-radius:50%; overflow:hidden; border:3px solid white; box-shadow:0 4px 16px rgba(0,0,0,0.2); background:white; position:relative;">'
        +'<img src="'+julia.foto_perfil+'" alt="'+julia.nombre+'" style="width:100%; height:100%; object-fit:cover; object-position:center top; display:block;" onerror="this.style.display=\'none\'">'
        +'<div style="position:absolute; bottom:-2px; right:-2px; width:20px; height:20px; background:#22c55e; border:2px solid white; border-radius:50%; display:flex; align-items:center; justify-content:center;"><div style="width:6px; height:6px; background:white; border-radius:50%;"></div></div></div>'
        +'<div style="flex:1; min-width:0;"><div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">'
        +'<span style="background:rgba(253,230,138,0.95); color:#78350f; padding:3px 8px; border-radius:999px; font-size:9px; font-weight:900; letter-spacing:0.5px; display:inline-flex; align-items:center; gap:4px;"><span style="width:5px; height:5px; background:#d97706; border-radius:50%; display:inline-block;"></span> DESTACADO • SALUD</span>'
        +'<span style="background:rgba(255,255,255,0.15); color:#fef3c7; padding:3px 7px; border-radius:999px; font-size:8px; font-weight:800;">'+julia.mp+'</span></div>'
        +'<div style="font-size:11px; font-weight:800; letter-spacing:1px; color:#fde68a; text-transform:uppercase; margin-bottom:2px;">'+julia.nombre_titulo+'</div>'
        +'<h3 style="margin:0; font-size:17px; font-weight:900; color:white; line-height:1.15; letter-spacing:-0.2px;">'+julia.nombre+'</h3>'
        +'<div style="font-size:10.5px; font-weight:700; color:#ccfbf1; margin-top:3px; letter-spacing:0.2px;">'+julia.subtitulo_header+'</div></div></div></div>'
        +'<div style="padding:14px 16px 12px; background:linear-gradient(180deg,#fffbeb 0%,#ffffff 100%);">'
        +'<div style="font-size:12.5px; font-weight:600; color:#1e293b; line-height:1.45; margin-bottom:12px;">'+julia.titulo_universidad+'</div>'
        +'<div style="height:1px; background:linear-gradient(90deg,transparent,#fde68a,transparent); margin:10px 0;"></div>'
        +'<div style="font-size:10px; font-weight:900; letter-spacing:1px; color:#92400e; text-transform:uppercase; margin-bottom:8px;">ESPECIALIDADES</div>'
        +'<div style="display:flex; flex-direction:column; gap:8px;">'+espHtml+'</div>'
        +'<div style="margin-top:14px; background:#f0fdf4; border:2.5px solid #0f766e; border-radius:16px; padding:12px; box-sizing:border-box; overflow:hidden;">'
        +'<div style="font-size:11px; font-weight:900; letter-spacing:1.2px; color:#0f766e; text-transform:uppercase; display:flex; align-items:center; gap:8px;">'
        +'<span style="background:#0f766e; color:white; width:22px; height:22px; border-radius:50%; display:grid; place-items:center; font-size:11px; flex-shrink:0;">📍</span> LUGARES DE ATENCIÓN</div>'
        +'<div style="margin-top:12px; display:flex; flex-direction:column; gap:10px;">'+lugaresHtml+'</div></div>'
        +'<a href="'+julia.whatsapp_url+'" class="btn-wsp" onclick="event.stopPropagation()" target="_blank" style="margin-top:14px; background:linear-gradient(135deg,#22c55e,#15803d); box-shadow:0 6px 20px rgba(34,197,94,0.35); display:flex; align-items:center; justify-content:center; gap:8px; color:white; padding:13px 18px; border-radius:999px; text-decoration:none; font-weight:900; font-size:15px; width:100%;">'
        +'<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19.05 4.94A9.82 9.82 0 0012.03 2C6.48 2 2 6.44 2 11.93c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.37a9.82 9.82 0 004.78 1.22h.01c5.54 0 10.03-4.44 10.03-9.93a9.75 9.75 0 00-3.02-7.98zM12.04 20.17h-.01a8.12 8.12 0 01-4.14-1.13l-.3-.18-3.12.82.83-3.02-.2-.31a8.18 8.18 0 01-1.26-4.42c0-4.54 3.73-8.23 8.32-8.23a8.27 8.27 0 015.87 2.41 8.14 8.14 0 012.43 5.78c0 4.54-3.73 8.28-8.32 8.28zm4.56-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.13-.17.25-.65.81-.79.97-.15.17-.29.19-.54.06-.25-.12-1.05-.38-2-1.22-.74-.65-1.23-1.45-1.38-1.7-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.47-.41-.41-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05s.89 2.38 1.01 2.54c.12.17 1.75 2.66 4.23 3.73.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/></svg>'+julia.whatsapp_btn_text+'</a>'
        +'<div style="text-align:center; font-size:10px; font-weight:600; color:#78716c; margin-top:8px; letter-spacing:0.2px;">'+julia.pie_texto+'</div></div></div>';
      try { contenedorJulia.appendChild(crearFooterSinIG(julia.id, julia.nombre)); } catch(e) {}
    }
  } catch (error) {
    console.error("Error cargando Fonoaudiología:", error);
  }
}
//cargarAvisoJulia();

// ==========================================
// 4. CARGA PROVEEDURÍA KEVIN
// ==========================================
async function cargarAvisoKevin() {
  try {
    const response = await fetch('./aviso-kevin.json?v=' + Date.now());
    if (!response.ok) return;
    const kevin = await response.json();
    const contenedorKevin = asegurarContenedor('contenedor-aviso-kevin');

    if (contenedorKevin && kevin) {
      contenedorKevin.innerHTML = '<div id="'+slug(kevin.id)+'" style="grid-column:1/-1;max-width:760px;margin:0 auto 14px auto;">'
        +'<div style="cursor:pointer;box-sizing:border-box;width:100%;max-width:760px;margin:0 auto;padding:12px;background:#fafafa;border:1px solid #e5e7eb;border-radius:28px;font-family:Inter,Arial,sans-serif;color:#0b132b;box-shadow:0 14px 35px rgba(11,19,43,.12);">'
        +'<div style="display:flex;align-items:center;justify-content:space-between;gap:14px;padding:13px 16px;background:linear-gradient(135deg,#7e22ce,#581c87);border-radius:18px;">'
        +'<div style="font-size:1.4rem;font-weight:900;color:#fff;text-transform:uppercase;">'+kevin.nombre+'</div>'
        +'<div style="width:45px;height:45px;border-radius:50%;background:#b8f34a;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">🛍️</div></div>'
        +'<div style="position:relative;margin-top:12px;overflow:hidden;border-radius:22px 22px 14px 14px;background:#e5e7eb;">'
        +'<img src="'+kevin.imagen_fachada+'" alt="Fachada Proveeduría Kevin" style="display:block;width:100%;height:clamp(230px,42vw,360px);object-fit:cover;">'
        +'<div style="position:absolute;left:16px;bottom:15px;padding:8px 12px;border-radius:10px;background:rgba(11,19,43,.88);color:#fff;font-size:.7rem;font-weight:900;text-transform:uppercase;">FOTO REAL DEL LOCAL</div>'
        +'<div style="position:absolute;right:15px;top:15px;padding:9px 13px;border-radius:999px;background:#b8f34a;color:#0b132b;font-size:.68rem;font-weight:900;transform:rotate(3deg);">'+kevin.badge_top+'</div></div>'
        +'<div style="margin-top:12px;padding:10px;border-radius:12px;background:white;border-top:2px dotted #e2e8f0;border-bottom:2px dotted #e2e8f0;text-align:center;">'
        +'<span style="color:#dc2626;font-weight:900;font-style:italic;">'+kevin.slogan_rojo+'</span>'
        +'<span style="background:#dc2626;color:white;font-weight:900;font-size:10px;padding:5px 10px;border-radius:20px;margin-left:6px;">PRECIOS DESTACADOS 🏷</span></div>'
        +'<div style="padding:18px 8px 8px;"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;">'
        +'<div style="background:#fff;border-radius:16px;border:1px solid #f1f5f9;box-shadow:0 3px 10px rgba(11,19,43,.06);overflow:hidden;">'
        +'<div style="background:'+kevin.sucursales[0].header_bg+';padding:8px 12px;font-weight:900;font-size:11px;">🟢 '+kevin.sucursales[0].titulo+'</div>'
        +'<div style="padding:12px;font-size:12.5px;font-weight:700;">📍 '+kevin.sucursales[0].direccion+'</div></div>'
        +'<div style="background:#fff;border-radius:16px;border:1px solid #f1f5f9;box-shadow:0 3px 10px rgba(11,19,43,.06);overflow:hidden;">'
        +'<div style="background:'+kevin.sucursales[1].header_bg+';padding:8px 12px;font-weight:900;font-size:11px;">🟠 '+kevin.sucursales[1].titulo+'</div>'
        +'<div style="padding:12px;font-size:12px;font-weight:700;">📍 '+kevin.sucursales[1].direccion+'</div></div></div>'
        +'<a href="'+kevin.instagram_url+'" target="_blank" style="display:block;margin-bottom:14px;padding:11px;border-radius:12px;background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);color:white;font-weight:900;text-align:center;text-decoration:none;">'+kevin.instagram_user+'</a>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:16px;">'
        +'<a href="'+kevin.sucursales[0].maps_url+'" target="_blank" style="padding:12px;border-radius:999px;background:#eef0f2;text-align:center;font-weight:900;text-decoration:none;color:#263244;">'+kevin.sucursales[0].maps_text+'</a>'
        +'<a href="'+kevin.sucursales[1].maps_url+'" target="_blank" style="padding:12px;border-radius:999px;background:#eef0f2;text-align:center;font-weight:900;text-decoration:none;color:#263244;">'+kevin.sucursales[1].maps_text+'</a></div></div></div></div>';
      try { contenedorKevin.appendChild(crearFooterSinIG(kevin.id, kevin.nombre)); } catch(e) {}
    }
  } catch (error) {
    console.error("Error cargando aviso de Kevin:", error);
  }
}
cargarAvisoKevin();

// ==========================================
// 5. CARGA KIOSCO LOS MELLI
// ==========================================
async function cargarAvisoLosMelli() {
  try {
    const response = await fetch('./aviso-los-mellis.json?v=' + Date.now());
    if (!response.ok) return;
    const melli = await response.json();
    const contenedor = asegurarContenedor('contenedor-aviso-los-mellis');

    if (contenedor && melli) {
      let serviciosHTML = '';
      if (melli.servicios && melli.servicios.length > 0) {
        serviciosHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0 20px 0;">'
          + melli.servicios.map(function(s){
            return '<div style="background:'+s.bg+';border:1.5px solid '+s.border+';padding:12px;border-radius:16px;display:flex;align-items:center;gap:10px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">'
              +'<span style="font-size:22px;background:white;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.06);flex-shrink:0;">'+s.icono+'</span>'
              +'<div style="min-width:0;"><div style="font-size:13px;font-weight:900;color:'+s.txt+';line-height:1.1;">'+s.titulo+'</div><div style="font-size:10.5px;font-weight:700;color:#64748b;margin-top:2px;">'+s.desc+'</div></div></div>';
          }).join('') + '</div>';
      }

      contenedor.innerHTML = '<div id="'+slug(melli.id)+'" data-search="'+melli.search_tags+'" style="box-sizing:border-box;width:100%;max-width:760px;margin:0 auto 20px auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 16px 45px rgba(15,23,42,0.12);border:1.5px solid #e2e8f0;font-family:\'Inter\',system-ui,sans-serif;position:relative;">'
        +'<div style="background:linear-gradient(135deg,#090d16 0%, #1e293b 100%);padding:20px 22px;position:relative;overflow:hidden;">'
        +'<div style="position:absolute;top:-40px;right:-40px;width:140px;height:140px;background:radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%);pointer-events:none;"></div>'
        +'<div style="display:inline-flex;align-items:center;gap:6px;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.4);color:#ffb703;font-size:10.5px;font-weight:900;letter-spacing:0.05em;padding:5px 12px;border-radius:999px;margin-bottom:12px;">'+melli.badge_top+'</div>'
        +'<div style="display:flex;align-items:center;gap:16px;position:relative;z-index:1;">'
        +'<div style="width:64px;height:64px;min-width:64px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:18px;box-shadow:0 8px 20px rgba(245,158,11,0.35);display:flex;align-items:center;justify-content:center;color:white;font-size:28px;">🏪</div>'
        +'<div style="flex:1;min-width:0;"><div style="font-weight:900;font-size:clamp(22px,4vw,28px);color:#ffffff;letter-spacing:-0.02em;text-transform:uppercase;line-height:1;text-shadow:0 2px 4px rgba(0,0,0,0.3);">'+melli.nombre+'</div>'
        +'<div style="font-size:13px;font-weight:700;color:#94a3b8;margin-top:6px;display:flex;align-items:center;gap:6px;"><span style="color:#f1f5f9;">📍 '+melli.direccion+'</span><span style="color:#64748b;">•</span><span style="color:#cbd5e1;">'+melli.barrio+'</span></div></div></div>'
        +'<div style="margin-top:16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:10px 14px;display:flex;align-items:center;gap:10px;"><span style="font-size:16px;">💡</span><span style="font-size:12.5px;font-weight:700;color:#e2e8f0;letter-spacing:-0.01em;">'+melli.slogan+'</span></div></div>'
        +'<div style="padding:18px 22px 22px 22px;background:#ffffff;">'+serviciosHTML
        +'<a href="'+melli.maps_url+'" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;padding:15px 20px;border-radius:16px;background:linear-gradient(135deg,#2563eb 0%, #1d4ed8 100%);color:#fff;font-weight:900;font-size:14px;text-decoration:none;box-shadow:0 8px 25px rgba(37,99,235,0.35);box-sizing:border-box;">'
        +'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" stroke="white" stroke-width="1.5"/><circle cx="12" cy="9" r="2.5" fill="white"/></svg>'
        +'<span>'+melli.maps_btn_text+'</span></a></div></div>';
      try { contenedor.appendChild(crearFooterSinIG(melli.id, melli.nombre)); } catch(e) {}
    }
  } catch (error) {
    console.error("Error cargando aviso de Los Melli:", error);
  }
}
cargarAvisoLosMelli();

// ==========================================
// 6. CARGA LAVANDERÍA DE NANNIN
// ==========================================
async function cargarAvisoLavanderia() {
  try {
    const response = await fetch('./aviso-lavanderia.json?v=' + Date.now());
    if (!response.ok) return;
    const nannin = await response.json();
    const contenedor = document.getElementById('contenedor-aviso-lavanderia') || asegurarContenedor('contenedor-aviso-lavanderia');

    if (contenedor && nannin) {
      contenedor.innerHTML = '<div class="nannin-card" id="'+slug(nannin.id)+'" style="box-sizing:border-box;width:100%;max-width:760px;margin:0 auto 20px auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 14px 35px rgba(11,19,43,.12);border:1px solid #e5e7eb;font-family:Inter,Arial,sans-serif;color:#0b132b;cursor:pointer;" title="Tocá para ver más grande">'
        +'<div style="background:linear-gradient(135deg,#0284c7,#0369a1);padding:18px 20px;color:white;display:flex;align-items:center;justify-content:space-between;">'
        +'<div style="font-size:20px;font-weight:900;text-transform:uppercase;">'+nannin.nombre+'</div>'
        +'<div style="font-size:24px;">🧺</div></div>'
        +'<div style="padding:16px;">'
        +(nannin.imagen_fachada ? '<div style="border-radius:16px;overflow:hidden;margin-bottom:12px;"><img src="'+nannin.imagen_fachada+'" alt="'+nannin.nombre+'" style="width:100%;height:auto;display:block;"></div>' : '')
        +'<div style="font-size:13px;color:#475569;font-weight:700;margin-bottom:12px;">'+nannin.subtitulo+'</div>'
        +(nannin.whatsapp_url ? '<a href="'+nannin.whatsapp_url+'" target="_blank" onclick="event.stopPropagation()" style="display:block;background:#25D366;color:white;text-align:center;padding:11px;border-radius:12px;font-weight:900;text-decoration:none;margin-bottom:8px;">'+nannin.whatsapp_btn_text+'</a>' : '')
        +'</div></div>';
      try { contenedor.appendChild(crearFooterSinIG(nannin.id, nannin.nombre)); } catch(e) {}
    }
  } catch (error) {
    console.error("Error cargando Lavandería de Nannin:", error);
  }
}
cargarAvisoLavanderia();
// AUTO-SCROLL PARA LINKS TIPO #kiosco-los-melli
function irAlAvisoPorHash() {
  const hashSlug = location.hash.replace('#','').trim();
  if (!hashSlug) return;

  // intenta 10 veces, porque los avisos cargan async
  let intentos = 0;
  const timer = setInterval(() => {
    intentos++;
    const el = document.getElementById(hashSlug) || document.getElementById('contenedor-aviso-' + hashSlug);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      clearInterval(timer);
    }
    if (intentos > 20) clearInterval(timer);
  }, 300);
}

window.addEventListener('load', irAlAvisoPorHash);
window.addEventListener('hashchange', irAlAvisoPorHash);
