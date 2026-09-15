import requests, json, re
from datetime import datetime

URL = "https://www.quinielanacional1.com.ar/"
hoy = datetime.now().strftime("%d/%m/%y") # ej: 15/09/26
hoy_largo = datetime.now().strftime("%d/%m/%Y")

headers = {"User-Agent": "Mozilla/5.0"}
html = requests.get(URL, headers=headers, timeout=30).text

turnos = ["Previa", "Primera", "Matutina", "Vespertina", "Nocturna"]
lista_final = []

for turno in turnos:
    m = re.search(
        rf'Quiniela\s+{turno}.*?loteria\s+Ciudad.*?del dia.*?(\d{{2}}/\d{{2}}/\d{{2,4}}).*?Nacional\s+([0-9,\s]+?)(?:Buenos Aires|<h2)',
        html, re.IGNORECASE | re.DOTALL
    )
    if m:
        fecha_web = m.group(1) # fecha que trae la web, ej 15/09/26
        bloque = m.group(2)
        nums = re.findall(r'\b\d{4}\b', bloque)[:20]

        # ACA ESTA EL TRUCO QUE TE FALTABA:
        # Si la fecha de la web es de hoy, guardamos los numeros
        # Si es de ayer, lo dejamos VACIO para que tu pagina muestre "Aún no sale"
        if hoy in fecha_web or hoy_largo in fecha_web or fecha_web in hoy:
            lista_final.append({"turno": turno, "fecha": fecha_web, "numeros": nums})
            print(f"{turno} {fecha_web} -> GUARDADO")
        else:
            lista_final.append({"turno": turno, "fecha": fecha_web, "numeros": []})
            print(f"{turno} {fecha_web} es de ayer -> lo dejo vacio para que diga 'Aun no sale'")

# Guardamos
with open("quiniela.json", "w", encoding="utf-8") as f:
    json.dump(lista_final, f, ensure_ascii=False, indent=2)
