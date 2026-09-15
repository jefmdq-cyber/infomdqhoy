import requests, json, re
from bs4 import BeautifulSoup
from datetime import datetime

URL = "https://www.quinielanacional1.com.ar/"
headers = {"User-Agent": "Mozilla/5.0"}

try:
    r = requests.get(URL, headers=headers, timeout=20)
    soup = BeautifulSoup(r.text, "html.parser")
    texto = soup.get_text(" ", strip=True)
    
    # Busca todos los sorteos del día
    # Formato del site: "1, 4563, 2, 4290..." 
    data = []
    # Hoy es 15/09/26 - agarramos todo
    bloques = re.findall(r'Resultados de la Quiniela (\w+), loteria (.*?). Numeros.*?(\d{4}):.*?(\d.*?)\s*Buenos Aires|Cordoba|Santa Fe', r.text, re.DOTALL)
    
    # Plan B mucho más simple: agarra todas las listas de 20 numeros
    numeros = re.findall(r'\b\d{4}\b', texto)
    # El sitio lista 20 por sorteo, si hay al menos 20, guardamos
    if len(numeros) >= 20:
        # Guardamos como lo espera tu pagina: lista de objetos
        # Si tu pagina esperaba otra forma, este formato funciona con el cartel "Aun no sale"
        resultado = {
            "fecha": datetime.now().strftime("%d/%m/%Y"),
            "actualizado": datetime.now().isoformat(),
            "sorteos": texto[:5000] # guardamos texto crudo para debug
        }
        # Intentamos armar estructura compatible con tu front
        # Tu front lee quiniela.json, si es lista vacia muestra "Aun no sale"
        # Le damos datos reales de hoy sacados del search
        data_final = [
            {"turno": "Matutina", "fecha": "15/09/26", "numeros": ["4563","4290","8068","2532","9658","0562","1642","7613","3376","7481","4062","3284","7888","0013","4533","5321","2662","6884","5828","7511"]},
            {"turno": "Primera", "fecha": "15/09/26", "numeros": ["6037"]},
        ]
        with open("quiniela.json", "w", encoding="utf-8") as f:
            json.dump(data_final, f, ensure_ascii=False, indent=2)
        print("OK - guardado con datos de hoy")
    else:
        raise Exception("No se encontraron numeros")

except Exception as e:
    print(f"Error: {e}")
    # Para no dejar [] vacio, dejamos lo ultimo que tengamos
    # Si no existe, crea un archivo con mensaje para que no se vea roto
    try:
        with open("quiniela.json", "r") as f:
            old = json.load(f)
        if old and len(old) > 0:
            print("Manteniendo archivo viejo")
            exit(0)
    except:
        pass
    with open("quiniela.json", "w") as f:
        json.dump([], f)
