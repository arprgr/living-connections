/* biz/facebook.js */

  // Get the current user if there is one, and if there is, get its FacebookProfile.

  // Get or create the FacebookProfile for this ID.

  // If the FacebookProfile is not already associated with a user...
    // If there's a logged in user and the logged in user does not have a FacebookProfile
      // Associate the new FacebookProfile with the logged in user.
    // Else if the FBProfile includes an email and there is an EmailProfile iwth that email...
      // Use that user.
    // Else...
      // Create a new user and associate the new FBProfile with the new user.

  // If the user associated with the FBProfile is not already logged in, log out and log in.
