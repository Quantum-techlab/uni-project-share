import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendOtpRequest {
  email: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code }: SendOtpRequest = await req.json();

    console.log(`Sending OTP ${code} to ${email}`);

    const emailResponse = await resend.emails.send({
      from: "ITSA Project Vault <noreply@your-domain.com>", // Replace with your verified domain
      to: [email],
      subject: "Your ITSA Project Vault Login Code",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #1f2937; text-align: center;">ITSA Project Vault</h1>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin-bottom: 10px;">Your Login Code</h2>
            <p style="color: #6b7280; margin-bottom: 20px;">
              Use this code to complete your login to ITSA Project Vault:
            </p>
            <div style="background-color: white; padding: 15px; border-radius: 4px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #1f2937;">
              ${code}
            </div>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 15px;">
              This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </p>
          </div>
          <p style="color: #6b7280; text-align: center; font-size: 12px;">
            © 2024 ITSA Project Vault. This is an automated message.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-otp-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);