#!/bin/bash
echo "============================================"
echo "  Hexo 博客系统 - 快速启动"
echo "============================================"
echo ""

echo "[1/3] 构建博客..."
npx hexo generate

echo ""
echo "[2/3] 启动博客服务 (Hexo Server)..."
echo "        访问: http://localhost:4000"
npx hexo server &
HEXO_PID=$!

sleep 2

echo ""
echo "[3/3] 启动管理后台 (Admin Server)..."
echo "        访问: http://localhost:4001/admin"
node admin-server.js &
ADMIN_PID=$!

echo ""
echo "============================================"
echo "  ✅ 所有服务已启动!"
echo "  📖 博客:     http://localhost:4000"
echo "  📝 管理后台: http://localhost:4001/admin"
echo "============================================"
echo ""
echo "按 Ctrl+C 停止所有服务"

trap "kill $HEXO_PID $ADMIN_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
