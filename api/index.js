import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import chalk from "chalk";
import cors from "cors";
import serverless from "serverless-http";
import compression from "compression";
import application_api from "#/api/application.routes.js";
import { databaseConnect } from "#/config/database.config.js";
import { compressionConfig, corsConfiguration } from "#/utils/common.utils.js";

dotenv.config();
const PORT = process.env.SERVER_PORT || 5000;

const app = express();
app.use(cors(corsConfiguration));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression(compressionConfig));

app.use(morgan("dev"));
await databaseConnect()

app.use("/api/v1", application_api);
app.get("/", (req, res) => { res.send("Server Running Success!") })

app.use((err, req, res, next) => {
    console.error(chalk.bgRed.white.bold(err.message));
    res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

// app.listen(PORT, () => {
//     console.log(chalk.bgWhite.bold(`Server is running at http://localhost:${PORT}`));
// })

export default serverless(app);