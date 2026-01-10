import { Router } from "express";

import { signup, login, getProfile } from "../controllers/user.js";
import authService from "../middleware/auth.js";

const UserRouter = Router();

UserRouter.post("/signup", signup);
UserRouter.post("/login", login);
UserRouter.get("/profile", authService, getProfile);

export default UserRouter;
