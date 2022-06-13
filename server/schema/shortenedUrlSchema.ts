import mongoose from "mongoose";

export type ShortenedUrl = {
    shortUrlId: string,
    longUrl: string,
    createdAt: string
};

export const shortenedUrlSchema = new mongoose.Schema({
        shortUrlId: {type: String},
        longUrl: {type: String}
    },
    { timestamps: true }
);

const ShortenedUrls = mongoose.model('ShortenedUrls', shortenedUrlSchema);

export default ShortenedUrls;
