(function() {

  exports.index = function(req, res) {
    return res.render("index", {
      title: "Polypong"
    });
  };

  exports.about = function(req, res) {
    return res.render("about", {
      title: "About"
    });
  };

}).call(this);
