import app from "./app";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server has been started on PORT:", PORT);
});
