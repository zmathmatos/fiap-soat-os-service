const nodemailer = require("nodemailer");

// Requirements:
// 1. Get this Mailhog Docker Image from Docker Hub: https://hub.docker.com/r/mailhog/mailhog/
// 2. Set the Mailhog port as 8025 and the SMTP server port as 1025.
// 3. On the project-helpers folder, run `npm install`.

// Steps to test the email:
// 1. Get a Service Order Number and, on this script, set it as the value of the orderServiceNumber variable.
// 2. Run the application with `docker compose up`;
// 3. Run the Mailhog container, then open http://0.0.0.0:8025 on your browser.
// 4. Enter the project-helpers folder.
// 5. Run `npm run send-email`.
// 6. See the email you sent on Mailhog.
// note

async function sendEmail(htmlContent) {
  const transporter = nodemailer.createTransport({
    host: "0.0.0.0",
    port: 1025,
    secure: false,
  });

  const info = await transporter.sendMail({
    from: '"AUTO FIX" <noreply@empresa.com>',
    to: "usuario@exemplo.com",
    subject: "Aprovação de orçamento ✔",
    html: htmlContent,
  });

  console.log("Mensagem enviada: %s", info.messageId);
}

const orderServiceNumber = "1000";
const htmlContent = `
  Olá!<br /><br />
  O orçamento da ordem de serviço ${orderServiceNumber} foi gerado.<br /><br />
  Clique abaixo para aprovar ou rejeitar: <br /><br />

  <a target="_blank" href="http://localhost:3000/customer/service-orders/${orderServiceNumber}/quotation/approval">Aprovar</a><br /><br />
  <a target="_blank" href="http://localhost:3000/customer/service-orders/${orderServiceNumber}/quotation/rejection">Rejeitar</a>
`;

sendEmail(htmlContent);
