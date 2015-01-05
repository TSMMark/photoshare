Items = new Mongo.Collection("items");

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
      var item = Session.get("currentItem");
      Items.update(item, { $inc: {score: 5} });
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  });
}
