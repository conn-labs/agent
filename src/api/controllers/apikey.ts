import { prisma } from "../../lib"; // Adjust the path to your prisma client

/**
 * Finds a user by their email in the database.
 * @param email - The email of the user to find.
 * @returns The user object if found, or null if not.
 */
export const findUserByEmail = async (email: string) => {
  try {
    // Find a user by their email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Return the found user or null if not found
    return user;
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw new Error("Failed to find user.");
  }
};
