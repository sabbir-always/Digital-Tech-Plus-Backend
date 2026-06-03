import express from "express";
import * as authentication from "#/controllers/authentication.controller.js";
import * as categories from "#/controllers/categories.controller.js";
import * as services from "#/controllers/services.controller.js";
import * as teams from "#/controllers/teams.controller.js";
import { isSignin } from "#/middlewares/auth.middleware.js";
import upload from "#/multer/upload.multer.js";
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

// Private routes || http://localhost:8000/api/v1/services/create
routes.post("/services/create", upload.array("attachment"), services.create)
routes.get("/services/show", services.show)
routes.get("/services/indv/:id", services.indvidual)
routes.put("/services/update/:id", upload.array("attachment"), services.update)
routes.delete("/services/delete/:id", services.destroy)

// Private routes || http://localhost:8000/api/v1/teams/create
routes.post("/teams/create", upload.single("attachment"), teams.create)
routes.get("/teams/show", teams.show)
routes.get("/teams/indv/:id", teams.indvidual)
routes.put("/teams/update/:id", upload.single("attachment"), teams.update)
routes.delete("/teams/delete/:id", teams.destroy)


export default routes;