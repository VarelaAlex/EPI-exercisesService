const { MongoClient } = require('mongodb');

const database = {
  uri: "mongodb+srv://uo271288:9Lh189zrKidsgWeR@hytex.ttqdwlm.mongodb.net/?retryWrites=true&w=majority&appName=HYTEX",
  connected: false,
  client: null,
  db: null,
  async connect() {
    if (this.connected == false) {
      this.connected = true;
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      this.db = this.client.db("HYTEX");
    }
  },
  async disconnect() {
    if (this.connected == true) {
      this.connected = false;
      await this.client.close();
    }
  },
  async createDocument(collectionName, doc) {
    try {
      await this.connect();
      const collection = this.db.collection(collectionName);
      const result = await collection.insertOne(doc);
      return result.insertedId;
    } catch (error) {
      throw new Error('Error inserting document: ' + error.message);
    } finally {
      await this.disconnect();
    }
  },
  async readDocuments(collectionName, query) {
    try {
      await this.connect();
      const collection = this.db.collection(collectionName);
      const cursor = await collection.find(query);
      return await cursor.toArray();
    } catch (error) {
      throw new Error('Error finding documents: ' + error.message);
    } finally {
      await this.disconnect();
    }
  },
  async updateDocument(collectionName, query, update) {
    try {
      await this.connect();
      const collection = this.db.collection(collectionName);
      const result = await collection.updateOne(query, { $set: update });
      return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
    } catch (error) {
      throw new Error('Error updating document: ' + error.message);
    } finally {
      await this.disconnect();
    }
  },
  async deleteDocument(collectionName, query) {
    try {
      await this.connect();
      const collection = this.db.collection(collectionName);
      const result = await collection.deleteOne(query);
      return { deletedCount: result.deletedCount };
    } catch (error) {
      throw new Error('Error deleting document: ' + error.message);
    } finally {
      await this.disconnect();
    }
  }
};

module.exports = database;