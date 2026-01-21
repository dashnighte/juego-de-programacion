import json
import os
from getpass import getpass

USERS_FILE = "users.json"
PREGUNTAS_FILE = "preguntas.json"

# Crear users.json si no existe
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump({}, f, ensure_ascii=False)

def registrar():
    usuarios = json.load(open(USERS_FILE, "r", encoding="utf-8"))
    username = input("Ingresa un nombre de usuario: ").strip()
    if username in usuarios:
        print("Usuario ya existe.")
        return False
    password = getpass("Ingresa tu contraseña: ").strip()
    usuarios[username] = {"password": password, "puntaje": 0}
    json.dump(usuarios, open(USERS_FILE, "w", encoding="utf-8"), ensure_ascii=False)
    print("Usuario registrado correctamente.")
    return True

def login():
    usuarios = json.load(open(USERS_FILE, "r", encoding="utf-8"))
    username = input("Usuario: ").strip()
    password = getpass("Contraseña: ").strip()
    if username in usuarios and usuarios[username]["password"] == password:
        print(f"\n¡Bienvenido {username}!")
        print(f"Tu mejor puntaje hasta ahora es: {usuarios[username]['puntaje']}")
        return username
    else:
        print("Usuario o contraseña incorrectos.")
        return None

def jugar_quiz(username):
    with open(PREGUNTAS_FILE, "r", encoding="utf-8") as f:
        preguntas = json.load(f)

    puntaje = 0
    for i, item in enumerate(preguntas, start=1):
        print(f"\nPregunta {i}: {item['pregunta']}")
        for letra, opcion in item["opciones"].items():
            print(f"{letra}) {opcion}")
        respuesta = input("Tu respuesta (a/b/c/d/e): ").strip().lower()
        if respuesta == item["respuesta"]:
            print("¡Correcto!")
            puntaje += 1
        else:
            correcta = item["respuesta"]
            print(f"Incorrecto. La respuesta correcta era: {correcta}) {item['opciones'][correcta]}")
            print("¡Hazlo bien, insecto! 😎")  # Mensaje divertido

    print(f"\nTu puntaje final: {puntaje}/{len(preguntas)}")

    # Guardar récord personal
    usuarios = json.load(open(USERS_FILE, "r", encoding="utf-8"))
    if puntaje > usuarios[username]["puntaje"]:
        usuarios[username]["puntaje"] = puntaje
        json.dump(usuarios, open(USERS_FILE, "w", encoding="utf-8"), ensure_ascii=False)
        print("¡Nuevo récord personal! 🎉")
    else:
        print(f"Tu récord personal sigue siendo: {usuarios[username]['puntaje']}")

def main():
    while True:
        print("\n--- Quiz de Programación ---")
        print("1. Registrarse")
        print("2. Iniciar sesión")
        print("3. Salir")
        opcion = input("Elige una opción: ").strip()

        if opcion == "1":
            registrar()
        elif opcion == "2":
            username = login()
            if username:
                jugar_quiz(username)
        elif opcion == "3":
            print("¡Hasta luego!")
            break
        else:
            print("Opción inválida.")

if __name__ == "__main__":
    main()
