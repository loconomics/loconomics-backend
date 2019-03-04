#!/bin/sh

BASE=${BASE:=https://dev.loconomics.com}
ID=${ID:=90001}
http $BASE/api/v1/en-US/postal-codes/$ID \
  |jq '.' -s
