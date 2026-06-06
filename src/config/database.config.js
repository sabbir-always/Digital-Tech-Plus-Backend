import mongoose from "mongoose";
import chalk from "chalk";
import dns from 'dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);

let cached = global.mongoose;
if (!cached) { cached = global.mongoose = { conn: null, promise: null } }

export const databaseConnect = async () => {
    try {
        if (cached.conn) return cached.conn;
        if (!cached.promise) {
            cached.promise = mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/database", { bufferCommands: false })
        }

        cached.conn = await cached.promise;
        if (cached.conn) { console.log(chalk.bgGreen.bold(`✓ MongoDB Connected: ${cached.conn.connection.name}`)) }
        return cached.conn;

    } catch (error) {
        console.error(chalk.bgRed.bold("✗ Database connection failed"));
        console.error(chalk.yellow(error.message));
        cached.promise = null;
        throw error;
    }
};