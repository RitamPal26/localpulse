import { action } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { api } from "./_generated/api";

export const sendItemShare = action({
  args: {
    itemId: v.string(),
    friendEmail: v.string(),
    personalMessage: v.optional(v.string()),
    itemTitle: v.string(),
    itemDescription: v.string(),
    itemLocation: v.string(),
    itemSource: v.string(),
    pulseIcon: v.string(),
    pulseName: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    // Get user info from database - FIXED LINE
    const user = await ctx.runQuery(api.users.get, {
      tokenIdentifier: identity.tokenIdentifier,
    });

    if (!user) throw new ConvexError("User not found");

    // Call Resend API (now allowed in actions)
    try {
      const emailHtml = generateEmailTemplate({
        senderName: user.name || "A ChennaiPulse user",
        senderEmail: user.email,
        personalMessage: args.personalMessage,
        itemTitle: args.itemTitle,
        itemDescription: args.itemDescription,
        itemLocation: args.itemLocation,
        itemSource: args.itemSource,
        pulseIcon: args.pulseIcon,
        pulseName: args.pulseName,
      });

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ChennaiPulse <noreply@resend.dev>", // Use resend.dev for testing
          to: [args.friendEmail],
          subject: `${user.name || "Someone"} shared something cool from Chennai with you!`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Resend API error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log("Email sent successfully:", result.id);
      return { success: true, emailId: result.id };
    } catch (error) {
      console.error("Error sending email:", error);
      throw new ConvexError(`Failed to send email: ${error.message}`);
    }
  },
});

// HTML email template (same as before)
function generateEmailTemplate(data: {
  senderName: string;
  senderEmail: string;
  personalMessage?: string;
  itemTitle: string;
  itemDescription: string;
  itemLocation: string;
  itemSource: string;
  pulseIcon: string;
  pulseName: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ChennaiPulse Share</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #007AFF, #4ECDC4); border-radius: 12px; color: white;">
    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">ChennaiPulse</h1>
    <p style="margin: 5px 0 0 0; opacity: 0.9;">Discover Chennai's Best</p>
  </div>

  <!-- Personal Message -->
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #007AFF;">
    <p style="margin: 0; font-style: italic; color: #555;">
      <strong>${data.senderName}</strong> thought you'd be interested in this:
    </p>
    ${data.personalMessage ? `<p style="margin: 10px 0 0 0; color: #333;">"${data.personalMessage}"</p>` : ""}
  </div>

  <!-- Main Content Card -->
  <div style="background: white; border: 1px solid #eee; border-radius: 12px; padding: 20px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    
    <!-- Pulse Category -->
    <div style="display: flex; align-items: center; margin-bottom: 12px;">
      <span style="font-size: 18px; margin-right: 8px;">${data.pulseIcon}</span>
      <span style="background: #007AFF; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${data.pulseName}</span>
    </div>

    <!-- Title -->
    <h2 style="margin: 0 0 10px 0; color: #1a1a1a; font-size: 20px; font-weight: 600; line-height: 1.3;">
      ${data.itemTitle}
    </h2>

    <!-- Description -->
    <p style="margin: 0 0 15px 0; color: #555; font-size: 16px; line-height: 1.5;">
      ${data.itemDescription}
    </p>

    <!-- Location & Source -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #eee; font-size: 14px; color: #666;">
      <span>📍 ${data.itemLocation}</span>
      <span style="font-style: italic;">via ${data.itemSource}</span>
    </div>
  </div>

  <!-- Call to Action -->
  <div style="text-align: center; margin-bottom: 30px;">
    <a href="https://localpulse.app" style="display: inline-block; background: #007AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Get ChennaiPulse App
    </a>
    <p style="margin: 12px 0 0 0; font-size: 14px; color: #666;">
      Discover more cool stuff happening in Chennai!
    </p>
  </div>

  <!-- Footer -->
  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
    <p>This email was sent from ChennaiPulse by ${data.senderName} (${data.senderEmail})</p>
    <p>ChennaiPulse - Your Personal Guide to Chennai</p>
  </div>

</body>
</html>
  `;
}
