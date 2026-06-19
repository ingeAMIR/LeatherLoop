# ENVIRONMENTS — LeatherLoop

Este documento define las reglas de operacion de los
entornos del proyecto y su relacion con el pipeline CI.

## DEV (rama: develop)
- Deploy: cualquier integrante mediante push a develop.
- Pruebas obligatorias: lint, test unitario y build.
- Politica de fallo: notifica, no bloquea el trabajo.

## QA (rama: Pull Request hacia main)
- Deploy: autor del PR + revision de un companero.
- Pruebas obligatorias: lint, test y build en Node 18 y 20.
- Politica de fallo: bloquea el merge si el pipeline falla.

## PROD (rama: main)
- Deploy: solo via merge de PR aprobado. Sin push directo.
- Pruebas obligatorias: pipeline CI completo en verde.
- Politica de fallo: rama protegida, bloquea el deploy.

## Relacion con ci.yml
El trigger on.push (main, develop) cubre DEV y PROD.
El trigger on.pull_request (main) cubre QA.