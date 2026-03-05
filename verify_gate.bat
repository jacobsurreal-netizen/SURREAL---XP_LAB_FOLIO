@echo off
echo [VERIFICATION] Starting Quality Gate Checks...
echo [LINT]
call npx pnpm lint > verify_lint.log 2>&1
echo [TYPECHECK]
call npx pnpm typecheck > verify_tsc.log 2>&1
echo [BUILD]
call npx pnpm build > verify_build.log 2>&1
echo [DONE]
