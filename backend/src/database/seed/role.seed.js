import { ROLES } from "../../utils/constant.js";
import Role from "../models/role.model.js";

const seedRoles = async () => {
  try {
    const roles = [
      {
        name: ROLES.SUPER_ADMIN,
        description: "Super Admin User",
      },
      {
        name: ROLES.ADMIN,
        description: "Admin User",
      },
      {
        name: ROLES.STAFF,
        description: "Staff User",
      },
    ];

    for (const role of roles) {
      await Role.updateOne(
        {
          name: role.name,
        },
        {
          $setOnInsert: role,
        },
        {
          upsert: true,
        },
      );
    }

    console.log("Role seeded Successfully");
  } catch (error) {
    console.log("Error occur while seeding role", error);
  }
};

export default seedRoles
