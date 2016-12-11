// api.js - ApiService

define([ "http" ], function(HttpMethod) {

  function ApiService(options) {

    var schema = {
      announcements: {
        id: "announcementId",
        props: [ "assetId" ]
      },
      greetings: {
        id: "greetingId",
        props: [ "assetId", "toUserId" ]
      },
      invites: {
        id: "inviteId",
        props: [ "assetId", "toAddress" ]
      },
      profiles: {
        id: "profileId",
        props: [ "assetId" ]
      }
    }

    for (var entityName in schema) {
      this[entityName] = (function(entityDesc) {
        function build(isUpdate) {
          var builder = new HttpMethod.Builder()
            .addPathComponent("api/1.0")
            .addPathComponent(entityName);
          if (isUpdate) {
            builder.addPathParameter(entityDesc.id);
          }
          for (var i = 0; i < entityDesc.props.length; ++i) {
            builder.addQueryParameter(entityDesc.props[i]);
          }
          return builder.build();
        }
        return {
          post: build(false),
          put: build(true)
        }
      })(schema[entityName]);
    }
  }

  ApiService.prototype = {

    postAnnouncement: function(params) {
      return new this.announcements.post()
        .setAssetId(params.assetId)
        .execute();
    },

    updateAnnouncement: function(params) {
      return new this.announcements.put()
        .setAnnouncementId(params.announcementId)
        .setAssetId(params.assetId)
        .execute();
    },

    postGreeting: function(params) {
      return new this.greetings.post()
        .setAssetId(params.assetId)
        .setToUserId(params.toUserId)
        .execute();
    },

    updateGreeting: function(params) {
      return new this.greetings.put()
        .setGreetingId(params.greetingId)
        .setAssetId(params.assetId)
        .setToUserId(params.toUserId)
        .execute();
    },

    postInvite: function(params) {
      return new this.invites.post()
        .setAssetId(params.assetId)
        .setToAddress(params.toAddress)
        .execute();
    },

    updateInvite: function(params) {
      return new this.invites.put()
        .setGreetingId(params.inviteId)
        .setAssetId(params.assetId)
        .setToAddress(params.toAddress)
        .execute();
    },

    postProfile: function(params) {
      return new this.profiles.post()
        .setAssetId(params.assetId)
        .execute();
    },

    updateProfile: function(params) {
      return new this.profiles.put()
        .setProfileId(params.profileId)
        .setAssetId(params.assetId)
        .execute();
    }
  }

  return ApiService;
});
