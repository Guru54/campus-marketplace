const dbSetup = require("./setup/db");
const { createCollege, createVerifiedUser } = require("./setup/fixtures");
const adminService = require("../src/services/admin.service");
const listingService = require("../src/services/listing.service");
const Listing = require("../src/models/Listing");
const User = require("../src/models/User");

beforeAll(async () => {
  await dbSetup.connect();
});

afterEach(async () => {
  await dbSetup.clearDatabase();
});

afterAll(async () => {
  await dbSetup.closeDatabase();
});

describe("adminService.setBanStatus", () => {
  it("bans a user and records the reason", async () => {
    const college = await createCollege();
    const { user: admin } = await createVerifiedUser({
      college: college._id,
      role: "ADMIN",
    });
    const { user: target } = await createVerifiedUser({ college: college._id });

    const banned = await adminService.setBanStatus(
      target._id.toString(),
      true,
      "Spam listings",
      admin,
      "127.0.0.1",
    );

    expect(banned.isBanned).toBe(true);
    const fromDb = await User.findById(target._id).select("+bannedReason");
    expect(fromDb.bannedReason).toBe("Spam listings");
  });

  it("prevents an admin from banning themselves", async () => {
    const college = await createCollege();
    const { user: admin } = await createVerifiedUser({
      college: college._id,
      role: "ADMIN",
    });

    await expect(
      adminService.setBanStatus(
        admin._id.toString(),
        true,
        "test",
        admin,
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("prevents banning another admin", async () => {
    const college = await createCollege();
    const { user: admin } = await createVerifiedUser({
      college: college._id,
      role: "ADMIN",
    });
    const { user: otherAdmin } = await createVerifiedUser({
      college: college._id,
      role: "ADMIN",
    });

    await expect(
      adminService.setBanStatus(
        otherAdmin._id.toString(),
        true,
        "test",
        admin,
        "127.0.0.1",
      ),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("unbans a user and clears the reason", async () => {
    const college = await createCollege();
    const { user: admin } = await createVerifiedUser({
      college: college._id,
      role: "ADMIN",
    });
    const { user: target } = await createVerifiedUser({
      college: college._id,
      isBanned: true,
    });

    const unbanned = await adminService.setBanStatus(
      target._id.toString(),
      false,
      null,
      admin,
      "127.0.0.1",
    );

    expect(unbanned.isBanned).toBe(false);
    const fromDb = await User.findById(target._id).select("+bannedReason");
    expect(fromDb.bannedReason).toBeNull();
  });
});

describe("adminService.getUsers", () => {
  it("filters by college and by ban status", async () => {
    const collegeA = await createCollege({
      name: "College A",
      domain: "a.edu",
    });
    const collegeB = await createCollege({
      name: "College B",
      domain: "b.edu",
    });
    await createVerifiedUser({ college: collegeA._id, email: "u1@a.edu" });
    await createVerifiedUser({
      college: collegeA._id,
      email: "u2@a.edu",
      isBanned: true,
    });
    await createVerifiedUser({ college: collegeB._id, email: "u3@b.edu" });

    const resultA = await adminService.getUsers({
      college: collegeA._id.toString(),
    });
    expect(resultA.users).toHaveLength(2);

    const resultBanned = await adminService.getUsers({ isBanned: "true" });
    expect(resultBanned.users).toHaveLength(1);
    expect(resultBanned.users[0].email).toBe("u2@a.edu");
  });
});

describe("listing moderation — cross-college admin delete", () => {
  it("lets an admin delete a listing from a DIFFERENT college", async () => {
    const collegeA = await createCollege({
      name: "College A",
      domain: "a.edu",
    });
    const collegeB = await createCollege({
      name: "College B",
      domain: "b.edu",
    });
    const { user: admin } = await createVerifiedUser({
      college: collegeA._id,
      role: "ADMIN",
    });
    const { user: seller } = await createVerifiedUser({
      college: collegeB._id,
      email: "s@b.edu",
    });

    const listing = await Listing.create({
      title: "Desk Lamp",
      description: "Works fine",
      price: 200,
      category: "OTHER",
      condition: "GOOD",
      seller: seller._id,
      college: collegeB._id, // different college than the admin
      status: "ACTIVE",
    });

    const result = await listingService.deleteListing(
      listing._id,
      admin,
      "127.0.0.1",
    );
    expect(result.status).toBe("EXPIRED");
  });

  it("still blocks a regular user from deleting another college's listing", async () => {
    const collegeA = await createCollege({
      name: "College A",
      domain: "a.edu",
    });
    const collegeB = await createCollege({
      name: "College B",
      domain: "b.edu",
    });
    const { user: outsider } = await createVerifiedUser({
      college: collegeA._id,
      email: "o@a.edu",
    });
    const { user: seller } = await createVerifiedUser({
      college: collegeB._id,
      email: "s@b.edu",
    });

    const listing = await Listing.create({
      title: "Desk Lamp",
      description: "Works fine",
      price: 200,
      category: "OTHER",
      condition: "GOOD",
      seller: seller._id,
      college: collegeB._id,
      status: "ACTIVE",
    });

    await expect(
      listingService.deleteListing(listing._id, outsider, "127.0.0.1"),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("adminService.getAuditLogs", () => {
  it("records and retrieves a ban action", async () => {
    const college = await createCollege();
    const { user: admin } = await createVerifiedUser({
      college: college._id,
      role: "ADMIN",
    });
    const { user: target } = await createVerifiedUser({ college: college._id });

    await adminService.setBanStatus(
      target._id.toString(),
      true,
      "test",
      admin,
      "127.0.0.1",
    );

    const { logs } = await adminService.getAuditLogs({ action: "USER_BANNED" });
    expect(logs).toHaveLength(1);
    expect(logs[0].user._id.toString()).toBe(admin._id.toString());
  });
});
