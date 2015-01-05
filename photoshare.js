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
  Meteor.subscribe("items");

  Meteor.startup(function () {
    var Components = {}

    Components.Item = React.createClass({
      displayName: "Item",
      render: function () {
        var model = this.props.data
          , selectedClass = Session.equals("currentItem", model._id) ? "selected" : ""
          , attrs = {
              className: "item " + selectedClass,
              onClick: this.handleClick
            }
          , img = React.DOM.img({src: model.image})
          , score = React.DOM.div({className: "score"}, model.score)
          , name = React.DOM.div({className: "name"}, "posted by ", model.user.name)
          , itemDiv = React.DOM.div(attrs, img, score, name)

        return React.DOM.div({className: "col-md-3 col-sm-4"}, itemDiv)
      },

      handleClick: function (event) {
        Session.set("currentItem", this.props.data._id);
      }
    });

    Components.Main = React.createClass({
      displayName: "Main",
      render: function () {
        var items = this.props.items.map(function (item) {
              return React.createElement(Components.Item, {
                key: item._id,
                data: item
              });
            })
          , addPhoto = Meteor.user() && React.DOM.form({
                onSubmit: this.addPhoto
              },
              React.DOM.input({
                type: "submit",
                className: "btn btn-primary",
                value: "Add a photo"
              })
            )
          , jumbotron = React.DOM.div({className: "jumbotron"},
              React.DOM.h1(null, "Share your photos"),
              addPhoto
            )
          , likeButton = Meteor.user() && React.DOM.button({
              className: "btn btn-secondary like",
              onClick: this.handleLike
            }, "+5 likes")
          , header = React.DOM.h1(null, "Popular Photos")
          , row = React.DOM.div({className: "row"}, items)

        return React.DOM.div({className: "container"},
                 jumbotron,
                 likeButton,
                 header,
                 row
               );
      },

      handleLike: function () {
        var id = Session.get("currentItem");
        Meteor.call("updateScore", id);
      },

      addPhoto: function (event) {
        event.preventDefault();

        MeteorCamera.getPicture(function (err, data) {
          if (!err) {
            Meteor.call("addPhoto", data);
          }
        });

        return false;
      }
    });

    var render = function() {
      var allItems = Items.find({}, {sort: {score: -1}});
      React.render(React.createElement(Components.Main, {
        items: allItems
      }), document.getElementById("main"));
    }

    Deps.autorun(render);
  });
}

if (Meteor.isServer) {
  Meteor.publish("items", function () {
    return Items.find();
  });
}
