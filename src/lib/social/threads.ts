const THREADS_USER_ID = process.env.THREADS_USER_ID;
const THREADS_ACCESS_TOKEN = process.env.THREADS_ACCESS_TOKEN;

export async function postToThreads(content: string) {
  if (!THREADS_USER_ID || !THREADS_ACCESS_TOKEN) {
    console.error('❌ Threads keys missing. Skipping post.');
    return null;
  }

  try {
    // Step 1: Create the "Media Container" (Draft the post)
    const createContainerUrl = `https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads`;
    const containerResponse = await fetch(createContainerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'TEXT',
        text: content,
        access_token: THREADS_ACCESS_TOKEN,
      }),
    });

    if (!containerResponse.ok) throw new Error(await containerResponse.text());
    const containerData = await containerResponse.json();
    const creationId = containerData.id;

    // Step 2: Publish the Container
    const publishUrl = `https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads_publish`;
    const publishResponse = await fetch(publishUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: THREADS_ACCESS_TOKEN,
      }),
    });

    if (!publishResponse.ok) throw new Error(await publishResponse.text());

    console.log('✅ Posted to Threads');
    return true;
  } catch (error) {
    console.error('🚨 Threads Post Failed:', error);
    return null;
  }
}
