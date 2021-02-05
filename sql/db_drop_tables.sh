#!/bin/zsh
BASEDIR=$(dirname "$0")

export PGHOST="${PGHOST:-localhost}"
export PGDATABASE="${PGDATBASE:-shutter}"
export PGUSER="${PGUSER:-shutteruser}"
export PGPORT="${PGPORT:-5432}"
export PGPASSWORD="${PGPASSWORD:-anshu123}"

psql -c "drop table table_name;"