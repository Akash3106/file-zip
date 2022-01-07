const express = require('express')

const fs = require('fs')

const path = require('path')

const admzip = require('adm-zip')

const multer = require('multer')

const app = express()

var dir = "public";
var subDirectory = "public/uploads";

app.use(express.static('public'))

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
  fs.mkdirSync(subDirectory);
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var maxSize = 10 * 1024 * 1024 
var compressfilesupload = multer({ storage: storage,limits:{fileSize:maxSize}});


app.get('/',(req, res) => {
  res.sendFile(__dirname + "/index.html")
})

app.use("/static", express.static('./static/'));

app.post('/compressfiles', compressfilesupload.array('file', 8), (req, res) => {
  
  const zip = new admzip()
  if (req.files) {
    req.files.forEach(file => {
      console.log(file.path)
      zip.addLocalFile(file.path)
    });
    var outputFilePath = Date.now() + "output.zip";
    fs.writeFileSync(outputFilePath, zip.toBuffer());
    res.download(outputFilePath,(err) => {
      if(err){
        req.files.forEach((file) => {
          fs.unlinkSync(file.path)
        });
        fs.unlinkSync(outputFilePath) 
      }

      req.files.forEach((file) => {
        fs.unlinkSync(file.path)
      });

      fs.unlinkSync(outputFilePath)
    })
  }
})


app.listen(process.env.PORT || 5000, () => {
  console.log(`App is listening on Port`);
});
