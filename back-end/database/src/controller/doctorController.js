import db from "../config/db.js";
import { users, doctorProfiles } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

export const addDoctor = async (req, res) => {
  try {
    // This comes from your authentication middleware
    // req.user is the row from the Supabase users table
    const userId = req.user.id;

    const {
      specialization,
      qualification,
      licenseNo,
      experienceYears,
      consultationModes,
      consultationFee,
      name
    } = req.body;

    const [doctor] = await db
      .insert(doctorProfiles)
      .values({
        userId: userId, // FK → users.id
        specialization,
        qualification,
        licenseNo,
        experienceYears,
        consultationModes,
        consultationFee,
        name
      })
      .returning();

    res.status(201).json({
      success: true,
      doctor
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create doctor profile"
    });
  }
};