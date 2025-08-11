import { verifySession } from "./session";

export function generateCode(length: number) {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}