#!/bin/sh

#if [ -d '/app/static-html' -a "`ls -A /app/static-html`" != "" ]; then
if [ $1 != 'pm2-runtime' -a $1 != 'pm2' ]; then
  # pass
  echo 'pass'
else
  echo 'copy file'
  cp -rf /app/sub-build/. /app/static-html/
fi

exec "$@"
