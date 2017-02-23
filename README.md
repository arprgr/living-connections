# living-connections

Living Connections.  Video messaging for ordinary people.

## Getting started

Install node and npm.

Run npm install.

Install postgres database locally, run on default port (5432).

Source the devsetup script.

Run `sequelize db:migrate`

Run `sequelize db:seed:all`

To start the server: `node server`

To start the server in test mode: `NODE_ENV=test node server`

To run tests: `npm test`

## TODO for current version.

Make the invitation/ticketing process super-solid.

Make the facebook profile linkup super-solid.

Clean up the profile editor.
  - More instructions throughout.

Clean up the invitation editor.
  - Add a friend's name field (not saved in db)
  - More instructions at all points.
  - Don't allow backing up in process (unless updating).
  - Submit from video.
  - Allow resend of email message.

## TODO for later

Show dates in client.

Port to React Native.

Message threading.

Track asset views and message views.

Full differencing of action lists, animation, urgency.

Represent profile messages as types of message (for tracking).

Reminders

Face-to-face conversations

Drafts, eager save, save in chunks.

Address Facebook security issues.
