import { DataAPIClient } from "@datastax/astra-db-ts";
import { GoogleGenAI } from "@google/genai"

const EMBEDDING_MODEL = "gemini-embedding-001"
const EMBEDDING_DIMENSION = 768
const CHAT_MODEL = "gemini-3.5-flash"

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_APPLICATION_TOKEN,
    ASTRA_DB_API_ENDPOINT,
    GEMINI_API_KEY,
    ASTRA_DB_COLLECTION,
} = process.env

const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY })
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, {keyspace: ASTRA_DB_NAMESPACE})

export async function POST(req: Request) {
    try {

        const { messages } = await req.json()
        const latestMessage = messages[messages?.length - 1]?.content

        let docContext = ""

        const embedding = await genAI.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: latestMessage,
            config: {
                outputDimensionality: EMBEDDING_DIMENSION,
                taskType: "RETRIEVAL_QUERY",
            },
        })

        const queryVector = embedding.embeddings?.[0]?.values

        try {
            const collection = await db.collection (ASTRA_DB_COLLECTION)
            const cursor = collection.find(null, {
                sort: {
                    $vector: queryVector,
                },
                limit: 10
            })

            const documents = await cursor.toArray()

            const docsMap = documents?.map(doc => doc.text)

            docContext = JSON.stringify(docsMap)

        } catch (err) {
            console.log("Error querying db...")
            docContext = ""
        }

        const template = {
            role: "system",
            content: `You are an AI Assistant who knows everything Formula One.
            ----------
            START CONTEXT
            ${docContext}
            END CONTEXT
            ----------
            QUESTION: ${latestMessage}
            ----------
            `
        }

        const geminiMessages = messages.map((msg: { role: string; content: string }) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
        }))

        const response = await genAI.models.generateContentStream({
            model: CHAT_MODEL,
            contents: geminiMessages,
            config: {
                systemInstruction: template.content,
            },
        })

        const stream = GoogleStream(response)
        return new StreamingTextResponse(stream)

    } catch (err) {
        throw err
    }
}

function GoogleStream(
    response: AsyncGenerator<{ text?: string }>
): ReadableStream<Uint8Array> {
    return new ReadableStream({
        async start(controller) {
            for await (const chunk of response) {
                const text = chunk.text
                if (text) {
                    controller.enqueue(new TextEncoder().encode(text))
                }
            }
            controller.close()
        },
    })
}

class StreamingTextResponse extends Response {
    constructor(stream: ReadableStream<Uint8Array>, init?: ResponseInit) {
        super(stream, {
            ...init,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                ...(init?.headers ?? {}),
            },
        })
    }
}
