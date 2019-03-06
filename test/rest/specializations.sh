#!/bin/sh

BASE=${BASE:=https://dev.loconomics.com}
SEARCHTERM=${SEARCHTERM:=massage}
http $BASE/api/v1/en-US/specializations \
  searchTerm==$SEARCHTERM \
  |jq '.' -s
