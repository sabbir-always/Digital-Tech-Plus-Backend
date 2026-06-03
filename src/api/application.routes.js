import express from "express";
import * as auth_controller from "#/controllers/authentication/authentication.controller.js";
import { isSignin } from "#/middlewares/auth.middleware.js";
const routes = express.Router();

// Public routes || http://localhost:8000/api/v1/polytechnic/institute/authentication/create
routes.post("/digital/tech/plus/authentication/create", auth_controller.create)
routes.post("/digital/tech/plus/authentication/signin", auth_controller.signin)
routes.get("/digital/tech/plus/authentication/show", auth_controller.show)
routes.get("/digital/tech/plus/authentication/indv/:id", auth_controller.single)
routes.put("/digital/tech/plus/authentication/update/:id", auth_controller.update)
routes.delete("/digital/tech/plus/authentication/delete/:id", auth_controller.destroy)
routes.put("/digital/tech/plus/authentication/change-password", isSignin, auth_controller.change_password)

// Private routes || http://localhost:8000/api/v1/polytechnic/institute/department/create


export default routes;