# Dialogo Contextual Narrativo

Este documento define el mecanismo para adaptar el texto principal de un nodo segun decisiones previas del jugador, sin duplicar escenarios y sin mezclar esta logica con el comparador.

## Objetivo

Algunas escenas necesitan recordar lo que el jugador dijo antes. El texto base del nodo debe seguir siendo neutral, pero puede sumar una frase contextual cuando existe una condicion narrativa.

Ejemplo: si en una escena anterior el jugador le dijo a Guzman que confirmara cupos de practica clinica, una escena posterior puede abrir recordando ese compromiso antes de plantear la decision actual.

## Estructura

Cada `ScenarioNode` puede declarar opcionalmente `contextualDialogue`.

```ts
{
  node_id: 'MLQ5X_D3S16_N22_GUZMAN_CONVENIO_BOX1',
  stakeholderId: 'andres-guzman',
  dialogue:
    'Para sostener cupos de practica clinica necesito dos cosas: avanzar en el convenio universitario y reservar Box 1 los martes AM.',
  contextualDialogue: [
    {
      when: {
        all: [
          {
            kind: 'decision_choice',
            nodeId: 'MLQ5X_D2S11_N17_GUZMAN_PRACTICE_CUPS',
            optionId: 'A',
          },
        ],
      },
      position: 'before',
      text: 'Como usted me pidio confirmar a la universidad que mantendriamos los cupos, necesito que esa senal ahora tenga respaldo operativo.',
    },
  ],
  options: [],
}
```

## Campos

- `dialogue`: texto base del nodo. Debe funcionar aunque no se cumpla ninguna condicion.
- `contextualDialogue`: lista de segmentos opcionales.
- `when`: condiciones que deben cumplirse para mostrar el segmento.
- `position`: lugar donde se inserta el segmento. Si se omite, se usa `before`.
- `text`: texto que se suma al dialogo base.

## Condicion `decision_choice`

`decision_choice` revisa el `decisionLog` del `GameState`.

```ts
{
  kind: 'decision_choice',
  sequenceId?: string,
  nodeId?: string,
  optionId?: string,
}
```

Se cumple si existe una decision previa que coincide con los campos definidos. Normalmente basta con `nodeId` y `optionId`.

## Flujo

1. La data del escenario define `dialogue` y, si corresponde, `contextualDialogue`.
2. Al presentar un nodo, el orquestador llama a `resolveScenarioDialogue(node, gameState)`.
3. El resolver evalua cada `when`.
4. Los segmentos cumplidos se agregan antes o despues del `dialogue`.
5. El comparador no participa en este flujo.

## Regla De Uso

Usar `contextualDialogue` para memoria narrativa:

- recordar una promesa previa,
- reconocer una contradiccion,
- adaptar el tono de un NPC segun una decision anterior,
- conectar dos escenas sin crear ramas completas.

No usar `contextualDialogue` para medir cumplimiento. Si hay una accion verificable, debe modelarse como `expected_actions` y resolverse con el comparador.

## Escalabilidad

Este mecanismo es universal para cualquier version o modulo narrativo de COMPASS. La data permanece dentro de cada escenario, mientras que el codigo comun solo resuelve condiciones contra el `GameState`.

Para nuevas narrativas:

1. Mantener el texto base neutral.
2. Agregar segmentos contextuales solo cuando una decision previa cambie la forma en que debe leerse el nodo.
3. No duplicar nodos si la decision actual es la misma.
4. Usar `expected_actions` solo cuando el jugador deba realizar una accion observable en una mecanica.
