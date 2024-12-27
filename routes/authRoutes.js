import { User } from '../models/User.js';
import { Router } from 'express';
import axios from 'axios'
import jwt from 'jsonwebtoken'

const router = Router();

const fast2sms_auth = process.env.FAST2SMS_AUTH;

const jwt_secret = process.env.JWT_SECRET;

console.log(fast2sms_auth, jwt_secret)

// Generate and send OTP
router.post('/signin/send-otp', async (req, res) => {
    const { phone } = req.body;
    try {
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ message: 'No user found, kindly signup' });
        }
        if(user.isLoggedIn){
            return res.status(403).send({message:"User already has and active login"})
        }
        if(!user.isRegistered){

           return res.status(409).send({message: "User registeration not complete"})
            
        }
        const token = user.token;
        await jwt.verify(token, jwt_secret, async (err, decoded) => {
            if (err) {
                try {
                    console.error("Verification failed:", err.message);
                    //send otp further
                    const otp = Math.floor(100000 + Math.random() * 900000).toString();
                    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

                    user.otp = otp;
                    user.otpExpiresAt = otpExpiresAt;

                    await axios.get(`https://www.fast2sms.com/dev/bulkV2`, {
                        params: {
                            authorization: fast2sms_auth,
                            route: 'otp',
                            variables_values: otp,
                            flash: 0,
                            numbers: phone,
                        },
                    });
                    await user.save();
                    return res.status(200).json({ message: 'OTP sent successfully!', user });
                } catch (error) {

                    console.log("Error", error)
                    return res.status(500).send('Error during OTP generation or sending:')

                }
            } else {
                console.log("Decoded Payload:", decoded);
                // login
                user.isLoggedIn = true;
                await user.save()
                return res.status(200).json({ message: "Valid Token", user })
            }
        });
    } catch (err) {
        console.error('Other error:', err);
        return res.status(500).json({ message: 'Internal server error.', error: err.message });
    }
});


router.post('/signup/send-otp', async (req, res) => {
    const { firstName, lastName, phone, isKitchen, kitchenId, kitchenName } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

    console.log(otp)

    let user = await User.findOne({ phone });

    if (user) {
        return res.status(409).send({ message: 'User with this phone number exists, kindly sign in.' });
    }

    // Create a new user with OTP
    user = new User({
        firstName,
        lastName,
        phone,
        otp,
        token: "empty",
        isLoggedIn: false,
        otpExpiresAt,
        isRegistered: false,
        isKitchen, 
        kitchenId, 
        kitchenName
    });

    await user.save();

    try {
        const response = await axios.get(`https://www.fast2sms.com/dev/bulkV2?authorization=${fast2sms_auth}&route=otp&variables_values=${otp}&flash=0&numbers=${phone}&schedule_time=`)
        res.status(200).send('OTP sent successfully!');
    } catch (err) {
        res.status(500).send('Failed to send OTP.');
    }
})

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { phone, otp } = req.body;
    console.log(req.body)
    const user = await User.findOne({ phone });

    if (!user || user.otp !== otp || new Date() > user.otpExpiresAt) {
        return res.status(400).send('Invalid or expired OTP');
    }

    try {
        // Generate JWT
        const token = jwt.sign({ phone }, process.env.JWT_SECRET, { expiresIn: '1d' });
        user.token = token;
        if(!user.isRegistered){
            user.isRegistered = true;
        }
        if(user.isRegistered){
            user.isLoggedIn = true;
        }
        await user.save()
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).send({ message: "Something went wrong at the server" })
    }
});

router.post("/logout", async (req, res) => {
    const { phone } = req.body;
    const user = await User.findOne({ phone })
    try {

        user.isLoggedIn = false;
        await user.save()
        res.status(200).send({ message: "User logged out successfully" })

    } catch (error) {

        res.status(500).send({ message: "Server side error" })

    }
})

router.post('/resend-otp', async (req, res) => {

    const { phone } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

    console.log(otp)

    let user = await User.findOne({ phone });

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save()
    res.status(201).send({ message: "New otp sent", otp })

})

// Get user info
router.get('/user', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const jwt_secret = process.env.JWT_SECRET;
    if (!token) return res.status(401).send('Unauthorized');

    try {
        const decoded = jwt.verify(token, jwt_secret);
        res.json({ phone: decoded.phone });
    } catch {
        res.status(401).send('Invalid token');
    }
});




export default router;