// api.js - ApiService

define([ "http" ], function(HttpMethod) {

  function makePostAnnouncement() {
    var PostAnnouncementMethod = new HttpMethod.PostForm()
      .addPathComponent("announcements")
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
        .setType(form.type)
        .execute();
    }
  }

  function makeUpdateAnnouncement() {
    var UpdateAnnouncementMethod = new HttpMethod.PutForm()
      .addPathComponent("announcements")
      .addPathParameter("id")
      .addQueryParameter("assetId")
      .addQueryParameter("startDate")
      .addQueryParameter("endDate")
      .addQueryParameter("type")
      .build();

    return function(form) {
      return new UpdateAnnouncementMethod()
        .setAssetId(form.assetId)
        .setStartDate(form.startDate)
        .setEndDate(form.endDate)
        .setType(form.type)
        .execute();
    }
  }

  function makePostGreeting() {
    var PostGreetingMethod = new HttpMethod.PostForm()
      .addPathComponent("messages")
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
      .addPathComponent("messages")
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
      .build();

    return function updateUser(form) {
      return new UpdateUserMethod()
        .setAssetId(form.assetId)
        .execute();
    }
  }

  function ApiService() {

    this.saveMethods = {
      "ann": {
        "cre": makePostAnnouncement(),
        "upd": makeUpdateAnnouncement()
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
    }
  }

  return ApiService;
});
