'use strict';

const config = require('../../config');
const stripe = require('stripe')(config.stripe.secretKey, {
  apiVersion: config.stripe.apiVersion || '2022-08-01',
});
const express = require('express');
const router = express.Router();

/**
 * POST /api/payment
 *
 * Create a payment with the corresponding parameters.
 */
router.post('/payment', async (req, res, next) => {
  // let address = {
  //   line1: 'default',
  //   city: 'US',
  //   state: 'US',
  //   country: 'US',
  //   postal_code: 0,
  // };

  const {address, name, amount, token_id} = req.body;

  const customer = stripe.customers
    .create({
      email: email,
      source: token_id,
      name: name,
      address: address,
    })
    .then((customer) => {
      console.log(customer);
      return stripe.charges.create({
        amount: parseInt(amount) * 100,
        description: 'Rocket Rides Payment',
        currency: 'USD',
        customer: customer.id,
      });
    })
    .then(async (charge) => {
      console.log(charge);
      return res.status(200).json({
        code: 200,
        success: true,
        message: `Payment successful`,
        data: charge,
      });
    })
    .catch(async (err) => {
      return res.status(200).json({
        code: 2000,
        success: false,
        message: err.raw ? err.raw.message : `Payment failed`,
        err: err,
      });
    });
});

// Endpoint to create a connected account
router.post('/create-account', async (req, res) => {
  try {
    // const account = await stripe.accounts.create({
    //   type: 'express',
    //   country: 'US', // Change this as needed
    //   email: req.body.email,
    // });
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // Adjust as needed
      email: req.body.email,
      business_type: 'individual', // or 'company'
      individual: {
        first_name: 'John',
        last_name: 'Doe',
        email: req.body.email,
        phone: '555-555-5555',
        dob: {
          day: 1,
          month: 1,
          year: 1990,
        },
        address: {
          line1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94105',
          country: 'US',
        },
        ssn_last_4: '1234', // Last 4 digits of SSN (if applicable)
      },
      bank_account: {
        country: 'US',
        currency: 'usd',
        account_holder_name: 'John Doe',
        account_holder_type: 'individual',
        routing_number: '110000000',
        account_number: '000123456789',
      },
    });

    res.json(account);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Endpoint to create a payout
router.post('/create-payout', async (req, res) => {
  const {accountId, amount, currency} = req.body;

  try {
    const payout = await stripe.payouts.create(
      {
        amount: amount, // Amount in cents
        currency: currency,
      },
      {
        stripeAccount: accountId, // Connected account ID
      }
    );
    res.json(payout);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
