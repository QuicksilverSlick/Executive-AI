@echo off
echo === Direct Cloudflare Pages Deployment (Windows) ===
echo.

:: Clean previous builds
echo Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist .astro rmdir /s /q .astro

:: Build with latest code
echo Building application with latest fixes...
call npm run build

if %errorlevel% neq 0 (
    echo Build failed. Please check the errors above.
    exit /b 1
)

echo.
echo Build successful! Now deploying to Cloudflare Pages...
echo.

:: Deploy directly to Cloudflare Pages
npx wrangler pages deploy dist --project-name=executive-ai --branch=main

echo.
echo Deployment complete!
echo.
echo Next steps:
echo 1. Check your Cloudflare Pages dashboard for the new deployment
echo 2. The MessageChannel error should be resolved
echo 3. Your site will be live at the Pages URL