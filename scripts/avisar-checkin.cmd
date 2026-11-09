@echo off
REM Marcos do check-in: 50, 100, 150... presencas numa atividade.
REM Roda de minuto em minuto pelo Agendador de Tarefas.
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
cd /d "X:\DevCoder\OpenCode\encontrolenirlivre"
python "scripts\avisar-checkin.py" >> ".cache\avisos-checkin.log" 2>&1
