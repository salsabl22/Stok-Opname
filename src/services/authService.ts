import type { AuthUser, LoginCredentials } from "../types/auth";

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  await simulateNetworkDelay();

  const isValid =
    credentials.username.trim().length > 0 && credentials.password.length >= 6;

  if (!isValid) {
    throw new Error(
      "Akun tidak valid. Periksa kembali username dan password kamu."
    );
  }

  return {
    id: "usr-001",
    name: "Andi Saputra",
    username: credentials.username,
    email: "andi.saputra@crewflow.id",
    role: "Admin Master",
    status: "Aktif",
  };
}

function simulateNetworkDelay(ms = 700) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}