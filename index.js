const app = require("./app"),
   { PORT } = process.env;

app.listen(PORT, () => {
   console.log(`Todos r' Up in port: ${PORT}`);
});