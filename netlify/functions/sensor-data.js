// netlify/functions/sensor-data.js
//
// Ito ang endpoint na tatanggap ng POST request mula sa ESP32.
// URL nito pagkatapos ma-deploy: https://<yoursite>.netlify.app/.netlify/functions/sensor-data

exports.handler = async function (event, context) {
  // Tanggapin lang ang POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const data = JSON.parse(event.body);

    // Simpleng validation
    const { moisture, temperature, ph } = data;
    if (moisture === undefined || temperature === undefined || ph === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Kulang ang fields (moisture, temperature, ph)" }),
      };
    }

    // I-log muna sa Netlify function logs (makikita mo sa Netlify dashboard)
    console.log("Natanggap na sensor data:", data);

    // TODO: Kapag gusto mo nang i-store nang permanente, idagdag dito ang
    // koneksyon sa isang database (hal. Supabase, Firebase, Airtable).
    // Sa ngayon, ire-return lang natin ang datos bilang confirmation.

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Natanggap ang data!",
        received: data,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON: " + err.message }),
    };
  }
};
