var express= require("express");
var bodyParser= require("body-parser");
var User= require("./models/user.js").User;
var cookieSession= require("cookie-session");
var router_app= require("./routes_app.js");
var session_middleware= require("./middlewares/session.js");
var methodOverride= require("method-override");
var formidable= require("express-formidable");
var app= express();

//app.use("/public", express.static("public"));
app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"))
app.use(formidable({
  encoding: 'utf-8',
  keepExtensions: true,
  multiples: true,
}));
//app.use(formidable({ keepExtensions: true, uploadDir:"images"}));
app.use(cookieSession({
  name: "session",
  keys: ["key-1", "key-2"]
}));

app.set("view engine", "jade");
app.get("/", function(req, res){
  console.log(req.session.user_id)
  res.render("index");
});
app.get("/signup", function(req, res){
  User.find(function(err, doc){
    //console.log(doc);
    res.render("signup");
  });
});
app.get("/login", function(req, res){
    res.render("login");
});
app.post("/users", function(req, res){
  var user = new User({email: req.body.email,
                      password: req.body.password,
                      password_confirmation: req.body.password_confirmation,
                      username: req.body.username
                    });
  user.save().then(function(us){ //Uso de las promesas
    res.send("We save your user");
  }, function(err){
    if (err) {
      console.log(String(err));
      res.send("Was an error saving!")
    }
  });
});

app.post("/sessions", function(req, res){
  User.findOne({email: req.body.email, password: req.body.password}, function(err, user){
    req.session.user_id= user._id;
    res.redirect("/app");
  });
});
app.use("/app", session_middleware);
app.use("/app", router_app);
app.listen(2525);
