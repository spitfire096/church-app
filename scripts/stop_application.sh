#!/bin/bash
# Stop all running processes
pm2 stop all || true
pm2 delete all || true 