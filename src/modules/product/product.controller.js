import { nanoid } from "nanoid"
import slugify from "slugify"
import brandModel from "../../../DB/model/Brand.model.js"
import categoryModel from "../../../DB/model/Category.model.js"
import productModel from "../../../DB/model/Product.model.js"
import subCategoryModel from "../../../DB/model/Subcategory.model.js"
import cloudinary from "../../utils/cloudinary.js"

export const adProduct = async (req, res, next) => {
    // IDs
    const { categoryId, subCategoryId, brandId, name, price, discount } = req.body
    const Category = await categoryModel.findById(categoryId)
    const subCategory = await subCategoryModel.findOne({ _id: subCategoryId, categoryId })
    const brand = await brandModel.findOne({ _id: brandId, subCategoryId })
    if (!Category || !subCategory || !brand) {
        return next(new Error('in-valid ids', { cause: 400 }))
    }
    // createdBy
    req.body.createdBy = req.user._id
    // name
    req.body.slug = slugify(name, {
        replacment: '_',
        lower: true
    })

    // prices 
    // 500 * (1 - 0.25) =375
    req.body.priceAfterDiscount = price * (1 - ((discount || 0) / 100))


    // Images => { mainImage:[{}]  , subImages:[{}, {}]}
    // mainIamge
    const customId = nanoid(5)
    req.body.customId = customId
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
        folder: `${process.env.PROJECT_FOLDER}/Categories/${Category.customId}/SubCatgories/${subCategory.customId}/Brands/${brand.customId}/Products/${customId}`
    })
    req.body.mainImage = {
        path: secure_url,
        public_id
    }
    // subImages
    if (req.files.subImages) {
        req.body.subImgaes = []
        for (const file of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                folder: `${process.env.PROJECT_FOLDER}/Categories/${Category.customId}/SubCatgories/${subCategory.customId}/Brands/${brand.customId}/Products/${customId}`
            })
            req.body.subImgaes.push({
                path: secure_url,
                public_id
            })
        }
    }

    const product = await productModel.create(req.body)
    if (!product) {
        // destory, assginment
        return next(new Error('fail', { cause: 500 }))
    }
    return res.status(201).json({ message: "Done", product })

}

export const updateProduct = async (req, res, next) => {
    const { productId } = req.params
    const product = await productModel.findById(productId)
    if (!product) {
        return next(new Error('in-valid procustId', { cause: 400 }))
    }
    const { name, price, discount } = req.body
    //name 
    if (name) {
        req.body.slug = slugify(name, {
            replacment: '_',
            lower: true
        })
    }

    // price 
    if (price && discount) {
        req.body.priceAfterDiscount = price * (1 - ((discount) / 100))
        // } else if (price) {
        //     req.body.priceAfterDiscount = price * (1 - ((product.discount) / 100))
        // } else if (discount) {
        //     req.body.priceAfterDiscount = product.price * (1 - ((discount) / 100))
        // }
    } else if (price || discount) {
        req.body.priceAfterDiscount = (price || product.price) * (1 - ((discount || product.discount) / 100))
    }
    const Category = await categoryModel.findById(product.categoryId)
    const subCategory = await subCategoryModel.findOne({ _id: product.subCategoryId, categoryId: product.categoryId })
    const brand = await brandModel.findOne({ _id: product.brandId, subCategoryId: product.subCategoryId })
    // mainImage
    if (req.files?.mainImage?.length) {
        await cloudinary.uploader.destroy(product.mainImage.public_id)
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
            folder: `${process.env.PROJECT_FOLDER}/Categories/${Category.customId}/SubCatgories/${subCategory.customId}/Brands/${brand.customId}/Products/${product.customId}`
        })
        req.body.mainImage = {
            path: secure_url,
            public_id
        }
    }

    // subImages
    if (req.files?.subImages?.length) {
        req.body.subImgaes = []
        for (const file of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                folder: `${process.env.PROJECT_FOLDER}/Categories/${Category.customId}/SubCatgories/${subCategory.customId}/Brands/${brand.customId}/Products/${product.customId}`
            })
            req.body.subImgaes.push({
                path: secure_url,
                public_id
            })
        }
    }

    req.body.updatedBy = req.user._id
    const savedProduct = await productModel.findByIdAndUpdate(productId, req.body, { new: true })
    if (!savedProduct) {
        return next(new Error('in-valid procustId fail to update', { cause: 400 }))
    }
    res.status(200).json({ message: "Done", savedProduct })

}

