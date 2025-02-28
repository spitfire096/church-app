#!/bin/bash
# Check if services are running
sleep 10
curl -f http://localhost:3000 || exit 1
curl -f http://localhost:3001/health || exit 1 