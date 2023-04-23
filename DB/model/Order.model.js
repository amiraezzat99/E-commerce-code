
import mongoose, { Types } from "mongoose"

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [
        {
            productId: {
                type: Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            name: { type: String, required: true },
            productPrice: { type: Number, required: true },
            finalPrice: { type: Number, required: true },
        }
    ],
    subTotal: { type: Number, required: true, default: 0 },
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon"
    },
    address: { type: String, required: true },
    phone: [{ type: String, required: true }],
    totalPrice: { type: Number, required: true, default: 0 },

    paymentMethod: {
        type: String,
        required: true,
        enum: ['cash', 'card']
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['placed', 'pending', 'confirmed', 'on way', 'deliverd', 'cancelled', 'rejected', 'returned']
    },
    reason: String,
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
})


const orderModel = mongoose.models.order || mongoose.model('order', orderSchema)

export default orderModel

// refund