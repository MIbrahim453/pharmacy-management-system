const baseStyles = `
  margin: 0;
  padding: 0;
  background-color: #f5f7fb;
  font-family: Arial, Helvetica, sans-serif;
  color: #1f2937;
`;

const cardStyles = `
  max-width: 640px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
`;

const headerStyles = `
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: #ffffff;
  padding: 32px 40px;
`;

const bodyStyles = `
  padding: 40px;
`;

const buttonStyles = `
  display: inline-block;
  background: #0f766e;
  color: #ffffff !important;
  text-decoration: none;
  padding: 14px 24px;
  border-radius: 10px;
  font-weight: 700;
`;

const sectionTitleStyles = `
  margin: 0 0 12px;
  font-size: 20px;
  line-height: 1.3;
`;

const textStyles = `
  margin: 0 0 16px;
  font-size: 15px;
  line-height: 1.7;
  color: #4b5563;
`;

const infoBoxStyles = `
  margin: 24px 0;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const rowStyles = `
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  line-height: 1.6;
`;

const lastRowStyles = `
  padding: 10px 0 0;
  font-size: 14px;
  line-height: 1.6;
`;

const labelStyles = `
  display: inline-block;
  min-width: 120px;
  font-weight: 700;
  color: #111827;
`;

const credentialTemplate = ({
  title,
  subtitle,
  greeting,
  name,
  email,
  password,
  roleLabel,
  roleValue,
  details = [],
  loginUrl = "#",
}) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="${baseStyles}">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="${cardStyles}">
            <tr>
              <td style="${headerStyles}">
                <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.85;">${greeting}</div>
                <h1 style="margin: 8px 0 0; font-size: 28px; line-height: 1.2;">${title}</h1>
                <p style="margin: 12px 0 0; font-size: 15px; line-height: 1.7; opacity: 0.95;">${subtitle}</p>
              </td>
            </tr>
            <tr>
              <td style="${bodyStyles}">
                <h2 style="${sectionTitleStyles}">Hello ${name},</h2>
                <p style="${textStyles}">
                  Your account has been created successfully. Use the temporary credentials below to sign in and complete your first login.
                </p>

                <div style="${infoBoxStyles}">
                  <div style="${rowStyles}"><span style="${labelStyles}">Email</span> ${email}</div>
                  <div style="${rowStyles}"><span style="${labelStyles}">Temporary Password</span> ${password}</div>
                  <div style="${lastRowStyles}"><span style="${labelStyles}">${roleLabel}</span> ${roleValue}</div>
                </div>

                ${
                  details.length
                    ? `
                <div style="${infoBoxStyles}">
                  ${details
                    .map(
                      (detail, index) => `
                    <div style="${
                      index === details.length - 1 ? lastRowStyles : rowStyles
                    }">
                      <span style="${labelStyles}">${detail.label}</span> ${detail.value}
                    </div>`,
                    )
                    .join("")}
                </div>
                `
                    : ""
                }

                <p style="${textStyles}">
                  For security, please change your password after logging in.
                </p>

                <a href="${loginUrl}" style="${buttonStyles}">Sign In</a>

                <p style="${textStyles} margin-top: 24px;">
                  If you were not expecting this email, you can safely ignore it.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const adminEmailTemplate = ({
  name,
  email,
  password,
  pharmacyName,
  city,
  registrationNumber,
  loginUrl = "#",
}) =>
  credentialTemplate({
    title: "Admin Account Created",
    subtitle:
      "Your pharmacy administration account is ready. You can now manage users, inventory, and pharmacy settings.",
    greeting: "Welcome Admin",
    name,
    email,
    password,
    roleLabel: "Account Type",
    roleValue: "Admin",
    details: [
      { label: "Pharmacy Name", value: pharmacyName },
      { label: "City", value: city },
      { label: "Registration No.", value: registrationNumber },
    ],
    loginUrl,
  });

const staffEmailTemplate = ({
  name,
  email,
  password,
  staffRole,
  pharmacyName,
  loginUrl = "#",
}) =>
  credentialTemplate({
    title: "Staff Account Created",
    subtitle:
      "Your staff account is ready. You can sign in to access the pharmacy tools assigned to your role.",
    greeting: "Welcome to the Team",
    name,
    email,
    password,
    roleLabel: "Assigned Role",
    roleValue: staffRole,
    details: pharmacyName
      ? [{ label: "Pharmacy Name", value: pharmacyName }]
      : [],
    loginUrl,
  });

export { adminEmailTemplate, staffEmailTemplate };
