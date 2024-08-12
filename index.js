const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const app = express();
const port = 8000;
require("./config/db");
require("./config/passport-jwt")

app.use(express.json());
app.use(bodyParser.json());
app.use(fileUpload({
    useTempFiles: true
}));

app.use("/", require("./routes"))
app.listen(port, (err)=>{
    if(err){
        console.log("Error in listening the server", err);
    }
    console.log("Server is listening the port", port)
})