#!/bin/sh

set -x
set -e

curl -X DELETE $SERVER/connections
curl -X DELETE $SERVER/emailsessionseeds
curl -X DELETE $SERVER/emailprofiles
curl -X DELETE $SERVER/messages
curl -X DELETE $SERVER/sessions
curl -X DELETE $SERVER/users

curl -X POST $SERVER/admin/register -d 'name=James&email=ech@ech.net@level=0'
curl -X POST $SERVER/admin/register -d 'name=Tester1&email=james@ech.net'
curl -X POST $SERVER/admin/register -d 'name=Tester2&email=james.echmalian@gmail.com'
curl -X POST $SERVER/admin/register -d 'name=Rob&email=rob777@comcast.net&level=0'
curl -X POST $SERVER/admin/register -d 'name=Paula&email=pgreco@franchihc.com&level=0'
curl -X POST $SERVER/admin/register -d 'name=Gregory&email=gregory.pillai@gmail.com'
curl -X POST $SERVER/admin/register -d 'name=Lidia&email=lidia.zambelli@tiscali.it'
