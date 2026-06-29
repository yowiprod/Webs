---
name: destacamostuweb-deploy
description: Cómo editar y desplegar la web en vivo destacamostuweb.com (Netlify)
metadata:
  type: project
---

La web destacamostuweb.com está desplegada en Netlify pero su HTML fuente NO estaba en la carpeta del proyecto (solo había config de Netlify). Se recuperó descargándola con `curl -sL https://destacamostuweb.com -o index_live.html`.

Es un único archivo HTML autocontenido (CSS y JS inline). La sección de servicios usa scroll horizontal: `#servicios-h` con `.h-track` y paneles `.panel` (cada `.panel` es 100vw). La altura de `.h-services` controla la velocidad del scroll horizontal; al añadir/quitar paneles hay que ajustarla (escritorio y la versión móvil en el `@media`).

**Flujo de edición y despliegue:**
1. Editar `index_live.html`.
2. `cp index_live.html index.html && cp index_live.html dist/index.html`
3. Desplegar: `netlify deploy --prod --dir=dist --site=86e2c76b-3e34-4918-8278-b73345c62dd7`

Site ID Netlify: `86e2c76b-3e34-4918-8278-b73345c62dd7` (proyecto "destacamostuweb", cuenta YAGÜE). Netlify CLI ya está instalado y con sesión iniciada.

**Estructura de servicios actual (paneles del scroll horizontal, en orden):**
1. Landing — básica desde 1.400€ · con scroll desde 1.750€ (base 2.000 / 2.500)
2. Multipágina — básica desde 2.100€ · con scroll desde 2.450€ (base 3.000 / 3.500)
3. Shopify — desde 2.800€ (base 4.000)
4. Productos (gestión mensual del catálogo, descuento por volumen): hasta 25 → 900€/mes; 26–100 → 1.400€/mes; +100 → desde 2.000€/mes
5. Extras (precio por cambio): palabra/frase 50€; texto 150€; imágenes 25€; página entera ~500€

Todas las tarjetas de servicio llevan badge "−30% fundadores · solo 6 primeros". Mantenimiento mensual: Landing 250€, Multipágina 750€, Shopify 1.200–4.000€. Se eliminó la antigua tarjeta "Social/Instagram" y el ítem "Seguridad y copias". El precio se muestra con apóstrofe estilo Andorra (prefijo tel. +376) cuando aplica.

