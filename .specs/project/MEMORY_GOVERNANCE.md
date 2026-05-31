# MEMORY_GOVERNANCE.md

## Objetivo

Definir regras de qualidade, privacidade, retenção, versionamento e confiabilidade das memórias da Mika.

---

## Classificação

### Privacidade

```text
PUBLIC
PRIVATE
SENSITIVE
```

### Confiança

```text
FACT
INFERRED
HYPOTHESIS
```

---

## Score de Confiança

```text
0.0 a 1.0
```

Exemplos:

* Documento enviado pelo usuário → 0.95
* Informação registrada manualmente → 1.00
* Inferência da IA → 0.60
* Hipótese não validada → 0.40

---

## Versionamento

Toda memória relevante deve manter histórico.

Exemplo:

```text
Objetivos de Vida
├── v1
├── v2
└── v3
```

---

## Retenção

Tipos de retenção:

* Permanente
* Longo prazo
* Curto prazo
* Arquivada

---

## Qualidade

O sistema deve identificar:

* Duplicidade
* Informações conflitantes
* Memórias obsoletas
* Memórias órfãs

---

## Memory Health

Indicadores:

* Total de documentos
* Total de chunks
* Total de eventos
* Memórias duplicadas
* Memórias sem uso
* Memórias conflitantes

---

## Exclusão

Usuário pode:

* Excluir memória
* Arquivar memória
* Ocultar memória
* Impedir uso em respostas

---

## Auditoria

Registrar:

* Criação
* Alteração
* Exclusão
* Utilização em respostas

---

## Critério de Done

* Controle de privacidade implementado
* Versionamento implementado
* Sistema de confiança implementado
* Auditoria implementada
* Relatório de saúde da memória disponível
