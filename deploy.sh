#!/usr/bin/env bash
set -e

# add dist as new worktree on gh pages branch
rm dist -rf
git worktree add dist gh-pages

# clean up, build
rm dist/* -r
npm run build

cd dist && git add -A && git commit -m "$(date)" && git push origin gh-pages

# remove worktree
git worktree remove dist

