git status > out_status.txt 2>&1
git diff --stat --staged > out_diff.txt 2>&1
git commit -m "feat(foundation): add runtime/hud/sdi/scene foundation shell" > out_commit.txt 2>&1
git log -1 --oneline > out_log.txt 2>&1
