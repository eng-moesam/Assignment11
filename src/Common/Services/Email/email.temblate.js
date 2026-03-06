export const temblateEmail = (OTP_CODE)=>{ 
   return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f7f9fc;
            margin: 0;
            padding: 0;
        }
        .email-wrapper {
            width: 100%;
            background-color: #f7f9fc;
            padding: 40px 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .email-header {
            background-color: #1a73e8; 
            color: #ffffff;
            padding: 25px 20px;
            text-align: center;
        }
        .email-header h1 {
            margin: 0;
            font-size: 24px;
            letter-spacing: 1px;
        }
        .email-body {
            padding: 40px 30px;
            color: #333333;
            text-align: center;
        }
        .email-body h2 {
            margin-top: 0;
            font-size: 22px;
            color: #1a73e8;
        }
        .email-body p {
            font-size: 16px;
            line-height: 1.6;
            color: #555555;
        }
        .otp-box {
            background-color: #f1f8ff;
            border: 2px dashed #1a73e8;
            border-radius: 6px;
            padding: 15px 30px;
            display: inline-block;
            margin: 25px 0;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #1a73e8;
            letter-spacing: 8px;
            margin: 0;
        }
        .email-footer {
            background-color: #f1f3f4;
            color: #888888;
            padding: 20px;
            text-align: center;
            font-size: 13px;
        }
        .email-footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="email-header">
                <h1>Saraha</h1>
            </div>

            <div class="email-body">
                <h2>Verify Your Email Address</h2>
                <p>Hello,</p>
                <p>Thank you for registering with us! To complete your registration and ensure the security of your account, please use the following verification code:</p>
                
                <div class="otp-box">
                    <p class="otp-code">${OTP_CODE}</p>
                </div>

                <p>This code is valid for <strong>5 minutes</strong>.</p>
                <p style="font-size: 14px; margin-top: 30px;">If you did not create an account using this email address, please ignore this email.</p>
            </div>

            <div class="email-footer">
                <p>&copy; 2026 Saraha App. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </div>
</body>
</html>`}