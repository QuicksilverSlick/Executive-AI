#!/bin/bash

#
# DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
#
# @file-purpose: Comprehensive backup script before executing cleanup plan
# @version: 1.0.0
# @init-author: planner-agent
# @init-cc-sessionId: cc-plan-20250822-master
# @init-timestamp: 2025-08-22T15:45:00Z
# @reasoning:
# - **Objective:** Create comprehensive backup before any file deletions
# - **Strategy:** Multiple backup methods with verification
# - **Outcome:** Safe recovery option for all cleanup operations
#

set -e  # Exit on any error

# Configuration
BACKUP_DIR="cleanup-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="cleanup-backup-${TIMESTAMP}"
PROJECT_ROOT="/home/dreamforge/ai_masterclass/executive-ai-training"

echo "🔒 DREAMFORGE CLEANUP BACKUP SCRIPT"
echo "=================================="
echo "Timestamp: $(date)"
echo "Project: executive-ai-training"
echo "Backup Name: ${BACKUP_NAME}"
echo ""

# Create backup directory
mkdir -p "${BACKUP_DIR}"

echo "📂 Creating comprehensive backup..."

# 1. Full project backup (tar.gz)
echo "   📦 Creating full project archive..."
cd ..
tar -czf "${PROJECT_ROOT}/${BACKUP_DIR}/${BACKUP_NAME}-full.tar.gz" \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='.next' \
    --exclude='cleanup-backups' \
    "$(basename ${PROJECT_ROOT})"
cd "${PROJECT_ROOT}"

# 2. Documentation-specific backup
echo "   📄 Creating documentation backup..."
mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}-docs"
find . -maxdepth 1 -name "*.md" -exec cp {} "${BACKUP_DIR}/${BACKUP_NAME}-docs/" \;

# 3. Scripts-specific backup
echo "   📜 Creating scripts backup..."
mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}-scripts"
find . -maxdepth 1 \( -name "*.js" -o -name "*.sh" -o -name "*.bat" \) -exec cp {} "${BACKUP_DIR}/${BACKUP_NAME}-scripts/" \;

# 4. Configuration files backup
echo "   ⚙️  Creating configuration backup..."
mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}-configs"
find . -maxdepth 1 \( -name "*.json" -o -name "*.mjs" -o -name "*.toml" -o -name "*.tsx" -o -name "*.css" \) -exec cp {} "${BACKUP_DIR}/${BACKUP_NAME}-configs/" \;

# 5. Large artifacts backup (if exists)
echo "   💾 Backing up large artifacts..."
if [ -d "deployment-package" ]; then
    mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}-artifacts"
    cp -r deployment-package "${BACKUP_DIR}/${BACKUP_NAME}-artifacts/"
    echo "      ✅ deployment-package backed up"
fi

# 6. Hidden files and deployment triggers
echo "   🔍 Backing up hidden files and triggers..."
mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}-hidden"
find . -maxdepth 1 -name ".*" -type f \( -name ".vercel*" -o -name ".deploy*" \) -exec cp {} "${BACKUP_DIR}/${BACKUP_NAME}-hidden/" \; 2>/dev/null || true
if [ -f "deploy-commands.txt" ]; then
    cp deploy-commands.txt "${BACKUP_DIR}/${BACKUP_NAME}-hidden/"
fi

# 7. Create inventory of backed up files
echo "   📋 Creating backup inventory..."
cat > "${BACKUP_DIR}/${BACKUP_NAME}-INVENTORY.txt" << EOF
DREAMFORGE CLEANUP BACKUP INVENTORY
===================================
Backup Created: $(date)
Project: executive-ai-training
Backup Location: ${PROJECT_ROOT}/${BACKUP_DIR}/${BACKUP_NAME}*

FULL ARCHIVE:
${BACKUP_NAME}-full.tar.gz - Complete project archive (excluding .git, node_modules)

CATEGORIZED BACKUPS:
${BACKUP_NAME}-docs/ - All .md documentation files ($(ls -1 *.md 2>/dev/null | wc -l) files)
${BACKUP_NAME}-scripts/ - All script files .js/.sh/.bat ($(ls -1 *.js *.sh *.bat 2>/dev/null | wc -l) files)
${BACKUP_NAME}-configs/ - All config files .json/.mjs/.toml/.tsx/.css ($(ls -1 *.json *.mjs *.toml *.tsx *.css 2>/dev/null | wc -l) files)
${BACKUP_NAME}-artifacts/ - Large build artifacts ($(du -sh deployment-package 2>/dev/null | cut -f1 || echo "N/A"))
${BACKUP_NAME}-hidden/ - Hidden files and deployment triggers

