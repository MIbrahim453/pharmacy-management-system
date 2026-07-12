import { CATEGORIES } from "../../utils/constant.js";
import Category from "../models/category.model.js";

const seedCategories = async () => {
  try {
    const categories = Object.values(CATEGORIES).map((name) => ({ name }));

    for (const category of categories) {
      await Category.updateOne(
        { name: category.name },
        { $setOnInsert: category },
        { upsert: true }
      );
    }

    console.log("Categories seeded successfully");
  } catch (error) {
    console.error("Error while seeding categories:", error);
  }
};

export default seedCategories;