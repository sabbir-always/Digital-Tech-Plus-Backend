import express from "express";
import * as authentication from "#/controllers/authentication.controller.js";
import * as categories from "#/controllers/categories.controller.js";
import * as services from "#/controllers/services.controller.js";
import * as portfolio from "#/controllers/portfolio.controller.js";
import * as teams from "#/controllers/teams.controller.js";
import * as packages from "#/controllers/packages.controller.js";
import * as reviews from "#/controllers/reviews.controller.js";
import * as orders from "#/controllers/orders.controller.js";
import * as appointments from "#/controllers/appointment.controller.js";
import { isSignin, authorizeRoles } from "#/middlewares/auth.middleware.js";
import upload from "#/multer/upload.multer.js";
const routes = express.Router();

// Public routes || http://localhost:8000/api/v1/authentication/create
routes.post("/authentication/create", isSignin, authorizeRoles("superadmin"), authentication.create)
routes.post("/authentication/signin", authentication.signin)
routes.get("/authentication/show", isSignin, authorizeRoles("superadmin"), authentication.show)
routes.get("/authentication/indv/:id", isSignin, authorizeRoles("superadmin"), authentication.single)
routes.put("/authentication/update/:id", isSignin, authorizeRoles("superadmin"), authentication.update)
routes.delete("/authentication/delete/:id", isSignin, authorizeRoles("superadmin"), authentication.destroy)
routes.put("/authentication/change-password", isSignin, authorizeRoles("superadmin", "anonymous"), authentication.change_password)

// Private routes || http://localhost:8000/api/v1/categories/create
routes.post("/categories/create", isSignin, authorizeRoles("superadmin"), categories.create)
routes.get("/categories/show", isSignin, authorizeRoles("superadmin"), categories.show)
routes.get("/categories/indv/:id", isSignin, authorizeRoles("superadmin"), categories.indvidual)
routes.put("/categories/update/:id", isSignin, authorizeRoles("superadmin"), categories.update)
routes.delete("/categories/delete/:id", isSignin, authorizeRoles("superadmin"), categories.destroy)

// Private routes || http://localhost:8000/api/v1/services/create
routes.post("/services/create", isSignin, authorizeRoles("superadmin"), upload.array("attachment"), services.create)
routes.get("/services/show", isSignin, authorizeRoles("superadmin"), services.show)
routes.get("/services/show-data", services.show_data)
routes.get("/services/indv/:id", services.indvidual)
routes.put("/services/update/:id", isSignin, authorizeRoles("superadmin"), upload.array("attachment"), services.update)
routes.delete("/services/delete/:id", isSignin, authorizeRoles("superadmin"), services.destroy)

// Private routes || http://localhost:8000/api/v1/portfolio/create
routes.post("/portfolio/create", isSignin, authorizeRoles("superadmin"), upload.single("attachment"), portfolio.create)
routes.get("/portfolio/show", isSignin, authorizeRoles("superadmin"), portfolio.show)
routes.get("/portfolio/show-data", portfolio.show_data)
routes.get("/portfolio/indv/:id", isSignin, authorizeRoles("superadmin"), portfolio.indvidual)
routes.put("/portfolio/update/:id", isSignin, authorizeRoles("superadmin"), upload.single("attachment"), portfolio.update)
routes.delete("/portfolio/delete/:id", isSignin, authorizeRoles("superadmin"), portfolio.destroy)

// Private routes || http://localhost:8000/api/v1/teams/create
routes.post("/teams/create", isSignin, authorizeRoles("superadmin"), upload.single("attachment"), teams.create)
routes.get("/teams/show", isSignin, authorizeRoles("superadmin"), teams.show)
routes.get("/teams/show-data", teams.show_data)
routes.get("/teams/indv/:id", isSignin, authorizeRoles("superadmin"), teams.indvidual)
routes.put("/teams/update/:id", isSignin, authorizeRoles("superadmin"), upload.single("attachment"), teams.update)
routes.delete("/teams/delete/:id", isSignin, authorizeRoles("superadmin"), teams.destroy)

// Private routes || http://localhost:8000/api/v1/packages/create
routes.post("/packages/create", isSignin, authorizeRoles("superadmin"), packages.create)
routes.get("/packages/show", isSignin, authorizeRoles("superadmin"), packages.show)
routes.get("/packages/indv/:id", isSignin, authorizeRoles("superadmin"), packages.indvidual)
routes.put("/packages/update/:id", isSignin, authorizeRoles("superadmin"), packages.update)
routes.delete("/packages/delete/:id", isSignin, authorizeRoles("superadmin"), packages.destroy)

// Private routes || http://localhost:8000/api/v1/reviews/create
routes.post("/reviews/create", isSignin, authorizeRoles("superadmin", "anonymous"), reviews.create)
routes.get("/reviews/show", isSignin, authorizeRoles("superadmin"), reviews.show)
routes.get("/reviews/indv/:id", isSignin, authorizeRoles("superadmin"), reviews.indvidual)
routes.put("/reviews/update/:id", isSignin, authorizeRoles("superadmin", "anonymous"), reviews.update)
routes.delete("/reviews/delete/:id", isSignin, authorizeRoles("superadmin"), reviews.destroy)

// Private routes || http://localhost:8000/api/v1/orders/create
routes.post("/orders/service/:service_id/create", isSignin, authorizeRoles("superadmin", "anonymous"), orders.create)
routes.get("/orders/show", isSignin, authorizeRoles("superadmin"), orders.show)
routes.get("/orders/indv/:id", isSignin, authorizeRoles("superadmin"), orders.indvidual)
routes.put("/orders/service/:service_id/update/:id", isSignin, authorizeRoles("superadmin"), orders.update)
routes.delete("/orders/delete/:id", isSignin, authorizeRoles("superadmin"), orders.destroy)

// Private routes || http://localhost:8000/api/v1/appointments/create
routes.post("/appointments/create", appointments.create)
routes.get("/appointments/show", isSignin, authorizeRoles("superadmin"), appointments.show)
routes.get("/appointments/indv/:id", isSignin, authorizeRoles("superadmin"), appointments.indvidual)
routes.put("/appointments/update/:id", isSignin, authorizeRoles("superadmin"), appointments.update)
routes.delete("/appointments/delete/:id", isSignin, authorizeRoles("superadmin"), appointments.destroy)


export default routes;