FILES TO BE DELETED IN CLEANUP:
Documentation (47 files):
$(echo "CLOUDFLARE_SETUP.md CLOUDFLARE_DEPLOYMENT.md CLOUDFLARE_FIX.md WORKERS_DEPLOYMENT_GUIDE.md WORKERS_DEPLOYMENT.md WORKERS_DEPLOYMENT_FIXES.md PAGES_DEPLOYMENT.md DEPLOY_NOW.md DEPLOYMENT_FIX.md DEPLOYMENT_FIXES_SUMMARY.md DEPLOY_INSTRUCTIONS.md FIXES_SUMMARY.md VOICE_ASSISTANT_FIXES.md VOICE_ASSISTANT_FIXES_SUMMARY.md VOICE_AGENT_FIXES.md VOICE_AGENT_CRITICAL_FIXES.md VOICE_AGENT_DEBUG_REPORT.md VOICE_AGENT_IMPROVEMENTS.md WEBRTC_FIXES_SUMMARY.md WEBRTC_CONTINUOUS_MODE_READY.md REACT_HOOKS_FIX_SUMMARY.md MOBILE_UI_REDESIGN_SUMMARY.md UI_FIXES_SUMMARY.md CSS_FIXES_SUMMARY.md THEME_FIXES_IMPLEMENTED.md MOBILE_LAYOUT_FIXES.md CHAT_INPUT_FIX.md CIRCULAR_DEPENDENCY_FIX.md CONNECTION_STATE_FIX.md PORT_CONFIGURATION_FIX.md FIX_VOICE_AGENT_PORT.md VOICE_AGENT_INTEGRATION_COMPLETE.md VOICE_SEARCH_IMPLEMENTATION_COMPLETE.md VOICE_SEARCH_READY.md FINAL_STEPS_VOICE_SEARCH.md VOICE_SEARCH_ACKNOWLEDGMENT_IMPLEMENTATION.md CONVERSATION_HISTORY_RESTORATION.md FUNCTION_CALLING_IMPLEMENTATION.md RESPONSES_API_IMPLEMENTATION.md DESIGN_SYSTEM_IMPLEMENTATION.md SETUP_COMPLETE.md MIGRATION_COMPLETE.md SEARCH_FIX_SUMMARY.md SEARCH_API_FIX.md README-TESTING.md TEST_SUITE_RESULTS.md WEB_SEARCH_TEST_RESULTS.md DEBUG_VOICE_AGENT.md" | tr ' ' '\n')

Scripts (21 files):
$(echo "test-api-key-availability.js test-api-local.js test-drip-city-query.js test-function-call-integration.js test-function-calling.js test-openai-responses-direct.js test-responses-api-diagnostic.js test-responses-api-fix.js test-responses-api-simple.js test-responses-api.js test-search-implementation.js test-secure-implementation.js test-voice-agent-security.js test-voice-search-e2e.js test-web-search-comprehensive.js verify-server-restart.js deploy-latest-to-vercel.sh deploy-windows.bat force-redeploy.sh migrate-to-cloudflare.sh fix-worker-imports.sh" | tr ' ' '\n')

Configs/Artifacts (15 files):
deployment-package/ (directory)
.vercel-force-sync
.vercel-build-trigger
deploy-commands.txt
mobile-voice-assistant-css.css
minimized-visualizer-component.tsx
collapsible-transcript-component.tsx
mobile-bottom-control-bar-component.tsx
VOICE_CONTROL_FLOW_UPDATE.md
TIMEOUT_IMPLEMENTATION_SUMMARY.md
VOICE_AGENT_PAUSE_RESUME_HANDOFF.md
dev-handoff-report.md
SETUP_OPENAI_API_KEY.md
RESTART_SERVER_INSTRUCTIONS.md
SESSION_PERSISTENCE_FIXES.md

RECOVERY INSTRUCTIONS:
1. Full restore: tar -xzf ${BACKUP_NAME}-full.tar.gz
2. Selective restore: Copy specific files from categorized backups
3. Git restore: git reset --hard HEAD~1 (if changes committed)

VERIFICATION:
Backup size: $(du -sh ${BACKUP_DIR} 2>/dev/null | cut -f1)
Archive integrity: $(test -f "${BACKUP_DIR}/${BACKUP_NAME}-full.tar.gz" && echo "✅ Archive created" || echo "❌ Archive missing")
Documentation backup: $(test -d "${BACKUP_DIR}/${BACKUP_NAME}-docs" && echo "✅ Docs backed up" || echo "❌ Docs missing")
Scripts backup: $(test -d "${BACKUP_DIR}/${BACKUP_NAME}-scripts" && echo "✅ Scripts backed up" || echo "❌ Scripts missing")
Configs backup: $(test -d "${BACKUP_DIR}/${BACKUP_NAME}-configs" && echo "✅ Configs backed up" || echo "❌ Configs missing")
EOF

