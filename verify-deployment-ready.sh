#!/bin/bash

# Deployment Readiness Verification Script
# Checks if all required files are in place for Hetzner deployment

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}          HETZNER DEPLOYMENT READINESS CHECK${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

ERRORS=0
WARNINGS=0

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1 ${RED}(MISSING)${NC}"
        ((ERRORS++))
        return 1
    fi
}

check_executable() {
    if [ -x "$1" ]; then
        echo -e "${GREEN}✅${NC} $1 ${GREEN}(executable)${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️${NC}  $1 ${YELLOW}(not executable)${NC}"
        ((WARNINGS++))
        return 1
    fi
}

echo -e "${BLUE}Core Configuration Files:${NC}"
check_file "ecosystem.config.js"
check_file "server.js"
check_file ".env.production.template"
check_file "app/api/health/route.ts"

echo ""
echo -e "${BLUE}Deployment Scripts:${NC}"
check_executable "scripts/server-setup.sh"
check_executable "scripts/app-setup.sh"
check_executable "scripts/setup-env.sh"
check_executable "scripts/db-setup.sh"
check_executable "scripts/setup-ssl.sh"
check_executable "scripts/setup-monitoring.sh"
check_executable "scripts/deploy.sh"
check_executable "scripts/quick-deploy.sh"

echo ""
echo -e "${BLUE}Helper Scripts:${NC}"
check_executable "status-dashboard.sh"
check_executable "check-db-health.sh"
check_executable "backup-db.sh"
check_executable "cleanup-logs.sh"

echo ""
echo -e "${BLUE}Documentation:${NC}"
check_file "docs/HETZNER_DEPLOYMENT.md"
check_file "DEPLOYMENT_QUICKSTART.md"
check_file "DEPLOYMENT_READY.md"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED! Ready for deployment!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  ${WARNINGS} warnings found. Run: chmod +x *.sh scripts/*.sh${NC}"
    exit 0
else
    echo -e "${RED}❌ ${ERRORS} errors found. Please fix missing files.${NC}"
    exit 1
fi
