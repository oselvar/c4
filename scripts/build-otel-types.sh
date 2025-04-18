#!/usr/bin/env bash

pushd scripts
git clone git@github.com:open-telemetry/opentelemetry-proto.git
pushd opentelemetry-proto

protoc \
  --plugin=../../node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=../../src \
  opentelemetry/proto/trace/v1/trace.proto

popd
rm -rf opentelemetry-proto
popd
