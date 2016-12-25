// api.js - ApiService

define([ "http" ], function(HttpMethod) {

  function ApiService() {

    var schema = {
      announcements: {
        props: [ "assetId", "startDate", "endDate" ]
      },
      messages: {
        props: [ "assetId", "toUserId" ]
      },
      invites: {
        props: [ "assetId", "email" ]
      },
      reminders: {
        props: [ "assetId", "toUserId" ]
      }
    }

    for (var entityName in schema) {
      this[entityName] = (function(entityDesc) {
        function build(builderClass, isPut) {
          var builder = new builderClass()
            .addPathComponent(entityName);
          if (isPut) {
            builder.addPathParameter("id");
          }
          for (var i = 0; i < entityDesc.props.length; ++i) {
            builder.addQueryParameter(entityDesc.props[i]);
          }
          return builder.build();
        }
        return {
          post: build(HttpMethod.PostForm),
          put: build(HttpMethod.PutForm, true)
        }
      })(schema[entityName]);
    }
  }

  ApiService.prototype = {

    saveVideo: function(blob) {
      var self = this;
      if (!self.SaveVideoMethod) {
        self.SaveVideoMethod = new HttpMethod.PostBinary("video/webm")
          .addPathComponent("/assets")
          .build();
      }
      return new self.SaveVideoMethod()
        .setBody(blob)
        .execute();
    },

    postAnnouncement: function(params) {
      return new this.announcements.post()
        .setAssetId(params.assetId)
        .setStartDate(params.startDate)
        .setEndDate(params.endDate)
        .execute();
    },

    updateAnnouncement: function(params) {
      return new this.announcements.put()
        .setId(params.id)
        .setAssetId(params.assetId)
        .execute();
    },

    postGreeting: function(params) {
      return new this.messages.post()
        .setAssetId(params.assetId)
        .setToUserId(params.toUserId)
        .execute();
    },

    updateGreeting: function(params) {
      return new this.messages.put()
        .setId(params.id)
        .setAssetId(params.assetId)
        .setToUserId(params.toUserId)
        .execute();
    },

    postInvite: function(params) {
      return new this.invites.post()
        .setAssetId(params.assetId)
        .setEmail(params.email)
        .execute();
    },

    updateInvite: function(params) {
      return new this.invites.put()
        .setId(params.id)
        .setAssetId(params.assetId)
        .execute();
    },

    updateUser: function(params) {
      var self = this;
      if (!self.UpdateUserMethod) {
        self.UpdateUserMethod = new HttpMethod.PutForm()
          .addPathComponent("/users/-")
          .addQueryParameter("assetId")
          .build();
      }
      return new self.UpdateUserMethod()
        .setAssetId(params.assetId)
        .execute();
    }
  }

  return ApiService;
});
