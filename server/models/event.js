const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const baseOptions = {
    discriminatorKey: "type",
    collection: "events",
};

// Define a sub-schema for Song
const songSchema = new Schema({
    songTitle: { type: String, required: true },
    songArtist: { type: String, required: true },
    songDuration: { type: Number, required: true }, // duration in seconds
}, { _id: false });

// Define a sub-schema for Destination
const destinationSchema = new Schema({
    location: { type: String, required: true },
    time: { type: Number, required: false }, // unix timestamp, optional
}, { _id: false });

// Base event schema
const baseEventSchema = new Schema({
    eventName: { type: String, required: true },
    eventDescription: { type: String, required: true },
    startTime: { type: Date, required: false },
    endTime: { type: Date, required: false },
    embeddedImage: { type: String, required: false },
    gaugeInterest: { type: Boolean, required: false, default: false },
    interestedUsers: [{ type: String, required: false, default: [] }],
    interestTags: [{ type: String, required: false, default: [] }],
}, baseOptions);

const BaseEvent = mongoose.model("Event", baseEventSchema);

// Normal Event discriminator
const NormalEvent = BaseEvent.discriminator('NormalEvent', new Schema({
    location: { type: String, required: true }
}));

// Music Release Event discriminator
const MusicReleaseEvent = BaseEvent.discriminator('MusicReleaseEvent', new Schema({
    releaseTitle: { type: String, required: true },
    releaseArtist: { type: String, required: true },
    releaseType: {
        type: String,
        enum: ['single', 'ep', 'album'],
        required: true
    },
    songs: { type: [songSchema], required: true, default: [] },
    appleMusicLink: { type: String, required: false },
    spotifyLink: { type: String, required: false }
}));

// Ticketed Event discriminator
const TicketedEvent = BaseEvent.discriminator('TicketedEvent', new Schema({
    getTicketsLink: { type: String, required: true },
    destinations: { type: [destinationSchema], required: true }
}));

module.exports = BaseEvent;