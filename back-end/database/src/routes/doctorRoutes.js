import express from "express"
const router =express.Router();

import { userauthenticate } from "../middlewares/authenticate.js";
import { addDoctor } from "../controller/doctorController.js";


router.post("/add",userauthenticate,addDoctor)




export default router ;