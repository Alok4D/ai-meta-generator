require('dotenv').config({ path: '.env' });
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image and return a JSON object with exactly three fields: 'title' (a highly descriptive SEO friendly title), 'category' (a single relevant category word), and 'keywords' (an array of EXACTLY 49 highly relevant comma-separated keywords for stock photography). Do not include markdown formatting or extra text." },
            {
              type: "image_url",
              image_url: {
                url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });
    console.log(response.choices[0]?.message?.content);
  } catch (error) {
    console.error("OPENAI ERROR:", error.response ? error.response.data : error.message);
  }
}

test();
