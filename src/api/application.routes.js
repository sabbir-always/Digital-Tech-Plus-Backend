import express from "express";
import * as authentication from "#/controllers/authentication.controller.js";
import * as categories from "#/controllers/categories.controller.js";
import * as services from "#/controllers/services.controller.js";
import * as teams from "#/controllers/teams.controller.js";
import * as packages from "#/controllers/packages.controller.js";
import * as reviews from "#/controllers/reviews.controller.js";
import * as orders from "#/controllers/orders.controller.js";
import * as appointments from "#/controllers/appointment.controller.js";
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

// Private routes || http://localhost:8000/api/v1/packages/create
routes.post("/packages/create", packages.create)
routes.get("/packages/show", packages.show)
routes.get("/packages/indv/:id", packages.indvidual)
routes.put("/packages/update/:id", packages.update)
routes.delete("/packages/delete/:id", packages.destroy)

// Private routes || http://localhost:8000/api/v1/reviews/create
routes.post("/reviews/create", reviews.create)
routes.get("/reviews/show", reviews.show)
routes.get("/reviews/indv/:id", reviews.indvidual)
routes.put("/reviews/update/:id", reviews.update)
routes.delete("/reviews/delete/:id", reviews.destroy)

// Private routes || http://localhost:8000/api/v1/orders/create
routes.post("/orders/create", orders.create)
routes.get("/orders/show", orders.show)
routes.get("/orders/indv/:id", orders.indvidual)
routes.put("/orders/update/:id", orders.update)
routes.delete("/orders/delete/:id", orders.destroy)

// Private routes || http://localhost:8000/api/v1/appointments/create
routes.post("/appointments/create", appointments.create)
routes.get("/appointments/show", appointments.show)
routes.get("/appointments/indv/:id", appointments.indvidual)
routes.put("/appointments/update/:id", appointments.update)
routes.delete("/appointments/delete/:id", appointments.destroy)


export default routes;