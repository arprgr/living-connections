# living-connections

Living Connections.  Video messaging for ordinary people.

## Getting started

Install node and npm.

Run npm install.

Install postgres database locally, run on default port (5432).

Create a "postgres" user.

Create PSQL databases "livconn" and "livconn_test".

Source the `devsetup` script.   (Do this whenever starting work on LC in a new console window.)

Run `sequelize db:migrate`

Run `sequelize db:seed:all`

To start the server: `node server`

To start the server in test mode: `NODE_ENV=test node server`

To run tests: `npm test`

## TODO for current version.

Message threading.

Improved video controls.

## TODO sooner

Scheduled reminders.

Show dates in client.

True Facebook integration.

## TODO later

Face-to-face conversations

Message drafts.

Message eager, incremental saving.

Port to React JS

Track asset views and message views.

Full differencing of action lists, animation, urgency.

Represent profile messages as types of message (for tracking).
