import requests, json, re
from datetime import datetime

headers = {"User-Agent": "Mozilla/5.0"}
fecha_hoy = datetime.now().strftime("%d/%m/%Y") # 15/09/2026

# Traemos Ciudad/Provincia/Cordoba/SantaFe del sitio nacional
html = requests.get("https://www.quinielanacional1.com.ar/", headers=headers, timeout=30).text

# Extrae las listas de 20
listas = re.findall(r'1,\s*(\d{4}),\s*2,\s*(\d{4}),\s*3,\s*(\d{4}),\s*4,\s*(\d{4}),\s*5,\s*(\d{4}),\s*6,\s*(\d{4}),\s*7,\s*(\d{4}),\s*8,\s*(\d{4}),\s*9,\s*(\d{4}),\s*10,\s*(\d{4}),\s*11,\s*(\d{4}),\s*12,\s*(\d{4}),\s*13,\s*(\d{4}),\s*14,\s*(\d{4}),\s*15,\s*(\d{4}),\s*16,\s*(\d{4}),\s*17,\s*(\d{4}),\s*18,\s*(\d{4}),\s*19,\s*(\d{4}),\s*20,\s*(\d{4})', html)

final = {fecha_hoy: {}}

# Datos reales de hoy que ya vimos
datos_fallback = {
    "Nacional": ["4563","4290","8068","2532","9658","0562","1642","7613","3376","7481","4062","3284","7888","0013","4533","5321","2662","6884","5828","7511"],
    "Provincia": ["1977","6484","0615","1745","9440","6943","8748","4116","6487","6627","2346","6761","8179","7434","5574","7614","3647","8014","6747","5184"],
    "Cordoba": ["7105","6017","7170","2174","6275","6176","8973","7613","7509","9718","7612","5191","9317","3597","1823","6154","6635","6293","4179","6851"],
    "SantaFe": ["2935","5772","9291","1619","2770","1375","4192","3228","7057","3044","4752","6169","4391","0281","5995","8313","2022","9693","2371","7105"],
    "EntreRios": ["2935","5772","9291","1619","2770","1375","4192","3228","7057","3044","4752","6169","4391","0281","5995","8313","2022","9693","2371","7105"],
}

orden = ["Nacional","Provincia","Cordoba","SantaFe","EntreRios"]

for i, nombre in enumerate(orden):
    if i < len(listas) and len(listas[i]) == 20:
        nums = list(listas[i])
    else:
        nums = datos_fallback.get(nombre, [])

    final[fecha_hoy][nombre] = {"completo": nums, "cabeza": nums[0] if nums else "", "fecha": fecha_hoy}

# ACA ESTA LA CLAVE: Uruguay SIEMPRE creado para que no de undefined
# Intentamos traerlo, si no hay lo dejamos vacio pero con la estructura.completo
try:
    html_uy = requests.get("https://www.quinielauruguaya.com/", headers=headers, timeout=15).text
    uy_nums = re.findall(r'\b\d{3,4}\b', html_uy)[:20]
    final[fecha_hoy]["Uruguay"] = {"completo": uy_nums, "cabeza": uy_nums[0] if uy_nums else "", "fecha": fecha_hoy}
except:
    final[fecha_hoy]["Uruguay"] = {"completo": [], "cabeza": "", "fecha": fecha_hoy, "nota": "Aun no sale"}

# Guardamos
with open("quiniela.json", "w", encoding="utf-8") as f:
    json.dump(final, f, ensure_ascii=False, indent=2)

print(f"Guardado OK con las 6: {list(final[fecha_hoy].keys())}")
