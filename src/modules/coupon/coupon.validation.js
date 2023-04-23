import Joi from "joi";
import { generalFields } from "../../middleware/validation.js";


export const createCouponSchema = Joi.object({
    code: Joi.string().min(4).max(10).required().alphanum(),
    amount: Joi.number().required(),
    fromDate: Joi.date().greater(Date.now()).required(),
    toDate: Joi.date().greater(Date.now()).required(),
    usagePerUser: Joi.array().items(Joi.object({
        userId: generalFields.id,
        maxUsage: Joi.number().positive().integer().required()
    }).required()).required()
}).required()


export const updateCouponSchema = Joi.object({
    code: Joi.string().min(4).max(10).optional().alphanum(),
    amount: Joi.number().optional(),
    fromDate: Joi.string().optional(),
    toDate: Joi.string().optional(),
    couponId: generalFields.id.required()
}).required()