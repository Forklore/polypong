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

  exports.loginPage = function(req, res) {
    return res.render("login", {
      title: "Log in"
    });
  };

  exports.loginAction = function(req, res) {
    console.log("Tried to log in");
    console.log("login: " + req.body.login);
    console.log("login: " + req.body.password);
    return res.render("index", {
      title: "Polypong"
    });
  };

}).call(this);