# 8. Verification
echo ""
echo "🔍 BACKUP VERIFICATION"
echo "====================="

# Check archive integrity
if [ -f "${BACKUP_DIR}/${BACKUP_NAME}-full.tar.gz" ]; then
    echo "✅ Full archive created: $(du -sh "${BACKUP_DIR}/${BACKUP_NAME}-full.tar.gz" | cut -f1)"
    tar -tzf "${BACKUP_DIR}/${BACKUP_NAME}-full.tar.gz" > /dev/null
    echo "✅ Archive integrity verified"
else
    echo "❌ Full archive failed to create"
    exit 1
fi

# Check categorized backups
for category in docs scripts configs; do
    if [ -d "${BACKUP_DIR}/${BACKUP_NAME}-${category}" ]; then
        file_count=$(ls -1 "${BACKUP_DIR}/${BACKUP_NAME}-${category}" | wc -l)
        echo "✅ ${category} backup: ${file_count} files"
    else
        echo "❌ ${category} backup missing"
    fi
done

# Check artifacts
if [ -d "${BACKUP_DIR}/${BACKUP_NAME}-artifacts" ]; then
    echo "✅ Artifacts backup: $(du -sh "${BACKUP_DIR}/${BACKUP_NAME}-artifacts" | cut -f1)"
fi

# 9. Create quick recovery script
cat > "${BACKUP_DIR}/${BACKUP_NAME}-RECOVERY.sh" << 'EOF'
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
EOF

chmod +x "${BACKUP_DIR}/${BACKUP_NAME}-RECOVERY.sh"

# 10. Final summary
echo ""
echo "📊 BACKUP SUMMARY"
echo "================="
echo "Backup Location: ${BACKUP_DIR}/"
echo "Total Backup Size: $(du -sh ${BACKUP_DIR} | cut -f1)"
echo "Backup Files Created:"
echo "  📦 ${BACKUP_NAME}-full.tar.gz (complete archive)"
echo "  📁 ${BACKUP_NAME}-docs/ ($(ls -1 ${BACKUP_DIR}/${BACKUP_NAME}-docs/ | wc -l) documentation files)"
echo "  📁 ${BACKUP_NAME}-scripts/ ($(ls -1 ${BACKUP_DIR}/${BACKUP_NAME}-scripts/ | wc -l) script files)"
echo "  📁 ${BACKUP_NAME}-configs/ ($(ls -1 ${BACKUP_DIR}/${BACKUP_NAME}-configs/ | wc -l) config files)"
echo "  📁 ${BACKUP_NAME}-artifacts/ (large build files)"
echo "  📁 ${BACKUP_NAME}-hidden/ (hidden and trigger files)"
echo "  📋 ${BACKUP_NAME}-INVENTORY.txt (detailed inventory)"
echo "  🔄 ${BACKUP_NAME}-RECOVERY.sh (recovery script)"
echo ""
echo "✅ BACKUP COMPLETE - You can now safely run the cleanup plan"
echo ""
echo "Recovery Options:"
echo "  1. Full restore: tar -xzf ${BACKUP_DIR}/${BACKUP_NAME}-full.tar.gz --strip-components=1"
echo "  2. Run recovery script: ./${BACKUP_DIR}/${BACKUP_NAME}-RECOVERY.sh"
echo "  3. Git restore: git reset --hard HEAD~1 (after committing)"
echo ""
echo "Next Steps:"
echo "  1. Review the backup inventory: cat ${BACKUP_DIR}/${BACKUP_NAME}-INVENTORY.txt"
echo "  2. Execute cleanup plan: Follow MASTER_CLEANUP_PLAN.md"
echo "  3. Verify results and commit changes"
echo ""

# Output backup summary to file for reference
echo "Backup created: $(date)" > "${BACKUP_DIR}/LATEST_BACKUP.txt"
echo "Name: ${BACKUP_NAME}" >> "${BACKUP_DIR}/LATEST_BACKUP.txt"
echo "Location: ${PROJECT_ROOT}/${BACKUP_DIR}/" >> "${BACKUP_DIR}/LATEST_BACKUP.txt"
echo "Size: $(du -sh ${BACKUP_DIR} | cut -f1)" >> "${BACKUP_DIR}/LATEST_BACKUP.txt"

exit 0