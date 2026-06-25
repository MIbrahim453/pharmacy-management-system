import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ["super_admin", "admin", "staff"],
        unique: true
    },
    description: {
        type: String,
        required: true
    }
})

const Role = mongoose.model("Role", roleSchema);

export default Role