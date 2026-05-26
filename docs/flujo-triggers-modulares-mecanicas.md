# Flujo Modular De Triggers Por Mecanica

Este documento define el patron recomendado para activar contenido contingente en COMPASS sin acoplar el comparador a una mecanica especifica.

## Principio

El comparador solo compara:

```txt
expected_actions + canonical_actions -> comparisons
```

El comparador no debe saber si una comparacion activa correos, documentos, planificacion, mapa u otra mecanica futura.

Algunas reglas no necesitan una `canonical_action` de una mecanica visual. Por ejemplo, una regla de `office` puede comparar una decision narrativa anterior contra una decision narrativa futura usando `decisionLog`. Sigue siendo una comparacion normal: nace desde un `expected_action`, queda en `comparisons`, y los triggers de las mecanicas solo observan el resultado.

Cada mecanica observa el `GameState` y su propia data. Si un trigger declarado en la data se cumple, esa mecanica aplica su propio cambio.

```txt
GameState + data de la mecanica -> servicio de triggers de la mecanica -> nuevo GameState
```

## Responsabilidades

`ComparisonEngine.ts`:

- Lee `expected_actions`.
- Lee `canonical_actions`.
- Genera `comparisons` con `outcome`, `reason`, `rule_id` y `raw_deviation`.
- No dispara contenido.
- No contiene data narrativa.

Data de cada mecanica:

- Declara que contenido existe.
- Declara cuando se activa.
- No requiere cambios en el orquestador para cada nuevo contenido.

Servicio de triggers de cada mecanica:

- Recibe `GameState`.
- Recibe la data de esa mecanica.
- Revisa los triggers declarados.
- Aplica solo cambios propios de esa mecanica.

## Ejemplo: Inbox

Archivo:

```txt
mechanics/inbox/services/emailTriggers.ts
```

Entrada:

```ts
appendTimeBlockEmails(gameState, emailTemplates, day, slot)
```

Responsabilidad:

- Revisar correos `ON_TIME_BLOCK`.
- Revisar correos `ON_CASE_EVENT`.
- Revisar correos `ON_COMPARISON_OUTCOME`.
- Revisar correos `ON_CONDITION_GROUP`.
- Agregar al inbox solo los correos cuyo trigger se cumple.
- Para `ON_COMPARISON_OUTCOME`, evaluar desde el bloque configurado en adelante. Asi no se pierde un correo si el outcome aparece despues del bloque exacto, por ejemplo al enviar la planificacion o al cerrar el dia.
- Para `ON_CONDITION_GROUP`, evaluar condiciones del `GameState` sin bloque horario asignado. Sirve para correos contingentes que dependen de variables como confianza o apoyo de NPC.

Ejemplo de correo contingente:

```ts
{
  email_id: 'mlq5x-d3-sequence-17-guzman-box1-reversal',
  from: 'Dr. Andres Guzman',
  subject: 'Cambio de decision BOX 1 AM',
  body: '...',
  trigger: {
    type: 'ON_COMPARISON_OUTCOME',
    day: 5,
    slot: 'tarde',
    condition: {
      sourceNodeId: 'MLQ5X_D2S11_N17_GUZMAN_PRACTICE_CUPS',
      sourceOptionId: 'A',
      ruleId: 'future_decision_consistency_rule_v1',
      stakeholderId: 'andres-guzman',
      outcomeIn: [false],
    },
  },
}
```

Ese correo no depende de un `unlock` manual en el escenario. Depende de que el comparador ya haya escrito una comparacion incumplida en `gameState.comparisons`.

Cuando la comparacion depende de una decision futura, el `expected_action` se declara en la opcion que crea el compromiso:

```ts
expected_actions: [
  {
    mechanic_id: 'office',
    action_type: 'choose_future_option',
    target_ref: 'scenario_node:MLQ5X_D3S16_N22_GUZMAN_CONVENIO_BOX1',
    constraints: {
      target_node_id: 'MLQ5X_D3S16_N22_GUZMAN_CONVENIO_BOX1',
      accepted_option_ids: ['A', 'B'],
    },
    rule_id: 'future_decision_consistency_rule_v1',
    stakeholder_id: 'andres-guzman',
  },
]
```

El correo o documento contingente se configura mirando el origen de ese compromiso, no el nodo futuro:

```ts
condition: {
  sourceNodeId: 'MLQ5X_D2S11_N17_GUZMAN_PRACTICE_CUPS',
  sourceOptionId: 'A',
  ruleId: 'future_decision_consistency_rule_v1',
  stakeholderId: 'andres-guzman',
  outcomeIn: [false],
}
```

Para el mismo compromiso se pueden declarar dos contenidos contingentes:

- `outcomeIn: [true]`: si la decision futura mantiene la consistencia.
- `outcomeIn: [false]`: si la decision futura contradice lo prometido.

