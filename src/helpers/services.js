const nodemailer = require("nodemailer"),
	{ errorHandler } = require("./error"),
	{ EMAIL_HOST, EMAIL_RECEIVER, EMAIL_PASSWORD } = process.env,
	transporter = nodemailer.createTransport({
		host: "Smtp.live.com",
		service: "Outlook",
		port: 587,
		secure: false,
		tls: {
			rejectUnauthorized: false
		},
		auth: {
			user: EMAIL_HOST,
			pass: EMAIL_PASSWORD
		}
	});

exports.sendMail = async (req, res, next) => {
	try {
		const { message: mailMessage } = req.body,
			{ user } = req.locals,
			mailOptions = {
				from: `"TodoDesktop👻" ${EMAIL_HOST}`,
				to: EMAIL_RECEIVER,
				subject: `Todo Desktop Bug Report, User: ${user.username}`,
				text: mailMessage
			};

		if (!mailMessage)
			throw errorHandler(422, "A message body is required to proceed");

		await transporter.sendMail(mailOptions);
		return res.status(200).json({ message: "Message sent successfully" });
	} catch (error) {
		if (!error.status) {
			error.status = 500;
			error.message = "Failed to send the message";
		}
		return next(error);
	}
};

module.exports = exports;
