#!/bin/sh

BASE=${BASE:=https://dev.loconomics.com}
http --form POST $BASE/api/v1/en-US/auth/login \
  username=$USERNAME password=$PASSWORD \
  |jq '.' -s
