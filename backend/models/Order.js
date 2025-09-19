// Order model: sản phẩm, số lượng, ...

const userSchema = new mongoose.Schema({
       history: [
            {
                status: { type: String, required: true },
                updatedAt: { type: Date, default: Date.now },
            },
        ],
    }
)