#!/bin/sh

BASE=${BASE:=https://dev.loconomics.com}
ID=${ID:=106}
http $BASE/api/v1/en-US/pricing-types/job-title/$ID \
  |jq '.' -s
