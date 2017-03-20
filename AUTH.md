# Living Connections

## Authentication

The following summarizes the current authentication scheme employed by the Living Connections server for
the benefit of developers looking to extend the API and write tests.

### Tickets

To log in as a normal user of Living Connections, you first need to acquire a ticket.  A ticket is an
email message containing a link to the LC site.  The URL contains a code that identifies the ticket. 
When you click on the link, the server looks for a User account associated with the email address that 
the ticket was sent to.  If there is none, the server creates a new User account.  Then the server 
logs in the user.  You may reuse a ticket any number of times, but the typical user is likely just to
stay logged in.

### Login

When a user is logged in, the server creates a Session object and sends the ID of the Session to the
client in a cookie.  The cookie is set to be long-lasting.  With subsequent calls to the server, the 
server looks up the Session by ID, verifies the associated User, and uses that User to determine
permission levels.

### Logout

Logout is accomplished by removing the Session object from the database.

### Admin

A User with level zero is considered an administrator and has access to certain protected functions.

### API

All Living Connections API methods require some User to be identified in the request.  Some API methods
require administrator level permissions.

### How to test

Testing the API requires a method for assuming the identity of a specific user.

At server startup time, the server generates a special code that may be used as a backdoor for testing.
This code is echoed to the console and written into the file `tmp/adminKey`.  If a request has an
x-access-key header with this value, then the server assigns a mock "superuser" to the request.  The
superuser has admin permissions.

  X-Access-Key: BW6twpcjiH40YfGL1aNq4N9K5Ave5DHb

The server allows any user with admin permissions to assume the identity of another user.  This 
is accomplished by setting the x-effective-user request header to the ID of the User.

  X-Effective-User: 1000

Some API functions require the User ID to be valid.  To create a User, POST a request as admin
to the /api/users endpoint.  The User info, including its ID, are returned as JSON.

### Implementation

The logic for managing login and logout may be found in `server/auth.js`.

The logic for issuing tickets is in `server/biz/admittance.js`.

Code that uses the backdoor key to gain admin access and to assume the identity of various users
appears in the test framework: `test/common/requestlc.js`.

The model type (and associated database table) that represents a ticket is called EmailSessionSeed.
(But will one day be renamed!)
