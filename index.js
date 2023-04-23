import express from 'express'
import initApp from './src/utils/initiateApp.js'
import path from 'path'
import { config } from 'dotenv'
// import { createInvoice } from './src/utils/pdfkit.js'
config({ path: path.resolve('config/config.env') })

const app = express()

initApp(app, express)

// dummy data to generate the invoice
// const invoice = {
//     shipping: {
//         name: "John Doe",
//         address: "1234 Main Street",
//         city: "San Francisco",
//         state: "CA",
//         country: "US",
//         postal_code: 94111
//     },
//     items: [
//         {
//             item: "TC 100",
//             description: "Toner Cartridge",
//             quantity: 2,
//             amount: 6000
//         },
//         {
//             item: "USB_EXT",
//             description: "USB Cable Extender",
//             quantity: 1,
//             amount: 2000
//         }
//     ],
//     subtotal: 8000,
//     paid: 0,
//     invoice_nr: 1234
// };

// createInvoice(invoice, "invoice.pdf");
