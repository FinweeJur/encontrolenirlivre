@echo off
REM Espelha o CSV de presencas do D1 na planilha do Google Sheets.
REM Roda a cada 2 minutos pelo Agendador de Tarefas.
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
cd /d "X:\DevCoder\OpenCode\encontrolenirlivre"
"C:\Users\teste\AppData\Local\Programs\Python\Python312\python.exe" "scripts\espelhar-planilha.py" >> ".cache\espelho.log" 2>&1
