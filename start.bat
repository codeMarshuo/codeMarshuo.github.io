@echo off
echo ============================================
echo   Hexo 博客系统 - 快速启动
echo ============================================
echo.

echo [1/2] 启动博客服务 (Hexo Server)...
echo       访问: http://localhost:4000
echo.
start "Hexo Server" cmd /c "npx hexo server"

timeout /t 3 /nobreak > nul

echo [2/2] 启动管理后台 (Admin Server)...
echo       访问: http://localhost:4001/admin
echo.
start "Admin Server" cmd /c "node admin-server.js"

echo.
echo ============================================
echo   ✅ 所有服务已启动!
echo   📖 博客:     http://localhost:4000
echo   📝 管理后台: http://localhost:4001/admin
echo ============================================
echo.
echo 按任意键关闭所有服务...
pause > nul

echo.
echo 正在关闭服务...
taskkill /fi "WINDOWTITLE eq Hexo Server" /f > nul 2>&1
taskkill /fi "WINDOWTITLE eq Admin Server" /f > nul 2>&1
echo ✅ 已关闭
pause
