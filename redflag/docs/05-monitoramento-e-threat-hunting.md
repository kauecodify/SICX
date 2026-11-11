# 05 - Monitoramento e threat hunting

## Objetivo

Detectar atividade remanescente do atacante e confirmar a eficacia da
contencao.

## Prioridades

1. Investigar execucao suspeita de PowerShell e anomalias de EDR (RF-MON-01).
2. Tratar acesso a honeypots e arquivos isca como comprometimento ativo
   (RF-MON-02).
3. Priorizar correcao de vulnerabilidades criticas exploraveis (RF-MON-03).

## Hipoteses de hunt pos-incidente

- Persistencia: novas tarefas agendadas, servicos, chaves de execucao
  automatica e contas criadas apos `<DATA_PRIMEIRO_INDICIO>`.
- Movimento lateral: conexoes entre servidores fora da linha de base,
  uso de credenciais de servico em hosts inesperados.
- Exfiltracao: volumes de egress anormais, conexoes a `<IP_SUSPEITO>`,
  uso de protocolos incomuns.
- Manipulacao de logs: lacunas, reinicios de servico de log, alteracoes de
  configuracao de auditoria.

## Fontes

- Telemetria de EDR: `<FERRAMENTA_EDR>`.
- Logs de firewall, proxy e gateway de API.
- Logs do servidor de logs imutavel (playbook PB-05).
- Honeypots e arquivos isca (playbook PB-07).

## Procedimento

1. Formular hipotese e definir consulta (ver `dashboard/consultas.kql`).
2. Executar busca em janela delimitada.
3. Registrar achados como eventos JSONL e reavaliar com o motor RedFlag.
4. Escalar achados confirmados conforme matriz de RedFlags.

Ver checklist `checklists/checklist-monitoramento.md`.
