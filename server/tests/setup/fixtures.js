const bcrypt = require("bcryptjs");
const College = require("../../src/models/College");
const User = require("../../src/models/User");

// Creates a test college. Domain matches the email used in test users
// below, since auth.service checks email domain against college.domain.
const createCollege = async (overrides = {}) =>
  College.create({
    name: "Test Institute of Technology",
    domain: "test.edu",
    city: "Indore",
    state: "MP",
    isActive: true,
    ...overrides,
  });

// Creates a verified, ready-to-login user directly (bypassing the
// register/OTP flow) — useful for tests that only care about login,
// chat, or other post-auth behaviour.
const createVerifiedUser = async ({
  college,
  password = "Password123",
  ...overrides
}) => {
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    firstName: "Test",
    lastName: "User",
    email: `user-${Date.now()}-${Math.random().toString(36).slice(2)}@test.edu`,
    password: hashedPassword,
    college,
    isVerified: true,
    ...overrides,
  });
  return { user, rawPassword: password };
};

module.exports = { createCollege, createVerifiedUser };
