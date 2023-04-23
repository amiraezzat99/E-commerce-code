import { Router } from "express";
import auth from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { createOrder } from "./order.controller.js";
const router = Router()




router.get('/', (req, res) => {
    res.status(200).json({ message: "order Module" })
})


router.post('/', auth(), asyncHandler(createOrder))

export default router