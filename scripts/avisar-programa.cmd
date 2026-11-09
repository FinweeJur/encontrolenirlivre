@echo off
REM Avisos da programacao: bom dia, pagamento e comeco da tarde.
REM Roda a cada 5 minutos pelo Agendador de Tarefas. A janela de cada
REM aviso esta em scripts\avisos\agenda.py.
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
cd /d "X:\DevCoder\OpenCode\encontrolenirlivre"
python "scripts\avisar-programa.py" >> ".cache\avisos-programa.log" 2>&1
