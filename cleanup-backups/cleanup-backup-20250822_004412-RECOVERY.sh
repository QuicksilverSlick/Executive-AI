#!/bin/bash
# Quick recovery script for cleanup backup

echo "🔄 DREAMFORGE CLEANUP RECOVERY"
echo "==============================="
echo "Available recovery options:"
echo ""
echo "1. Full restore (overwrites everything):"
echo "   tar -xzf BACKUP_NAME-full.tar.gz --strip-components=1"
echo ""
echo "2. Selective restore:"
echo "   cp BACKUP_NAME-docs/*.md ."
echo "   cp BACKUP_NAME-scripts/*.{js,sh,bat} ."
echo "   cp BACKUP_NAME-configs/*.{json,mjs,toml,tsx,css} ."
echo ""
echo "3. Git restore (if committed):"
echo "   git reset --hard HEAD~1"
echo ""
read -p "Enter option (1-3) or 'q' to quit: " choice

case $choice in
    1)
        echo "Restoring full backup..."
        tar -xzf *-full.tar.gz --strip-components=1
        echo "✅ Full restore complete"
        ;;
    2)
        echo "Selective restore - copy files manually from subdirectories"
        ;;
    3)
        git reset --hard HEAD~1
        echo "✅ Git restore complete"
        ;;
    q)
        echo "Recovery cancelled"
        ;;
    *)
        echo "Invalid option"
        ;;
esac
