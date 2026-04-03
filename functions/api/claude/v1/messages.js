export async function onRequestPost(context) {
  const { request, env } = context
  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY missing' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
  const body = await request.json()
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })
  const text = await response.text()
  return new Response(text, {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
