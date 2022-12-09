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
  let customerDetail = await stripe.customers.list({ email: email });
  console.log(customerDetail);
  let customer;
  if (customerDetail.length == 0) {
    customer = await stripe.customers.create({
      email,
      name,
      payment_method: payment_method_id,
      invoice_settings: {
        default_payment_method: payment_method_id,
      },
    });
  } else {
    customer = customerDetail[0];
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
      customer,
      payment_method: payment_method_id,
      confirm: true,
    });
    console.log("stripe-routes.js 19 | payment", payment);
    res.json({
      message: "Payment Successful",
      success: true,
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
