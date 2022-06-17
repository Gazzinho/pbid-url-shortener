import mongoose, { ConnectOptions } from 'mongoose';

export const connectToDatabase = async (connectionUrl: string) => {
    console.log("Connecting to database at", connectionUrl);
    await mongoose.connect(
        connectionUrl,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        } as ConnectOptions);

    const dbConnection = mongoose.connection;
    dbConnection.on(
        'error',
        () => {
            console.error("Error connecting to database ", connectionUrl);
        }
    );
};
