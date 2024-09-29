import MagicLoginStrategy from "passport-magic-login";
import { prisma } from "../../lib";
import passport from "passport";
import { sendMagicLinkMail, subscribeToEvents } from "../../utils/email";

const magicLogin: MagicLoginStrategy = new MagicLoginStrategy({
  secret: process.env.SECRET || "",
  callbackUrl: "/auth/magiclogin/callback",
  
  sendMagicLink: async (destination: string, href: string, verificationCode: string, req) => {
    try {
      const callbackUrl = `${req.protocol}://${req.get("host")}${href}`;
      const { client, device, time, date } = req.body;

      // Sending magic link email
      const result = await sendMagicLinkMail(callbackUrl, destination, client, device, time, date);

      // Log result in case of failure or for future debugging
      console.log("Magic link sent to:", destination, "with result:", result);
    } catch (error) {
      console.error("Error sending magic link:", error);
    }
  },

  verify: async (payload: any, verifyCallback: (error: any, user?: any) => void, req) => {
    try {
      const { destination, username } = payload;

      // Check if the user already exists
      let user = await prisma.user.findUnique({
        where: { email: destination },
      });

      // If the user does not exist, create a new one
      if (!user) {
        user = await prisma.user.create({
          data: { email: destination, name: username },
        });
        console.log("New user created:", user.id);

        // Subscribe the user to events (assuming this is a necessary step)
        await subscribeToEvents(destination);
      }

      // Call verifyCallback with the user data
      verifyCallback(null, { username, destination, id: user?.id });
    } catch (error) {
      console.error("Error during verification:", error);
      verifyCallback(error);
    }
  },

  jwtOptions: {
    expiresIn: "2 days",
  },
});

passport.use(magicLogin);

export { magicLogin };
