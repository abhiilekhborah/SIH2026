import db from "../config/db.js";
import { users, patientProfiles } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

export const addPatient = async (req, res, next) => {
  try {
    const {
      userId,
      bloodGroup,
      emergencyContactName,
      emergencyContactPhone,
      allergies,
      chronicConditions,
      abhaId,
      address,
      villageTown,
      district,
      state,
      pincode,
      name,
    } = req.body;

    // Check if user exists before linking patient profile
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found. Cannot create patient profile.",
      });
    }

    // Check if patient profile already exists for this user
    const existingPatient = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, userId));

    if (existingPatient.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Patient profile already exists for this user.",
      });
    }

    const patient = await db
      .insert(patientProfiles)
      .values({
        userId,
        bloodGroup,
        emergencyContactName,
        emergencyContactPhone,
        allergies: allergies || [],
        chronicConditions: chronicConditions || [],
        abhaId,
        address,
        villageTown,
        district,
        state,
        pincode,
        name,
      })
      .returning();

    return res.status(201).json({
      success: true,
      message: "Patient profile created successfully",
      patient: patient[0],
    });
  } catch (error) {
    next(error); // Pass error to global error handler
  }
};
