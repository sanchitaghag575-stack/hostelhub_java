#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
mkdir -p java-backend/out
javac --add-modules jdk.httpserver -d java-backend/out java-backend/src/HostelHubServer.java
java --add-modules jdk.httpserver -cp java-backend/out HostelHubServer
