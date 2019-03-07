#!/bin/sh

BASE=${BASE:=https://dev.loconomics.com}
http $BASE/api/v1/en-US/users/profile/$ID \
  "Authorization: Bearer $TOKEN" \
  |jq '.' -s
