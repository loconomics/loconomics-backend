#!/bin/sh

BASE=${BASE:=https://dev.loconomics.com}
ONLY_SELECTABLE=${ONLY_SELECTABLE:=false}
http $BASE/api/v1/en-US/event-types \
  onlySelectable==$ONLY_SELECTABLE \
  |jq -s
