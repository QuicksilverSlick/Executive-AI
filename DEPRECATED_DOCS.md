# Deprecated Documentation Files

The following documentation files have been consolidated into the main documentation structure:

## Consolidated Files

### DEPLOYMENT_GUIDE.md → DEPLOYMENT.md
- **Old**: `DEPLOYMENT_GUIDE.md` (Voice Agent specific)
- **New**: `DEPLOYMENT.md` (Comprehensive deployment guide)
- **Status**: Content merged and expanded

### PRODUCTION_SEARCH_SETUP.md → DEPLOYMENT.md + ARCHITECTURE.md
- **Old**: `PRODUCTION_SEARCH_SETUP.md` (Search-specific deployment)
- **New**: Integrated into `DEPLOYMENT.md` (search deployment) and `ARCHITECTURE.md` (search architecture)
- **Status**: Content distributed appropriately

### SEARCH_SERVER_SETUP.md → ARCHITECTURE.md
- **Old**: `SEARCH_SERVER_SETUP.md` (Standalone server setup)
- **New**: `ARCHITECTURE.md` (Search integration section)
- **Status**: Content integrated with architectural overview

## Migration Notes

All information from the deprecated files has been:
1. **Reviewed** for accuracy and current relevance
2. **Consolidated** into appropriate sections
3. **Enhanced** with additional context and best practices
4. **Organized** for better discoverability

## Current Documentation Structure

```
docs/
├── README.md           # Main project documentation
├── ARCHITECTURE.md     # System architecture and components
├── DEPLOYMENT.md       # Deployment guide for all platforms
├── SECURITY.md         # Security guidelines and best practices
└── .env.example        # Environment configuration template
```

The old files can be safely removed as their content has been fully preserved and improved in the new structure.

---

**Consolidation Date**: 2025-08-06  
**Status**: ✅ **Complete** - All legacy documentation successfully consolidated