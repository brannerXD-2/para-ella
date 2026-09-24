# Para Camila

Una carta interactiva hecha con HTML, CSS y JavaScript puro (sin frameworks ni build).

## Estructura

```
para-ella/
├── index.html          # Estructura de la carta
├── css/
│   └── styles.css      # Estilos (mobile-first)
├── js/
│   └── main.js         # Interacciones y animaciones
└── assets/
    └── img/            # Imágenes (PNG con fondo transparente)
        ├── kuromi.png
        ├── hello-kitty.png
        ├── duo.png
        ├── estrella-ambar.jpg   # Ojos: estrella ámbar
        ├── cometa.jpg           # Cabello: cola de cometa
        ├── amanecer-espacio.jpg # Sonrisa: amanecer desde el espacio
        ├── nebulosa-rosa.jpg    # Labios: nebulosa rosada
        ├── luna-creciente.jpg   # Figura: luna creciente
        ├── nebulosa-corazon.jpg # Corazón: Nebulosa del Corazón (IC 1805)
        ├── mylo.jpg             # Opcional: foto de Mylo
        └── tammy.jpg            # Opcional: foto de Tammy
```

## Recorrido

0. **Pantalla de carga**: un corazón que se dibuja mientras se precargan las fotos.
1. **Candado**: se abre con una fecha especial (día / mes / año).
2. **Sobre**: se toca y se despliega la carta.
3. **Capítulos**: orgullo (estilo Kuromi, tarjetas que salen a la pantalla y stickers de calaveritas, murciélagos y lunas),
   lo que amo de ti (estilo Hello Kitty, tarjetas deslizables con fotos cósmicas y stickers de fresas y cerezas),
   tu sueño, lo que viene (rasca y descubre, Mylo y Tammy) y nuestro futuro.

### Candados entre capítulos

Cada capítulo se desbloquea al completar el anterior:

| Para abrir… | Hay que… |
|---|---|
| Capítulo uno | Terminar de leer la introducción |
| Capítulo dos | Abrir las 4 tarjetas de orgullo |
| Capítulo tres | Pasar las 6 tarjetas de «Lo que amo de ti» |
| Capítulo cuatro | Abrir la nota «Ábrelo cuando dudes de ti» |
| Capítulo cinco y el final | Descubrir el mensaje del rasca y gana |

El avance se guarda en el navegador. Para empezar de cero (por ejemplo, después de probarla tú),
abre la página con `?reiniciar` al final de la URL.

## Ver en local

Cualquier servidor estático sirve, por ejemplo:

```bash
npx http-server -p 5500
```

## Publicar en GitHub Pages

1. Sube el repositorio a GitHub.
2. En **Settings → Pages**, elige la rama `main` y la carpeta `/ (root)`.
3. Comparte el enlace `https://<usuario>.github.io/<repositorio>/`.

---

Hecha con amor por **Branner**.
