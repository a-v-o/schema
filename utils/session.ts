import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Payload = {
  email: string;
  // expires: Date;
};

const key = new TextEncoder().encode(process.env.TOKEN_SECRET);

const cookie = {
  name: "session",
  options: { httpOnly: true, secure: true, path: "/" },
  // duration: 24 * 60 * 60 * 1000,
};

export async function encrypt(payload: Payload) {
  return (
    new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      // .setExpirationTime("1day")
      .sign(key)
  );
}

export async function decrypt(session: string | undefined) {
  try {
    const { payload } = await jwtVerify(session as string, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (err) {
    return err;
  }
}

export async function createSession(email: string) {
  // const expires = new Date(Date.now() + cookie.duration);
  const session = await encrypt({ email });

  (await cookies()).set(cookie.name, session, {
    ...cookie.options,
    sameSite: "lax",
    // expires,
  });

  redirect("/");
}

export async function verifySession() {
  const session = (await cookies()).get("session")?.value as string;
  const payload = (await decrypt(session)) as Payload;
  if (!payload?.email) {
    redirect("/login");
  }
  return { email: payload.email };
}

export async function deleteSession() {
  (await cookies()).delete("session");
  redirect("/login");
}
