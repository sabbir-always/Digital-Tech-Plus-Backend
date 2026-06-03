import express from "express";
import * as authentication from "#/controllers/authentication.controller.js";
import * as categories from "#/controllers/categories.controller.js";
import { isSignin } from "#/middlewares/auth.middleware.js";
const routes = express.Router();

// Public routes || http://localhost:8000/api/v1/authentication/create
routes.post("/authentication/create", authentication.create)
routes.post("/authentication/signin", authentication.signin)
routes.get("/authentication/show", authentication.show)
routes.get("/authentication/indv/:id", authentication.single)
routes.put("/authentication/update/:id", authentication.update)
routes.delete("/authentication/delete/:id", authentication.destroy)
routes.put("/authentication/change-password", isSignin, authentication.change_password)

// Private routes || http://localhost:8000/api/v1/categories/create
routes.post("/categories/create", categories.create)
routes.get("/categories/show", categories.show)
routes.get("/categories/indv/:id", categories.indvidual)
routes.put("/categories/update/:id", categories.update)
routes.delete("/categories/delete/:id", categories.destroy)

export default routes;