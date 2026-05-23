import { DataAPIClient } from "@datastax/astra-db-ts"
import { GoogleGenAI } from "@google/genai"
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"

import "dotenv/config"

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"


const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_APPLICATION_TOKEN,
    ASTRA_DB_API_ENDPOINT,
    GEMINI_API_KEY,
    ASTRA_DB_COLLECTION,
} = process.env

if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required.")
}

const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

const f1Data = [
    "https://en.wikipedia.org/wiki/Formula_One",
]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { keyspace: ASTRA_DB_NAMESPACE })

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
})

const embeddingText = async (text: string): Promise<number[]> => {
    const result = await genAI.models.embedContent({
        model: "gemini-embedding-001",
        contents: text,
        config: {
            outputDimensionality: 768,
            taskType: "RETRIEVAL_DOCUMENT",
        },
    })

    const vector = result.embeddings?.[0]?.values
    if (!vector?.length) {
        throw new Error("No embedding returned from Gemini")
    }
    return vector
}

const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector: {
            dimension: 768,
            metric: similarityMetric,
        },
    })
    console.log(res)
}

const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    for await (const url of f1Data) {
        const content = await scrapePage(url)
        const chunks = await splitter.splitText(content)
        for await (const chunk of chunks) {
            const vector = await embeddingText(chunk)

            const res = await collection.insertOne({
                $vector: vector,
                text: chunk,
            })
            console.log(res)
        }
    }
}

const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true,
        },
        gotoOptions: {
            waitUntil: "domcontentloaded",
        },
        evaluate: async (page, browser) => {
            const result = await page.evaluate(() => document.body.innerHTML)
            await browser.close()
            return result
        },
    })
    return (await loader.scrape())?.replace(/<[^>]*>?/gm, "")
}

createCollection().then(() => loadSampleData())
