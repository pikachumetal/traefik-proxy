#!/bin/bash
# Setup hosts file for local development
# Requires: Run with sudo

set -e

HOSTS_FILE="/etc/hosts"
DOMAINS=(
    "devtools.local"
    "sonarqube.devtools.local"
    "smtp.devtools.local"
    "alcstronghold.local"
    "backend.alcstronghold.local"
)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    echo -e "${RED}Error: This script requires root privileges. Run with sudo.${NC}"
    exit 1
fi

remove_domains() {
    echo -e "${YELLOW}Removing development domains from hosts file...${NC}"

    for domain in "${DOMAINS[@]}"; do
        if grep -q "127.0.0.1.*$domain" "$HOSTS_FILE"; then
            sed -i.bak "/127\.0\.0\.1.*$domain/d" "$HOSTS_FILE"
            echo -e "  ${RED}- $domain${NC}"
        fi
    done

    # Remove the comment line if exists
    sed -i.bak '/# Local Development Domains (traefik-proxy)/d' "$HOSTS_FILE"

    # Clean up backup
    rm -f "${HOSTS_FILE}.bak"

    echo -e "${GREEN}Domains removed successfully!${NC}"
}

add_domains() {
    echo -e "${CYAN}Adding development domains to hosts file...${NC}"

    local added=0
    local new_entries=""

    for domain in "${DOMAINS[@]}"; do
        if ! grep -q "127.0.0.1.*$domain" "$HOSTS_FILE"; then
            new_entries="${new_entries}127.0.0.1\t$domain\n"
            echo -e "  ${GREEN}+ $domain${NC}"
            ((added++))
        else
            echo -e "  ${GRAY}= $domain (already exists)${NC}"
        fi
    done

    if [[ $added -gt 0 ]]; then
        echo "" >> "$HOSTS_FILE"
        echo "# Local Development Domains (traefik-proxy)" >> "$HOSTS_FILE"
        echo -e "$new_entries" >> "$HOSTS_FILE"
        echo ""
        echo -e "${GREEN}Hosts file updated successfully!${NC}"
    else
        echo ""
        echo -e "${YELLOW}All domains already configured.${NC}"
    fi
}

show_current() {
    echo ""
    echo -e "${CYAN}Current development entries in hosts:${NC}"
    grep "\.local" "$HOSTS_FILE" 2>/dev/null | while read line; do
        echo "  $line"
    done
}

# Parse arguments
case "${1:-}" in
    --remove|-r)
        remove_domains
        ;;
    *)
        add_domains
        ;;
esac

show_current
