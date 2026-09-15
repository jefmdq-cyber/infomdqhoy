import requests, json, re
from datetime import datetime

URL = "https://www.quinielanacional1.com.ar/"
headers = {"User-Agent": "Mozilla/5.0"}

html = requests.get(URL, headers=headers, timeout=30).text

# Busca: "Quiniela Previa, Primera, Matutina, Vespertina, Nocturna"
patron = re.compile(
    r'Quiniela\s+(Previa|Primera|Matutina|Vespertina|Nocturna).*?loteria\s+Ciudad.*?del dia.*?(\d{2}/\d{2}/\d{2,4}).*?Nacional\s*([\d,\s,]+?)(?:Buenos Aires|</div|<h2)',
    re.IGNORECASE | re.DOTALL
)

final = {}
for turno, fecha, bloque in patron.findall(html):
    # bloque viene "1, 4563, 2, 4290..."
    # agarro solo los numeros de 4 cifras en orden
    nums = []
    partes = re.split(r'[, \n\r]+', bloque)
    for p in partes:
        p = p.strip()
        if re.match(r'^\d{4}$', p):
            nums.append(p)
    # si vino con formato 1,4563,2,4290 -> filtramos cada 2
    if len(nums) < 5:
        # fallback: extrae todos los 4 digitos del bloque
        nums = re.findall(r'\b\d{4}\b', bloque)
        # si son 40 (pos+num) nos quedamos con 1 si, 1 no
        if len(nums) > 20:
            nums = nums[1::2]

    if nums:
        final[turno.capitalize()] = {"fecha": fecha, "numeros": nums[:20]}

print("Encontrados:", list(final.keys()))

# Si no encontró los 5, NO pisa el archivo para no dejarte en []
if len(final) >= 3:
    with open("quiniela.json", "w", encoding="utf-8") as f:
        json.dump(final, f, ensure_ascii=False, indent=2)
    print("Guardado OK")
else:
    print("Pocos datos, no piso quiniela.json")
