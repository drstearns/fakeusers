#!/usr/bin/env bash
docker run -d \
--name devmongo \
-p 27017:27017 \
-e MONGO_INITDB_DATABASE=$2 \
$1
