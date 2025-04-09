const connection = require("./database/connection");
const express = require("express");
const cors = require("cors");

//welcome message
console.log("prometheus online");

//checking the db connection
connection();

//server connection
const app = express();
const port = 3900;
//cors configuration
app.use(cors());

//parse data
app.use(express.json());
app.use(express.urlencoded({extended: true}));


//load routes
const userRoutes = require("./routes/user");
const publicationRoutes = require("./routes/publication");
const followsRoutes = require("./routes/follows");

app.use("/api/posts", publicationRoutes);
app.use("/api/user", userRoutes);
app.use("/api/follows", followsRoutes);

//server listening to requests
app.listen(port, () => {

    console.log("Prometheus is listening to the port: " + port);

})