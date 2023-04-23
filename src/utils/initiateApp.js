
import chalk from 'chalk'
import morgan from 'morgan'
import connectDB from '../../DB/connection.js'
import * as Routers from '../index.router.js'
import { globalResponse } from './errorHandling.js'
import cors from 'cors'
const initApp = (app, express) => {
    const port = process.env.PORT || 5000
    // cors
    // app.use(cors()) // allow to all 
    const whiteList = ['http://127.0.0.1:5500', 'http://example1.com']
    // const corsOptions = {
    //     origin: function (origin, callback) {
    //         if (whiteList.indexOf(origin) !== -1) {
    //             callback(null, true)
    //         } else {
    //             callback(new Error('Not allowed by CORS'))
    //         }
    //     }
    // }
    // app.use(cors(corsOptions)) // this way accepted when the BE and FE are deployed on different servers
    //convert Buffer Data
    app.use(express.json({}))
    if (process.env.ENV_MODE == 'DEV') {
        app.use(cors())
        app.use(morgan('dev'))
    } else {
        app.use(async (req, res, next) => {
            if (!whiteList.includes(req.header('origin'))) {
                return next(new Error('not allowed by CORS policy', { cause: 400 }))
            }
            await res.header('Access-Control-Allow-Origin', '*')
            await res.header('Access-Control-Allow-Header', '*')
            await res.header('Access-Control-Allow-Private-Network', 'true') // private network
            await res.header('Access-Control-Allow-Method', '*') // allowed methods
            next()
        })
        app.use(morgan('combined'))
    }
    //connect to DB
    connectDB()
    //Setup API Routing 
    app.use(`/auth`, Routers.authRouter)
    app.use(`/user`, Routers.userRouter)
    app.use(`/product`, Routers.productRouter)
    app.use(`/category`, Routers.categoryRouter)
    app.use(`/subCategory`, Routers.subcategoryRouter)
    app.use(`/reviews`, Routers.reviewsRouter)
    app.use(`/coupon`, Routers.couponRouter)
    app.use(`/cart`, Routers.cartRouter)
    app.use(`/order`, Routers.orderRouter)
    app.use(`/brand`, Routers.branRouter)
    // in-valid routings
    app.all('*', (req, res, next) => {
        res.json("In-valid Routing Plz check url  or  method")
    })
    // fail reposne
    app.use(globalResponse)

    app.listen(port, () => console.log(chalk.blue.bgWhite.bold(`Example app listening on port ${port}!`)))

}


export default initApp