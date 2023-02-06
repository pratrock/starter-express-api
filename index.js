const express = require("express");
const app = express();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.post("/stripe/charge", cors(), async (req, res) => {
  console.log("stripe-routes.js 9 | route reached", req.body);
  let { total, payment_method_id, email, name } = req.body;
  // let customerDetail = await stripe.customers.list({ email: email });
  let customerDetail = await stripe.customers.list();
  customerDetail = customerDetail.data.filter(
    (element) => element.email === email
  );
  customerDetail = customerDetail[0];
  console.log(customerDetail);
  /*  let customer = await stripe.customers.create({
    email,
    name,
    payment_method: payment_method_id,
    invoice_settings: {
      default_payment_method: payment_method_id,
    },
  }); */
  var customer, customerId;
  if (customerDetail === undefined) {
    customer = await stripe.customers.create({
      email,
      name,
      payment_method: payment_method_id,
      invoice_settings: {
        default_payment_method: payment_method_id,
      },
    });
  } else {
    customer = customerDetail;
    customerId = customer.id;
  }
  console.log(
    "stripe-routes.js 10 | amount and id",
    total,
    payment_method_id,
    customer
  );
  try {
    const payment = await stripe.paymentIntents.create({
      amount: total,
      currency: "USD",
      customer: customer.id,
      payment_method: payment_method_id,
      receipt_email: email,
      confirm: true,
    });
    /* 
    const product = await stripe.products.create({
      name: req.body.product[0],
    });
    const price = await stripe.prices.create({
      unit_amount: total,
      currency: "usd",
      product: product.id,
    });

    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: "send_invoice",
      days_until_due: 30,
    }); 

    const invoiceItem = await stripe.invoiceItems.create({
      customer: customerId,
      price: price.id,
      invoice: invoice.id,
    });
    await stripe.invoices.sendInvoice(invoice.id);
    */
    console.log("stripe-routes.js 19 | payment", payment);
    res.json({
      message: "Payment Successful",
      success: true,
      data: payment,
    });
  } catch (error) {
    console.log("stripe-routes.js 17 | error", error);
    res.json({
      message: "Payment Failed",
      success: false,
    });
  }
});

app.listen(process.env.PORT || 8080, () => {
  console.log("Server started...");
});
