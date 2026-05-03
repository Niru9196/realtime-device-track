const express = requires("express");
const app = express();

app.get("/", (req,res) => {
    res.send("Hey");
});

app.listen(3000);