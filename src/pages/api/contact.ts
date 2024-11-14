import type { APIRoute } from "astro";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.PRIVATE_RESEND_API_KEY)

export const POST: APIRoute = async ({ request }) => {
    try{
        const data = await request.json();
        const recaptchaToken = data['g-recaptcha-response'];

        const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
            secret: import.meta.env.PRIVATE_RECAPTCHA_KEY,
            response: recaptchaToken,
            }),
        });

        console.log(recaptchaResponse);

        const recaptchaResult = await recaptchaResponse.json();

        console.log(recaptchaResult);

        // Verificar el resultado de reCAPTCHA
        if (!recaptchaResult.success) {
            return new Response('reCAPTCHA verification failed', { status: 403 });
        }

        const { name, phone_prefix, phone, email, company_name, subject, message } = data;

        await resend.emails.send({
            from: 'fullRenew <onboarding@resend.dev>',
            to: 'agomzlo11@gmail.com',
            subject: 'Una nueva empresa se quiere poner en contacto con nosotros',
            html: `<p><strong>Nombre:</strong> ${name}</p>
                  <p><strong>Teléfono:</strong> ${phone_prefix} ${phone}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Empresa:</strong> ${company_name}</p>
                  <p><strong>Asunto:</strong> ${subject}</p>
                  <p><strong>Mensaje:</strong></p>
                  <p>${message}</p>`,
        })
        return new Response(null, {status: 200})
    }catch{
        return new Response(null, {status: 500})
    }
}