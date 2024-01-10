import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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', // This is the default and can be omitted
});

async function main() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: 'gpt-3.5-turbo',
  });
}

main();