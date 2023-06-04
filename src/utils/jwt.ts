import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../constants";

const isJwtExpired = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);

    const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds

    if (typeof decoded === "string" || decoded.exp === undefined) {
      return true;
    }

    return decoded.exp < currentTime;
  } catch (error) {
    return true; // Invalid JWT or signature mismatch
  }
};

export { isJwtExpired };
