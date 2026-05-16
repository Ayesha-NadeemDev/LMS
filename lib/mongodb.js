import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const options = {}

let client
let clientPromise

if (!process.env.MONGODB_URI) {
  console.error('Please add MONGODB_URI to .env file')
}

client = new MongoClient(uri, options)
clientPromise = client.connect()

export default clientPromise