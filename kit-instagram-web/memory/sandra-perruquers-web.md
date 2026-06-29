---
name: sandra-perruquers-web
description: Datos de Sandra Perruquers (peluquería Andorra) para generar su web — fotos, servicios, horario, contacto
metadata:
  type: project
---

Proyecto en curso: web de marca personal para **Sandra Perruquers** (@sandraperruquers), peluquería en Andorra.

- **Fotos** en `assets/sandra/` — 7 posts a 1080px (trabajos de color/antes-después), 5 portadas de reels a 640px, `profile.jpg` 320px, y **3 fotos del salón** `salon-1/2/3.jpg` (del destacado "peluquería", vía sesión logueada).
- **Perfil:** Sandra Perruquers (user id 2709302472) · 1.745 seguidores · 117 publicaciones · Tel: **854314** (Andorra). Sin web ni email público en bio.
- **Ubicación del salón:** en Andorra, **enfrente de la Universitat d'Andorra** (visible desde el escaparate en salon-2.jpg).
- **Socio/co-propietario:** **Ismael Lerma (@ismalerma)** — Sandra lo llama "socio". Hacen también **barbería/caballero** (cortes de hombre, póster Babyliss en pared).
- **Servicios confirmados:** coloración, mechas/balayage/desteñidos, corrección de color, tratamientos capilares e hidratación/keratina (Delicatessen Mayday by Tempting), cortes y peinados señora y **caballero/barbería**.
- **Horario:** Lun cerrado · Mar–Vie 9:00–20:00 · Sáb 9:00–19:00 · Dom cerrado.

Scrapers: `scrape-generic.js <handle> <carpeta>` (grid HD vía web_profile_info, solo 12 posts públicos). Para destacados/posts privados hay sesión Instagram logueada guardada en `.ig-login-session` (perfil Playwright persistente) — reutilizable headless sin re-login. El destacado "peluquería" (id 18079776979935300) tiene 3 historias. La web aún no se ha generado.
