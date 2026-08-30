import db from "../config/db.js";
import { users } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

export const registerUser = async (req, res, next) => {
  try {
    // Note: Clerk ID could also be added to the schema if needed. 
    // For now, we link by email since it's unique.
    const { phone, email, name, dob, gender, preferredLanguage, status } = req.body;

    // Check if email already exists
    if (email) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (existingUser.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }
    }

    // Insert user without password (Clerk handles authentication)
    const user = await db
      .insert(users)
      .values({
        phone,
        email,
        name,
        dob,
        gender,
        preferredLanguage,
        status,
      })
      .returning();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: user[0],
    });
  } catch (error) {
    next(error); // Pass error to global error handler
  }
};
