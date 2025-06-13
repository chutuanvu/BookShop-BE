require('dotenv').config();
const moment = require('moment');
const request = require('request');
const crypto = require('crypto');

const taoDuongDanThanhToan = (req, res) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    try {
        // Extract request data
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

        // Read configuration from environment variables
        let tmnCode = process.env.VNP_TMNCODE;
        let secretKey = process.env.VNP_HASHSECRET;
        let paymentUrl = process.env.VNP_URL;

        // Use provided returnUrl or fallback to default
        let returnUrl = req.body.returnUrl;

        // Generate a unique order ID
        let orderId = moment(date).format('DDHHmmss');

        // Extract payment details from request
        let amount = req.body.amount;
        let bankCode = req.body.bankCode || '';
        let orderInfo = req.body.orderInfo || 'Thanh toan cho ma GD:' + orderId;

        // Validate required fields
        if (!amount) {
            return res.status(400).json({
                success: false,
                message: 'Amount is required',
            });
        }

        // Prepare VNPAY payment parameters
        let locale = 'vn';
        let currCode = 'VND';
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = 'billpayment';
        vnp_Params['vnp_Amount'] = Math.round(amount * 100); // Convert to smallest currency unit
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        // Sort parameters before signing
        vnp_Params = sortObject(vnp_Params);

        // Create signature
        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac('sha512', secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;

        // Build the complete payment URL
        const finalPaymentUrl = paymentUrl + '?' + querystring.stringify(vnp_Params, { encode: false });

        // Return the payment URL to the client
        res.json({
            success: true,
            paymentUrl: finalPaymentUrl,
            orderId: orderId,
        });
    } catch (error) {
        console.error('Payment URL creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment URL',
            error: error.message,
        });
    }
};

const truyVanThanhToan = (req, res) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    try {
        let date = new Date();

        // Extract VNPay configuration
        let vnp_TmnCode = process.env.VNP_TMNCODE;
        let secretKey = process.env.VNP_HASHSECRET;
        let vnp_Api = process.env.VNP_API;

        // Get transaction details from request
        let vnp_TxnRef = req.body.orderId;
        let vnp_TransactionDate = req.body.transDate;

        // Validate required fields
        if (!vnp_TxnRef || !vnp_TransactionDate) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and transaction date are required',
            });
        }

        // Generate request parameters
        let vnp_RequestId = moment(date).format('HHmmss');
        let vnp_Version = '2.1.0';
        let vnp_Command = 'querydr';
        let vnp_OrderInfo = 'Truy van GD ma:' + vnp_TxnRef;

        let vnp_IpAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

        let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');

        // Create signature data
        let data =
            vnp_RequestId +
            '|' +
            vnp_Version +
            '|' +
            vnp_Command +
            '|' +
            vnp_TmnCode +
            '|' +
            vnp_TxnRef +
            '|' +
            vnp_TransactionDate +
            '|' +
            vnp_CreateDate +
            '|' +
            vnp_IpAddr +
            '|' +
            vnp_OrderInfo;

        // Generate secure hash
        let hmac = crypto.createHmac('sha512', secretKey);
        let vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest('hex');

        // Create request object
        let dataObj = {
            vnp_RequestId: vnp_RequestId,
            vnp_Version: vnp_Version,
            vnp_Command: vnp_Command,
            vnp_TmnCode: vnp_TmnCode,
            vnp_TxnRef: vnp_TxnRef,
            vnp_OrderInfo: vnp_OrderInfo,
            vnp_TransactionDate: vnp_TransactionDate,
            vnp_CreateDate: vnp_CreateDate,
            vnp_IpAddr: vnp_IpAddr,
            vnp_SecureHash: vnp_SecureHash,
        };

        // Send request to VNPay API
        request(
            {
                url: vnp_Api,
                method: 'POST',
                json: true,
                body: dataObj,
            },
            function (error, response, body) {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: 'Error querying payment',
                        error: error.toString(),
                    });
                }

                return res.json({
                    success: true,
                    data: response.body || response,
                });
            },
        );
    } catch (error) {
        console.error('Payment query error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to query payment status',
            error: error.message,
        });
    }
};

// Helper function to verify VNPay callback parameters
const xacThucCallbackVNPay = (req, res) => {
    try {
        // Get the query parameters from the request
        const query = req.query;

        // Extract the secure hash from the parameters
        const secureHash = query.vnp_SecureHash;

        // Remove the secure hash from the query parameters
        delete query.vnp_SecureHash;
        delete query.vnp_SecureHashType;

        // Sort the remaining parameters
        const sortedQuery = sortObject(query);

        // Get the secret key from the environment variables
        const secretKey = process.env.VNP_HASHSECRET;

        // Create string to sign
        let querystring = require('qs');
        let signData = querystring.stringify(sortedQuery, { encode: false });

        // Create the signature
        let hmac = crypto.createHmac('sha512', secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        // Compare the signatures
        if (secureHash === signed) {
            // Return the payment details
            return res.json({
                success: true,
                message: 'Valid payment response',
                data: query,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid signature',
            });
        }
    } catch (error) {
        console.error('Payment callback verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying payment callback',
            error: error.message,
        });
    }
};

// Helper function to sort the object's keys
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
}

module.exports = {
    taoDuongDanThanhToan,
    truyVanThanhToan,
    xacThucCallbackVNPay,
};