Ambos deben apuntar al `expected_action` de origen, no a la decision futura. En este ejemplo, el origen es el nodo 17 opcion A, porque ahi nace el compromiso que luego se compara contra el nodo 22.

Ejemplo de correo contingente por variables:

```ts
{
  email_id: 'mlq5x-variable-guzman-positive',
  from: 'Dr. Andres Guzman',
  subject: 'Desempeno como director',
  body: '...',
  trigger: {
    type: 'ON_CONDITION_GROUP',
    condition: {
      any: [
        { kind: 'stakeholder_metric', stakeholderId: 'andres-guzman', metric: 'trust', op: '>=', value: 70 },
        { kind: 'stakeholder_metric', stakeholderId: 'andres-guzman', metric: 'support', op: '>=', value: 70 },
      ],
    },
  },
}
```

Este tipo de correo no requiere `day` ni `slot`: se activa cuando el estado cumple la condicion declarada en la data.

## Office: Comparaciones Narrativas

`office` es la mecanica de escenarios narrativos. Sus reglas viven en:

```txt
mechanics/office/rules.ts
```

El orquestador no debe implementar reglas de nodos ni opciones. Despues de una decision narrativa solo llama:

```ts
syncOfficeDecisionComparisons(gameState, {
  sessionId,
  roomDefinitions,
})
```

Ese servicio vive en:

```txt
mechanics/office/services/officeDecisionComparison.ts
```

Su responsabilidad es acotada:

- Recibir `GameState`.
- Usar `decisionLog` para resolver reglas de `office`.
- Fusionar nuevas `comparisons`.
- Devolver un `GameState` actualizado.

Importante: los buffers de `MechanicEngine` deben vaciarse antes de entrar a un updater de React (`setGameState(prev => ...)`) y luego pasarse como data ya capturada. No se debe llamar `mechanicEngine.flush()` dentro del updater, porque React puede ejecutar ese updater mas de una vez en desarrollo y consumir el buffer antes de que el cambio quede aplicado. Si eso ocurre, aparece el toast de compromiso, pero el `expected_action` no llega a `gameState.expectedActions`, por lo que no aparece en objetivos ni puede activar triggers.

Reglas disponibles:

```txt
future_decision_consistency_rule_v1
```

Compara una decision origen contra una decision futura. Sirve para casos como: "si prometio A en el nodo 17, luego debe elegir A o B en el nodo 22".

```txt
decision_chain_consistency_rule_v1
```

Compara una cadena de decisiones en varios nodos.

Ejemplo:

```ts
expected_actions: [
  {
    mechanic_id: 'office',
    action_type: 'decision_chain_consistency',
    target_ref: 'decision_chain:guzman_docencia',
    rule_id: 'decision_chain_consistency_rule_v1',
    stakeholder_id: 'andres-guzman',
    constraints: {
      required_decisions: [
        {
          node_id: 'NODO_1',
          accepted_option_ids: ['A'],
        },
        {
          node_id: 'NODO_2',
          accepted_option_ids: ['B', 'C'],
        },
        {
          node_id: 'NODO_3',
          rejected_option_ids: ['C'],
        },
      ],
    },
  },
]
```

La regla retorna `true` cuando todas las condiciones se cumplen, `false` cuando alguna decision tomada contradice la cadena, y no resuelve mientras falten decisiones futuras durante la simulacion.

## Flujo Completo

1. Una opcion narrativa crea un `expected_action`.
2. Una mecanica genera una `canonical_action`, o una regla de `office` observa decisiones narrativas en `decisionLog`.
3. `ComparisonEngine` calcula `comparison.outcome`.
4. El resultado queda en `gameState.comparisons`.
5. El servicio de triggers de la mecanica revisa su data contra `GameState`.
6. Si el trigger se cumple, la mecanica activa su contenido.

Para inbox:

```txt
comparison.outcome = false
-> emailTriggers revisa emails.ts
-> encuentra ON_COMPARISON_OUTCOME matching
-> agrega email_id al inbox
```

## Patron Para Futuras Mecanicas

Cada mecanica futura deberia seguir el mismo contrato:

```txt
mechanics/<mecanica>/services/<mecanica>Triggers.ts
```

Ejemplos:

```txt
mechanics/documents/services/documentTriggers.ts
mechanics/scheduler/services/schedulerTriggers.ts
mechanics/map/services/mapTriggers.ts
```

Cada servicio debe:

- Recibir `GameState`.
- Recibir la data propia de su mecanica.
- Evaluar triggers propios de esa data.
- Devolver un `GameState` actualizado.
- No modificar responsabilidades de otras mecanicas.

## Regla De Modularidad

No agregar data narrativa al comparador.

No hardcodear IDs de una narrativa dentro de servicios compartidos.

No modificar `GestionEnSalud_App.tsx` para cada nuevo correo, documento o evento.

Si una nueva narrativa necesita contenido contingente, se agrega en la data de la mecanica correspondiente.
