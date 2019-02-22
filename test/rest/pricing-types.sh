#!/bin/sh

BASE=${BASE:=https://dev.loconomics.com}
http $BASE/api/v1/en-US/pricing-types/$* \
  |jq -s
