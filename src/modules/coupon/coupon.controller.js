import moment from "moment";
import couponModel from "../../../DB/model/Coupon.model.js";
import userModel from "../../../DB/model/User.model.js";



export const createCoupon = async (req, res, next) => {
    const { code, fromDate, toDate, amount, usagePerUser } = req.body

    if (amount > 100) {
        return next(new Error('amount not valid (must be from 1 to 100)', { cause: 400 }))
    }
    if (await couponModel.findOne({ code: code.toLowerCase() })) {
        return next(new Error('please enter different coupon code', { cause: 400 }))
    }
    // usagePerUser:[ {userId , maxUsage} , { userId: , maxUsage}]
    let userIds = []
    for (const user of usagePerUser) {
        userIds.push(user.userId)
    }
    const findUsers = await userModel.find({ _id: { $in: userIds } })
    if (findUsers.length != usagePerUser.length) {
        return next(new Error('in-valid userIds', { cause: 400 }))

    }
    const fromDateMoment = moment(new Date(fromDate)).format('YYYY-MM-DD HH:mm')
    const toDateMoment = moment(new Date(toDate)).format('YYYY-MM-DD HH:mm')
    // const nowMoment = moment().format('YYYY-MM-DD HH:mm')

    if (
        // moment(fromDateMoment).isBefore(moment(nowMoment)) ||
        // moment(toDateMoment).isBefore(moment(nowMoment)) ||
        moment(toDateMoment).isBefore(moment(fromDateMoment))) {
        return next(new Error('please enter dates start from tomorrow', { cause: 400 }))
    }
    const coupon = await couponModel.create({
        code: code.toLowerCase(), fromDate: fromDateMoment, toDate: toDateMoment, amount, createdBy: req.user._id, usagePerUser
    })
    if (!coupon) {
        return next(new Error('please try to add coupon again', { cause: 400 }))
    }
    return res.status(201).json({ message: `Coupon Code ${code} added successfully` })
}

export const updateCoupon = async (req, res, next) => {
    const { couponId } = req.params
    const coupon = await couponModel.findById(couponId)
    if (!coupon) {
        return next(new Error('coupon not found', { cause: 400 }))
    }
    if (req.body.code) {
        if (coupon.code.toLowerCase() == req.body.code.toLowerCase()) {
            next(new Error('please enter different coupon code', { cause: 400 }))
        }
        if (await couponModel.findOne({ code: req.body.code.toLowerCase() })) {
            return next(new Error('Coupon Code already exist', { cause: 400 }))
        }
        coupon.code = req.body.code.toLowerCase()
    }
    if (req.body.amount) {
        if (req.body.amount > 100 || req.body.amount < 1) {
            return next(new Error('in-valid amount', { cause: 400 }))
        }
        coupon.amount = req.body.amount
    }

    if (req.body.fromDate) {
        if (moment(new Date(req.body.fromDate)).isBefore(moment())) {
            return next(new Error('please enter dates start from tomorrow', { cause: 400 }))
        }
        if (moment(new Date(req.body.fromDate)).isAfter(moment(coupon.toDate))) {
            return next(new Error('coupon cannot start after the expiration date', { cause: 400 }))
        }
        coupon.fromDate = moment(new Date(req.body.fromDate)).format('YYYY-MM-DD HH:mm')
    }

    if (req.body.toDate) {
        if (moment(new Date(req.body.toDate)).isBefore(moment())) {
            return next(new Error('please enter dates start from tomorrow', { cause: 400 }))
        }
        if (moment(new Date(req.body.toDate)).isBefore(moment(coupon.fromDate))) {
            return next(new Error('coupon cannot expired before the starting date', { cause: 400 }))
        }
        if (moment(new Date(req.body.toDate)).isSame(moment(coupon.fromDate))) {
            return next(new Error('coupon cannot start on same day of expiration', { cause: 400 }))
        }
        coupon.toDate = moment(new Date(req.body.toDate)).format('YYYY-MM-DD HH:mm')
    }
    if (!Object.keys(req.body).length) {
        return next(new Error('please enter the updated fields', { cause: 400 }))
    }
    coupon.updatedBy = req.user._id
    const savedCoupon = await coupon.save()
    return res.status(200).json({ message: "Done", savedCoupon })
}

export const validateCoupon = (coupon, userId) => {
    let expired = false
    let matched = false
    let exceed = false
    // expiration
    if (coupon.couponStatus == 'expired' ||
        moment(coupon.toDate).isBefore(moment())) {
        expired = true
    }
    // coupon not assgined
    for (const assginedUser of coupon.usagePerUser) {
        if (assginedUser.userId.toString() == userId.toString()) {
            matched = true
            // coupon exceed the maxUsage
            if (assginedUser.maxUsage <= assginedUser.usageCount) {
                exceed = true
            }
        }

    }

    return {
        matched, exceed, expired
    }
}
