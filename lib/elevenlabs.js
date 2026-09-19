const API = "https://api.elevenlabs.io/v1";

function key() {
  const k = process.env.ELEVENLABS_API_KEY;
  if (!k) throw new Error("ELEVENLABS_API_KEY not set");
  return k;
}

async function el(path, opts = {}) {
  const r = await fetch(`${API}${path}`, {
    ...opts,
    headers: { "xi-api-key": key(), "content-type": "application/json", ...(opts.headers || {}) },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`${path} -> ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

export const listConversations = (agentId, pageSize = 12) =>
  el(`/convai/conversations?agent_id=${agentId}&page_size=${pageSize}`);

export const getConversation = (id) => el(`/convai/conversations/${id}`);

export const listPhoneNumbers = () => el(`/convai/phone-numbers`);

// Outbound confirmation call. This is what fires when a human clicks Approve.
export function outboundCall({ agentId, phoneNumberId, toNumber, firstMessage }) {
  return el(`/convai/twilio/outbound-call`, {
    method: "POST",
    body: JSON.stringify({
      agent_id: agentId,
      agent_phone_number_id: phoneNumberId,
      to_number: toNumber,
      ...(firstMessage
        ? { conversation_initiation_client_data: { conversation_config_override: { agent: { first_message: firstMessage } } } }
        : {}),
    }),
  });
}

// Narration for the demo video, in Iris's voice.
export async function tts(text, voiceId = "EXAVITQu4vr4xnSDxMaL") {
  const r = await fetch(`${API}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": key(), "content-type": "application/json" },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
  });
  if (!r.ok) throw new Error(`tts -> ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}
