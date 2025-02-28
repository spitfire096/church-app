#!/bin/bash
cd /var/app

# Start frontend
cd FA-frontend
npm install
npm run build
pm2 start npm --name "frontend" -- start

# Start backend
cd ../FA-backend
npm install
npm run build
pm2 start npm --name "backend" -- start 