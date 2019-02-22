#!/bin/sh

BASE=${BASE:=https://dev.loconomics.com}
ID=${ID:=1}
http $BASE/api/v1/en-US/posting-templates/$ID \
  |jq -s
