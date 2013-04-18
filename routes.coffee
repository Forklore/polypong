exports.index = (req, res) ->
  res.render "index", title: "Polypong"

exports.about = (req, res) ->
  res.render "about", title: "About"
