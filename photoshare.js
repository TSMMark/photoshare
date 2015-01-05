Items = new Mongo.Collection("items");

Meteor.methods({
  userSignedIn: function () {
    return !!this.userId;
  },

  updateScore: function (id) {
    if (Meteor.call("userSignedIn")) {
      Items.update(id, {$inc: {score: 5}});
    }
  },

  addPhoto: function (data) {
    if (Meteor.call("userSignedIn")) {
      Items.insert({
        image: data,
        user: {
          _id: Meteor.user()._id,
          name: Meteor.user().profile.name
        },
        score: 0
      });
    }
  }
});

if (Meteor.isClient) {
  Template.item.helpers({
    isSelected: function () {
      return Session.equals("currentItem", this._id) ?
               "selected" : "";
    }
  });

  Template.item.events({
    "click .item": function () {
      Session.set("currentItem", this._id);
    }
  });

  Template.main.helpers({
    items: function () {
      return Items.find({}, {sort: {score: -1}});
    }
  });

  Template.main.events({
    "click button.like": function () {
      var id = Session.get("currentItem");
      Meteor.call("updateScore", id);
    },

    "submit form": function (e) {
      e.preventDefault();

      MeteorCamera.getPicture(function (err, data) {
        if (!err) {
          Meteor.call("addPhoto", data);
        }
      });

      return false;
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  });
}
