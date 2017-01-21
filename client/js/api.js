// api.js - ApiService

define([ "http" ], function(HttpMethod) {

  function makePostAnnouncement() {
    var PostAnnouncementMethod = new HttpMethod.PostForm()
      .addPathComponent("api/messages")
      .addQueryParameter("assetId")
      .addQueryParameter("startDate")
      .addQueryParameter("endDate")
      .addQueryParameter("type")
      .build();

    return function(form) {
      return new PostAnnouncementMethod()
        .setAssetId(form.assetId)
        .setStartDate(form.startDate)
        .setEndDate(form.endDate)
        .setType(form.type || 3)
        .execute();
    }
  }

  function makeUpdateAnnouncement() {
    var UpdateAnnouncementMethod = new HttpMethod.PutForm()
      .addPathComponent("api/messages")
      .addPathParameter("id")
      .addQueryParameter("assetId")
      .addQueryParameter("startDate")
      .addQueryParameter("endDate")
      .addQueryParameter("type")
      .build();

    return function(form) {
      return new UpdateAnnouncementMethod()
        .setId(form.id)
        .setAssetId(form.assetId)
        .setStartDate(form.startDate)
        .setEndDate(form.endDate)
        .setType(form.type)
        .execute();
    }
  }

  function makeDeleteAnnouncement() {
    var DeleteAnnouncementMethod = new HttpMethod.DeleteForm()
      .addPathComponent("api/messages")
      .addPathParameter("id");

    return function(form) {
      return new UpdateAnnouncementMethod()
        .setId(form.id)
        .execute();
    }
  }

  function makePostGreeting() {
    var PostGreetingMethod = new HttpMethod.PostForm()
      .addPathComponent("api/messages")
      .addQueryParameter("assetId")
      .addQueryParameter("toUserId")
      .build();

    return function(form) {
      return new PostGreetingMethod()
        .setAssetId(form.assetId)
        .setToUserId(form.toUserId)
        .execute();
    }
  }

  function makeUpdateGreeting() {
    var UpdateGreetingMethod = new HttpMethod.PutForm()
      .addPathComponent("api/messages")
      .addPathParameter("id")
      .addQueryParameter("assetId")
      .build();

    return function(form) {
      return new UpdateGreetingMethod()
        .setAssetId(form.assetId)
        .execute();
    }
  }

  function makePostInvite() {
    var PostInviteMethod = new HttpMethod.PostForm()
      .addPathComponent("invites")
      .addQueryParameter("assetId")
      .addQueryParameter("email")
      .build();

    return function(form) {
      return new PostInviteMethod()
        .setAssetId(form.assetId)
        .setEmail(form.email)
        .execute();
    }
  }

  function makeUpdateInvite() {
    var UpdateInviteMethod = new HttpMethod.PutForm()
      .addPathComponent("invites")
      .addPathParameter("id")
      .addQueryParameter("assetId")
      .addQueryParameter("email")
      .build();

    return function(form) {
      return new UpdateInviteMethod()
        .setAssetId(form.assetId)
        .setEmail(form.email)
        .execute();
    }
  }

  function makeUpdateUser() {
    var UpdateUserMethod = new HttpMethod.PutForm()
      .addPathComponent("/users/-")
      .addQueryParameter("assetId")
      .addQueryParameter("name")
      .build();

    return function updateUser(form) {
      return new UpdateUserMethod()
        .setAssetId(form.assetId)
        .setName(form.name)
        .execute();
    }
  }

  function ApiService() {

    this.saveMethods = {
      "ann": {
        "cre": makePostAnnouncement(),
        "upd": makeUpdateAnnouncement(),
        "del": makeDeleteAnnouncement()
      },
      "gre": {
        "cre": makePostGreeting(),
        "upd": makeUpdateGreeting()
      },
      "inv": {
        "cre": makePostInvite(),
        "upd": makeUpdateInvite()
      },
      "pro": {
        "cre": makeUpdateUser(),
        "upd": makeUpdateUser()
      }
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

    saveForm: function(what, action, form) {
      return this.saveMethods[what][action](form);
    },

    addConnection: function(peerId) {
      var PostConnectionMethod = new HttpMethod.PostForm()
        .addPathComponent("connections")
        .addQueryParameter("peerId")
        .addQueryParameter("status")
        .build();

      return new PostConnectionMethod()
        .setPeerId(peerId)
        .execute();
    }
  }

  return ApiService;
});
