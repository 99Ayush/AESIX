import mongoose from 'mongoose';

let changeStream;
let ioInstance;

export function startRealtimeDatabaseEvents(io) {
  ioInstance = io;
  if (changeStream) return changeStream;

  try {
    changeStream = mongoose.connection.watch([], { fullDocument: 'updateLookup' });
    changeStream.on('change', (change) => {
      if (ioInstance) {
        ioInstance.emit('database:change', {
          operation: change.operationType,
          collection: change.ns.coll,
          documentId: String(change.documentKey?._id || ''),
        });
      }
    });
    changeStream.on('error', (error) => {
      console.error(`MongoDB Change Stream error: ${error.message}`);
    });
    changeStream.on('close', () => {
      changeStream = undefined;
    });

    console.log('MongoDB Change Stream is listening for live updates.');
  } catch (error) {
    console.error(`Could not initialize MongoDB Change Stream: ${error.message}`);
  }

  return changeStream;
}

export function notifyDatabaseChange(operation = 'update', collection = 'users', documentId = 'user-1') {
  if (ioInstance) {
    ioInstance.emit('database:change', {
      operation,
      collection,
      documentId,
    });
  }
}

export async function stopRealtimeDatabaseEvents() {
  if (!changeStream) return;
  try {
    await changeStream.close();
  } catch {
    // Ignore close errors
  }
  changeStream = undefined;
}

