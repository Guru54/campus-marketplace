// Mock the OTP email sender so tests never attempt a real SMTP call.
jest.mock("../src/utils/sendOtpEmail", () => jest.fn().mockResolvedValue());

const dbSetup = require("./setup/db");
const { createCollege, createVerifiedUser } = require("./setup/fixtures");
const authService = require("../src/services/auth.service");
const User = require("../src/models/User");
const AppError = require("../src/utils/AppError");
const sendOTPEmail = require("../src/utils/sendOtpEmail");

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret";
  await dbSetup.connect();
});

afterEach(async () => {
  await dbSetup.clearDatabase();
  jest.clearAllMocks();
});

afterAll(async () => {
  await dbSetup.closeDatabase();
});

describe("authService.register", () => {
  it("creates an unverified user and sends an OTP email", async () => {
    const college = await createCollege();

    const result = await authService.register(
      {
        firstName: "Priya",
        lastName: "Sharma",
        email: "priya@test.edu",
        password: "Password123",
        collegeId: college._id,
      },
      "127.0.0.1",
    );

    expect(result.userId).toBeDefined();
    expect(sendOTPEmail).toHaveBeenCalledTimes(1);

    const savedUser = await User.findById(result.userId).select("+otp");
    expect(savedUser.isVerified).toBe(false);
    // otp is now stored as a sha256 hash (64 hex chars), not the raw code
    expect(savedUser.otp).toHaveLength(64);

    // the raw 6-digit code is what actually gets emailed to the user
    const rawOtp = sendOTPEmail.mock.calls[0][2];
    expect(rawOtp).toMatch(/^\d{6}$/);
  });

  it("rejects an email whose domain doesn't match the college", async () => {
    const college = await createCollege();
    process.env.NODE_ENV = "production"; // domain check is skipped in "development"

    await expect(
      authService.register(
        {
          firstName: "Priya",
          lastName: "Sharma",
          email: "priya@gmail.com",
          password: "Password123",
          collegeId: college._id,
        },
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 400 });

    process.env.NODE_ENV = "test";
  });

  it("rejects registration against a nonexistent college", async () => {
    const fakeCollegeId = "64b64b64b64b64b64b64b64"; // valid ObjectId shape, no doc

    await expect(
      authService.register(
        {
          firstName: "Priya",
          lastName: "Sharma",
          email: "priya@test.edu",
          password: "Password123",
          collegeId: fakeCollegeId,
        },
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rejects re-registration of an already-verified email", async () => {
    const college = await createCollege();
    await createVerifiedUser({ college: college._id, email: "priya@test.edu" });

    await expect(
      authService.register(
        {
          firstName: "Priya",
          lastName: "Sharma",
          email: "priya@test.edu",
          password: "Password123",
          collegeId: college._id,
        },
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("resends OTP instead of erroring when the existing account is unverified", async () => {
    const college = await createCollege();
    const first = await authService.register(
      {
        firstName: "Priya",
        lastName: "Sharma",
        email: "priya@test.edu",
        password: "Password123",
        collegeId: college._id,
      },
      "127.0.0.1",
    );
    const firstUser = await User.findById(first.userId).select("+otp");

    const result = await authService.register(
      {
        firstName: "Priya",
        lastName: "Sharma",
        email: "priya@test.edu",
        password: "Password123",
        collegeId: college._id,
      },
      "127.0.0.1",
    );

    expect(result).toEqual({ resent: true });
    expect(sendOTPEmail).toHaveBeenCalledTimes(2);

    const updatedUser = await User.findById(first.userId).select("+otp");
    // A fresh OTP should have been generated (extremely unlikely to collide)
    expect(updatedUser.otp).not.toBe(firstUser.otp);
  });
});

describe("authService.verifyOTP", () => {
  const registerUser = async (college) =>
    authService.register(
      {
        firstName: "Priya",
        lastName: "Sharma",
        email: "priya@test.edu",
        password: "Password123",
        collegeId: college._id,
      },
      "127.0.0.1",
    );

  it("verifies with the correct OTP and returns a token", async () => {
    const college = await createCollege();
    const { userId } = await registerUser(college);
    // otp is stored as a hash now — the raw code is what gets emailed
    const rawOtp = sendOTPEmail.mock.calls[0][2];

    const result = await authService.verifyOTP(
      { email: "priya@test.edu", otp: rawOtp },
      "127.0.0.1",
    );

    expect(result.token).toEqual(expect.any(String));
    expect(result.user.email).toBe("priya@test.edu");

    const updated = await User.findById(userId);
    expect(updated.isVerified).toBe(true);
  });

  it("rejects an incorrect OTP", async () => {
    const college = await createCollege();
    await registerUser(college);

    await expect(
      authService.verifyOTP(
        { email: "priya@test.edu", otp: "000000" },
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("locks out OTP verification after 5 incorrect attempts", async () => {
    const college = await createCollege();
    await registerUser(college);

    for (let i = 0; i < 4; i++) {
      await expect(
        authService.verifyOTP(
          { email: "priya@test.edu", otp: "000000" },
          "127.0.0.1",
        ),
      ).rejects.toMatchObject({ statusCode: 400 });
    }

    // 5th wrong attempt should invalidate the OTP entirely (429)
    await expect(
      authService.verifyOTP(
        { email: "priya@test.edu", otp: "000000" },
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 429 });

    // Even the correct OTP should now fail, since it was cleared
    const rawOtp = sendOTPEmail.mock.calls[0][2];
    await expect(
      authService.verifyOTP(
        { email: "priya@test.edu", otp: rawOtp },
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rejects an expired OTP", async () => {
    const college = await createCollege();
    const { userId } = await registerUser(college);
    const user = await User.findById(userId).select("+otp +otpExpiry");
    user.otpExpiry = new Date(Date.now() - 60_000); // 1 minute in the past
    await user.save();

    await expect(
      authService.verifyOTP(
        { email: "priya@test.edu", otp: user.otp },
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("authService.resendOTP", () => {
  it("issues a fresh OTP for an unverified user", async () => {
    const college = await createCollege();
    const { userId } = await authService.register(
      {
        firstName: "Priya",
        lastName: "Sharma",
        email: "priya@test.edu",
        password: "Password123",
        collegeId: college._id,
      },
      "127.0.0.1",
    );
    const before = await User.findById(userId).select("+otp");

    const result = await authService.resendOTP(
      { email: "priya@test.edu" },
      "127.0.0.1",
    );

    expect(result).toEqual({ resent: true });
    const after = await User.findById(userId).select("+otp");
    expect(after.otp).not.toBe(before.otp);
    expect(sendOTPEmail).toHaveBeenCalledTimes(2); // register + resend
  });

  it("rejects resend for an already-verified user", async () => {
    const college = await createCollege();
    await createVerifiedUser({ college: college._id, email: "priya@test.edu" });

    await expect(
      authService.resendOTP({ email: "priya@test.edu" }, "127.0.0.1"),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rejects resend for a nonexistent email", async () => {
    await expect(
      authService.resendOTP({ email: "nobody@test.edu" }, "127.0.0.1"),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("authService.forgotPassword + resetPassword", () => {
  it("returns the same generic message for a real and a fake email (no enumeration)", async () => {
    const college = await createCollege();
    await createVerifiedUser({ college: college._id, email: "priya@test.edu" });

    const realResult = await authService.forgotPassword(
      { email: "priya@test.edu" },
      "127.0.0.1",
    );
    const fakeResult = await authService.forgotPassword(
      { email: "nobody@test.edu" },
      "127.0.0.1",
    );

    expect(realResult).toEqual(fakeResult);
  });

  it("does not send an email for a nonexistent account", async () => {
    await authService.forgotPassword({ email: "nobody@test.edu" }, "127.0.0.1");
    expect(sendOTPEmail).not.toHaveBeenCalled();
  });

  it("resets the password with a valid OTP and invalidates the old token", async () => {
    const college = await createCollege();
    const { user } = await createVerifiedUser({
      college: college._id,
      email: "priya@test.edu",
    });
    const oldToken = require("jsonwebtoken").sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    await authService.forgotPassword({ email: "priya@test.edu" }, "127.0.0.1");
    const withOtp = await User.findOne({ email: "priya@test.edu" }).select(
      "+otp",
    );

    // Recover the plaintext OTP the same way sendOTPEmail received it:
    // the mock captured the call args, so pull it from there instead of
    // trying to reverse the hash.
    const otpArg = sendOTPEmail.mock.calls.at(-1)[2];

    const result = await authService.resetPassword(
      {
        email: "priya@test.edu",
        otp: otpArg,
        newPassword: "NewPassword456",
      },
      "127.0.0.1",
    );

    expect(result.token).toEqual(expect.any(String));

    // New password works
    const loginResult = await authService.login(
      { email: "priya@test.edu", password: "NewPassword456" },
      "127.0.0.1",
    );
    expect(loginResult.token).toEqual(expect.any(String));

    // Old password no longer works
    await expect(
      authService.login(
        { email: "priya@test.edu", password: "Password123" },
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 401 });

    // passwordChangedAt was set (used by authMiddleware to reject oldToken)
    const updated = await User.findById(user._id).select("+passwordChangedAt");
    const changedAtSeconds = Math.floor(
      updated.passwordChangedAt.getTime() / 1000,
    );
    const decodedOld = require("jsonwebtoken").decode(oldToken);
    expect(decodedOld.iat).toBeLessThanOrEqual(changedAtSeconds);
  });

  it("rejects an incorrect reset OTP", async () => {
    const college = await createCollege();
    await createVerifiedUser({ college: college._id, email: "priya@test.edu" });
    await authService.forgotPassword({ email: "priya@test.edu" }, "127.0.0.1");

    await expect(
      authService.resetPassword(
        {
          email: "priya@test.edu",
          otp: "000000",
          newPassword: "NewPassword456",
        },
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rejects reset when no reset was ever requested", async () => {
    const college = await createCollege();
    await createVerifiedUser({ college: college._id, email: "priya@test.edu" });

    await expect(
      authService.resetPassword(
        {
          email: "priya@test.edu",
          otp: "123456",
          newPassword: "NewPassword456",
        },
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("authService.login", () => {
  it("logs in successfully with correct credentials", async () => {
    const college = await createCollege();
    const { user, rawPassword } = await createVerifiedUser({
      college: college._id,
      email: "priya@test.edu",
    });

    const result = await authService.login(
      { email: "priya@test.edu", password: rawPassword },
      "127.0.0.1",
    );

    expect(result.token).toEqual(expect.any(String));
    expect(result.user._id.toString()).toBe(user._id.toString());
  });

  it("rejects an unverified account even with the correct password", async () => {
    const college = await createCollege();
    await createVerifiedUser({
      college: college._id,
      email: "priya@test.edu",
      isVerified: false,
    });

    await expect(
      authService.login(
        { email: "priya@test.edu", password: "Password123" },
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("increments loginAttempts on a wrong password", async () => {
    const college = await createCollege();
    await createVerifiedUser({ college: college._id, email: "priya@test.edu" });

    await expect(
      authService.login(
        { email: "priya@test.edu", password: "WrongPassword1" },
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 401 });

    const user = await User.findOne({ email: "priya@test.edu" }).select(
      "+loginAttempts",
    );
    expect(user.loginAttempts).toBe(1);
  });

  it("locks the account for 15 minutes after 5 failed attempts", async () => {
    const college = await createCollege();
    await createVerifiedUser({ college: college._id, email: "priya@test.edu" });

    for (let i = 0; i < 4; i++) {
      await expect(
        authService.login(
          { email: "priya@test.edu", password: "WrongPassword1" },
          "127.0.0.1",
        ),
      ).rejects.toMatchObject({ statusCode: 401 });
    }

    // 5th failed attempt should trip the lock (423 Locked)
    await expect(
      authService.login(
        { email: "priya@test.edu", password: "WrongPassword1" },
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 423 });

    // Even the CORRECT password should now be rejected while locked
    await expect(
      authService.login(
        { email: "priya@test.edu", password: "Password123" },
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 423 });

    const user = await User.findOne({ email: "priya@test.edu" }).select(
      "+lockUntil +loginAttempts",
    );
    expect(user.lockUntil).not.toBeNull();
    expect(user.loginAttempts).toBe(0); // reset when the lock was set
  });

  it("resets loginAttempts and lockUntil on a successful login", async () => {
    const college = await createCollege();
    const { rawPassword } = await createVerifiedUser({
      college: college._id,
      email: "priya@test.edu",
    });

    // One failed attempt first
    await expect(
      authService.login(
        { email: "priya@test.edu", password: "WrongPassword1" },
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 401 });

    // Then a correct login
    await authService.login(
      { email: "priya@test.edu", password: rawPassword },
      "127.0.0.1",
    );

    const user = await User.findOne({ email: "priya@test.edu" }).select(
      "+loginAttempts +lockUntil",
    );
    expect(user.loginAttempts).toBe(0);
    expect(user.lockUntil).toBeNull();
  });

  it("rejects login for a nonexistent email", async () => {
    await expect(
      authService.login(
        { email: "nobody@test.edu", password: "Password123" },
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});
