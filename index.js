import express from "express";
import cors from "cors";
import register_router from "./routers/register.js";
import login_router from "./routers/login.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(register_router);
app.use(login_router);

app.listen(3000);



