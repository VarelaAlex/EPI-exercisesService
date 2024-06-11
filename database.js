const { MongoClient } = require('mongodb');

const database = {
  uri: "mongodb+srv://uo271288:9Lh189zrKidsgWeR@hytex.ttqdwlm.mongodb.net/?retryWrites=true&w=majority&appName=HYTEX",
  connected: false,
  client: null,
  db: null,

  async connect() {
    if (!this.connected) {
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      this.db = this.client.db("HYTEX");
      this.connected = true;
    }
  },

  async disconnect() {
    if (this.connected && this.client) {
      await this.client.close();
      this.connected = false;
      this.client = null;
      this.db = null;
    }
  },

  async createDocument(collectionName, doc) {
    await this.connect();
    try {
      const collection = this.db.collection(collectionName);
      const result = await collection.insertOne(doc);
      return result.insertedId;
    } catch (error) {
      throw new Error('Error inserting document: ' + error.message);
    }
  },

  async readDocuments(collectionName, query) {
    await this.connect();
    try {
      const collection = this.db.collection(collectionName);
      const cursor = await collection.find(query);
      return await cursor.toArray();
    } catch (error) {
      throw new Error('Error finding documents: ' + error.message);
    }
  },

  async updateDocument(collectionName, query, update) {
    await this.connect();
    try {
      const collection = this.db.collection(collectionName);
      const result = await collection.updateOne(query, { $set: update });
      return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
    } catch (error) {
      throw new Error('Error updating document: ' + error.message);
    }
  },

  async deleteDocument(collectionName, query) {
    await this.connect();
    try {
      const collection = this.db.collection(collectionName);
      const result = await collection.deleteOne(query);
      return { deletedCount: result.deletedCount };
    } catch (error) {
      throw new Error('Error deleting document: ' + error.message);
    }
  }
};

module.exports = database;
