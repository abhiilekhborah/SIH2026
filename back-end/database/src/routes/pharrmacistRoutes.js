import express from "express";

import {
  createPharmacist,
  getMyPharmacistProfile,
  getPharmacist,
  updateMyPharmacistProfile,
  deleteMyPharmacistProfile,
} from "../controllers/pharmacist.controller.js";

import { userauthenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.post("/", userauthenticate, createPharmacist);

router.get("/me", userauthenticate, getMyPharmacistProfile);

router.get("/:id", getPharmacist);

router.put("/me", userauthenticate, updateMyPharmacistProfile);

router.delete("/me", userauthenticate, deleteMyPharmacistProfile);

export default router;