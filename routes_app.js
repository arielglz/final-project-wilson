var express= require("express");
var photo= require("./models/images.js");
var image_finder_md= require("./middlewares/image_finder.js");
var router= express.Router();
var fs= require('fs');
var bodyParser= require("body-parser");
var app= express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


router.get("/", function(req, res){
  photo.find({})
    .populate("creator")
    .exec(function(err, images) {
      if(err) console.log(err);
      res.render("app/home", {images: images});
    })
});

router.get("/images/new", function(req, res){
  res.render("app/images/new");
});

router.all("/images/:id*", image_finder_md);

router.get("/images/:id/edit", function(req, res){
  res.render("app/images/edit");//porsiaca
});

router.route("/images/:id")
  .get(function(req, res){
    res.render("app/images/show");
  })
  .put(function(req, res){
    res.locals.image.title= req.body.title;//----
    res.locals.image.save(function(err){
      if(!err){
        res.render("app/images/show");
      }else{
        res.render("app/images/"+req.params.id+"/edit");
      }
    })
  })
  .delete(function(req, res){
    photo.findOneAndRemove({_id: req.params.id}, function(err){
      if(!err){
        res.redirect("/app/images");
      }else{
        console.log(err);
        res.redirect("/app/images/"+ req.params.id);
      }
    })
  })

router.route("/images/")
  .get(function(req, res){
    photo.find({creator: res.locals.user._id}, function(err, images){
      if(err){ res.redirect("/app"); return;}
      res.render("app/images/index", {images: images});
    });
  })
  .post(function(req, res){
    console.log(req.files.mielda_archivo);
    var extension= req.files.mielda_archivo.name.split(".").pop();
    var data= {
      title: req.fields.encabezado_titulo,
      creator: res.locals.user._id,
      extension: extension
    }
    var img= new photo(data);
    img.save(function(err){
      if (!err) {
        fs.rename(req.files.mielda_archivo.path, "public/images/" + img._id + "." + extension)
        res.redirect("/app/images/" + img._id)
      }else {
        //console.log('Este es el titulo klk');
        console.log(img.title);
        res.render(err);
      }
    });
  });

module.exports= router;
