import { CATEGORIES } from "../../utils/constant.js";
import Category from "../models/category.model.js";

const seedCategories = async () => {
  try {
    const categories = [
      {
        name: CATEGORIES.ANTI_BIOTIC,
      },
      {
        name: CATEGORIES.ANAL_GESICS,
      },
      {
        name: CATEGORIES.CARDIAC,
      },
      {
        name: CATEGORIES.GASTRO,
      },
      {
        name: CATEGORIES.HERBAL,
      },
      {
        name: CATEGORIES.HOMEOPATHY,
      },
      {
        name: CATEGORIES.PARACETAMOL,
      },
      {
        name: CATEGORIES.RESPIRATORY,
      },
      {
        name: CATEGORIES.VITAMINS,
      },
    ];

    for (const category of categories) {
      await Category.updateOne(
        {
          name: category.name,
        },
        {
          $setOnInsert: category,
        },
        {
          upsert: true,
        },
      );
    }

    console.log("Category Seeded Successfully");
  } catch (error) {
    console.log("Error occur while seeding category", error);
  }
};
export default seedCategories;
