#!/bin/sh

set -x
set -e

curl -X DELETE $SERVER/connections
curl -X DELETE $SERVER/emailsessionseeds
curl -X DELETE $SERVER/emailprofiles
curl -X DELETE $SERVER/messages
curl -X DELETE $SERVER/sessions
curl -X DELETE $SERVER/users
