const createError = require('http-errors');
const UserModel = require('../../models/User');
const UserOTPVerification = require('../../models/UserOTPVerification');
const sendSMS = require('../../helpers/sendSMS');
const {
  signAccessToken,
  signRefreshToken,
} = require('../../helpers/jwtHelper');

class RegisterController {
  async handleRegister(req, res, next) { // eslint-disable-line
    const {
      name,
      familyName,
      phoneNumber,
      password,
    } = req.body;

    // check for duplicate usernames in the db
    const duplicateUser = await UserModel.findOne({
      phoneNumber,
    }).exec();
    if (duplicateUser) {
      res.status(409);
      createError.Conflict(`User with ${phoneNumber} already exists.`);
    }

    // If everything was okay and phoneNumber wasnt already in the db
    try {
      // Crete OTP
      const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

      // Store OTP in OTP db
      const userOTPRecord = await UserOTPVerification.create({
        otp,
        createdAt: Date.now(),
        expiredAt: Date.now() + 60 * 1000,
      });

      // console.log('otp', otp);

      // Now create and store the user in the db
      const user = await UserModel.create({
        name,
        familyName,
        phoneNumber,
        password,
        verificationId: userOTPRecord.id,
      });
      const userId = user._id.toString(); // eslint-disable-line no-underscore-dangle
      const accessToken = await signAccessToken(userId);
      const refreshToken = await signRefreshToken(userId);
      console.log('user.verificationId', user.verificationId);

      // Now send verification SMS
      const isOTPSent = await sendSMS(phoneNumber, `
          This is your verification code: ${otp}, Notice that it expires in 1 minute!
            `);

      const verificationId = userOTPRecord.id;
      if (isOTPSent) {
        console.log('otp', otp);
        console.log('verificationId', verificationId);

        return res
          .status(201)
          .send({
            message: 'OTP sent successfully',
            data: {
              verificationId,
              accessToken,
              refreshToken,
            },
          });
      }
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new RegisterController();