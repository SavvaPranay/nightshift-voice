# Demo narration (v2)

Tighter than the first draft. Written to sit under a screen recording, so it leaves room
for the call audio to breathe. Roughly 1 minute 50 read aloud.

---

Call a small business at eight in the evening and you get voicemail. Most people don't leave
one. They call the next business on the list.

The obvious fix is an AI voice agent. Voice is good enough now. But no owner will let an
agent book appointments or quote prices while they're asleep. One wrong price, one double
booked slot, and it's their reputation on the line. So the agent gets locked down to
answering questions, and it becomes voicemail with a nicer voice.

This is Iris.

Iris answers when the office is closed. She knows the hours, the services, the published
prices. She can check open slots and take a message.

What she cannot do is commit.

Here, a caller asks to book. Iris checks availability, writes the request down, and says
something very specific. Someone from the team will confirm it shortly. She does not say
it's booked. Because it isn't.

That request lands in the console as a pending action, waiting for a person.

Now watch her refuse. The caller asks for a discount. That price isn't in her knowledge
base, and she isn't authorized to negotiate. So she doesn't guess. She escalates.

Nobody was awake for any of this.

In the morning, the owner opens the console. Every decision is waiting, with the transcript
behind it, and a summary written by Mel. They approve the booking.

And Iris calls the customer back to confirm it, in the same voice that took the call.

Voice agents can talk. They can't be trusted to act. This is the layer in between.

---

## If you need a 30 second version

Call a business after hours and you get voicemail. Iris answers instead. She handles the
whole call, but she commits to nothing on her own. Anything that costs money or changes a
booking waits for a human to approve it. Then Iris calls the customer back to confirm.
Voice agents can talk. They can't be trusted to act. This is the layer in between.


## Extended version (full runtime)

Call a small business at eight in the evening and you get voicemail. Most people don't leave one. They call the next business on the list.

The obvious fix is an AI voice agent. Voice is good enough now. But no owner will let an agent book appointments or quote prices while they're asleep. One wrong price, one double booked slot, and it's their reputation on the line. So the agent gets locked down to answering questions, and it becomes voicemail with a nicer voice.

This is Iris.

Iris answers when the office is closed. She knows the hours, the services, the published prices. She can check open slots, take a message, and record who called and what they needed.

What she cannot do is commit.

Here's a call coming in. It appears in the console the moment it connects, marked live, and the transcript fills in as the conversation happens. Nothing here is staged. This is the real call record, synced from ElevenLabs as it runs.

The caller asks a simple question first. What time do you open on Monday. Iris answers from her knowledge base. Eight in the morning. She's not guessing, she's reading from what the practice actually told her.

Now the caller asks to book. A cleaning, Tuesday at ten.

Iris checks availability, and writes the request down. Then she says something very specific. Someone from the team will confirm it shortly. She does not say it's booked. Because it isn't. No appointment exists yet.

That request appears in the console as a pending action, waiting for a person.

Now watch her refuse. The caller asks for a discount on whitening. That price isn't in her knowledge base, and she isn't authorized to negotiate. So she doesn't guess, and she doesn't improvise a number to be helpful. She escalates, and tells the caller a human will follow up.

That refusal is the whole product. An agent that knows the edge of what it's allowed to do is worth more than one that sounds confident everywhere.

Nobody was awake for any of this.

Underneath the transcript is a section powered by Mel. Mel reads the call record and writes a one line summary with an urgency rating, so the owner doesn't have to read a transcript to know what happened. And you can ask it questions about the call directly.

Ask it something the call record doesn't contain, and it tells you it doesn't know. Same rule Iris follows on the phone.

In the morning, the owner opens the console. It's behind enterprise single sign on, because this screen shows customer phone numbers and call transcripts, so it can't be open to anyone with the link.

Every decision that needed a human is waiting here, with the full transcript behind it.

They approve the booking.

And Iris calls the customer back to confirm it, in the same voice that took the call.

That's the loop. The agent handles the call. It proposes anything that costs money or changes a commitment. A person approves. Then it commits, and the customer hears about it.

One last thing worth saying. During testing, a tool call failed and Iris still told the caller their request had been written down. It hadn't. That's exactly the failure this product exists to prevent, so now it's impossible. A failed tool means nothing was recorded, and she has to say so.

Voice agents can talk. They can't be trusted to act. This is the layer in between.
