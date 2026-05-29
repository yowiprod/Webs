# Proyecto — Destacamos Tu Web (DTW)

> Documento de contexto del proyecto. Si abres esto con Claude Code, léelo para
> entender de qué va todo antes de tocar nada.

## Qué es
Agencia familiar de **diseño y desarrollo web** llevada por dos primos: **Ángel y Angelina**.
Antes se llamaba "Creamos Tu Web"; ahora es **Destacamos Tu Web**.
Eslogan: *"Diseñamos el futuro de tu negocio."*

## Equipo
- **Ángel** — diseño y desarrollo de webs · entrega del producto final.
- **Angelina** — captación de clientes, relaciones y ventas.

## Identidad de marca
- **Paleta:** grafito casi negro `#0c0c0f` + **oro** `#E0B23C`. Texto blanco sobre oscuro; en secciones claras, texto grafito.
- **Tipografías** (Google Fonts): **Bricolage Grotesque** (títulos/logo) + **Hanken Grotesk** (texto).
- **Logo:** monograma **DTW** (D blanca · T oro · W blanca) + **flechas de ascenso** (chevron oro + blanco) + el nombre debajo. Concepto: "destacar = subir / crecer".

## Datos de contacto
- Instagram: **@destacamostuweb**
- Web: **destacamostuweb.com** *(dominio por registrar)*
- Email: **info@destacamostuweb.com**
- Teléfono: **+376 656 660** (Andorra)

## Servicios y precios
*(En la web se muestra el rango con el descuento −30% fundadores aplicado a Landing, Web Scrolling y Shopify; Instagram a Web va sin descuento.)*

| Servicio | Precio base | Con −30% fundadores | Entrega | Revisiones |
|---|---|---|---|---|
| Landing Page | 600–1.000€ | 420–700€ | 3–5 días | 1 |
| Web Scrolling (multipágina) | 900–1.500€ | 630–1.050€ | 1–2 semanas | 2 |
| Instagram a Web | 250–600€ | (sin dto.) | 2–3 días | 1 |
| Tienda Online (Shopify) | desde 1.200€ | desde 840€ | según proyecto | 3 |

- **Forma de pago:** 50% al inicio · 50% en la entrega.
- **Promo fundadores:** −30% para los primeros 6 clientes.

## Archivos del proyecto
- `web-destacamos-tu-web.html` — **landing principal**. Una sola página con scroll horizontal de servicios, valores, marquee, sectores y footer. El logo está integrado en cabecera y footer.
- `logo-destacamos-oscuro.png` / `logo-destacamos-claro.png` / `logo-destacamos-isotipo.png` — **kit de logo** (fondo oscuro, fondo claro, e isotipo cuadrado para redes/favicon).
- `tarjeta-destacamos-frente.png` / `tarjeta-destacamos-dorso.png` — **tarjeta de visita** (las dos caras, imagen).
- `tarjeta-destacamos-tu-web.pdf` — tarjeta lista para **imprenta** (85×55 mm + 3 mm de sangrado).
- `tarjeta-destacamos-tu-web.html` — código fuente de la tarjeta.

## Cómo se trabaja en este proyecto (IMPORTANTE)
- Los diseños (tarjeta, logo) se generan **por código**: HTML → PDF/PNG con **Chrome headless** (`--print-to-pdf` / `--screenshot`). Para cambiar algo, se edita el HTML y se **regenera**.
- **NO se editan en Canva**: al importar un PDF con degradados, Canva los rompe (rasteriza mal el resplandor y descoloca el texto). En Canva solo sirven como **imágenes planas / assets**.
- Pídele a Claude el cambio en lenguaje normal ("cambia el teléfono", "pon la fecha 2026") y lo regenera idéntico.
- La web es un **clon fiel del diseño de https://www.tiwis.fr/en** adaptado a la marca; si hay que tocar layout, esa es la referencia.

## Dónde está cada cosa
- **Repositorio (código, todo versionado):** https://github.com/yowiprod/Fam (rama `main`).
- **Canva:** logos subidos como assets + un diseño "Logo Destacamos Tu Web". Cuenta `prodkillingme@gmail.com`.
- **Google Drive:** carpeta `fam/DTW`. Cuenta `prodkillingme@gmail.com`.

## Pendientes
- [ ] Registrar el dominio **destacamostuweb.com**.
- [ ] **Publicar la web** online (Netlify Drop o GitHub Pages).
- [ ] Footer de la web: aún tiene placeholders `[TU EMAIL AQUÍ]` y `destacamostuweb.es` → poner `info@destacamostuweb.com` y unificar el dominio.
- [ ] Fotos reales para la sección **"Sectores"** de la web (ahora son placeholders).
