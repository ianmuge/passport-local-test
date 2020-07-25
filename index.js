const app= require("./app");
let PORT=process.env.PORT||5000;
app.listen(PORT, err => {
    if (err) {
        console.log(err);
        process.exit(1);
        return;
    }
    console.log(`Server listening on port: ${PORT}`);
});