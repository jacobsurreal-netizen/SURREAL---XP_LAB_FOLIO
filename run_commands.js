const cp = require('child_process');
try {
    console.log('Removing tailwindcss-animate...');
    cp.execSync('npx pnpm remove tailwindcss-animate', { stdio: 'inherit' });
    console.log('Installing...');
    cp.execSync('npx pnpm install', { stdio: 'inherit' });
    console.log('Running tsc...');
    cp.execSync('npx tsc --noEmit', { stdio: 'inherit' });
    console.log('Done!');
} catch (e) {
    console.error('Command failed', e.message);
}
