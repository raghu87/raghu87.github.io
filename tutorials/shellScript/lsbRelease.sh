#!/bin/sh

if [ ! -f /etc/lsb-release ]; then
  echo "lsb-release missing, unlikely to be a Ubuntu system"
  exit 1
fi
. /etc/lsb-release
echo "DISTRIB_ID="$DISTRIB_ID
echo "DISTRIB_RELEASE="$DISTRIB_RELEASE
echo "DISTRIB_CODENAME="$DISTRIB_CODENAME
echo "DISTRIB_DESCRIPTION="$DISTRIB_DESCRIPTION
if [ "$DISTRIB_ID" != "Ubuntu" -o "$DISTRIB_RELEASE" != "16.04" ]; then
  echo "Linux install doesn't appear to be Ubuntu 16.04"
  exit 1
fi
