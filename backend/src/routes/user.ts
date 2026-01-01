import { Router  } from "express";

import { signup , login  , getProfile} from "../controllers/user.js";
import authService from "../middleware/auth.js";

const UserRouter = Router();

//@ts-ignore
UserRouter.post("/signup" , signup);
//@ts-ignore
UserRouter.post("/login" , login);
//@ts-ignore
UserRouter.get("/profile" , authService , getProfile);

export default UserRouter;
