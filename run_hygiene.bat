call pnpm remove tailwindcss-animate > hygiene.log 2>&1
call pnpm install >> hygiene.log 2>&1
call npx tsc --noEmit >> hygiene.log 2>&1
