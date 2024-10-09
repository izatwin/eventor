const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const baseOptions = {
    discriminatorKey: "type",
    collection: "event",
};

const baseEventSchema = new Schema({
    eventName: { type: String, required: true},
    eventDescription: { type: String, required: true},
    
    startTime: {type: Date, required: false},
    endTime: {type: Date, required: false},
    embeddedImage: {type: String, required: false},
}, baseOptions);

const BaseEvent = mongoose.model("Event", baseEventSchema)

const NormalEvent = BaseEvent.discriminator('NormalEvent', new Schema({
    location: {type: String, required: true}
    })
);

const ReleaseType = Object.freeze({
    SINGLE:     Symbol("single"),
    EP:         Symbol("ep"),
    ALBUM:      Symbol("album")
})

const MusicReleaseEvent = BaseEvent.discriminator('MusicReleaseEvent', new Schema({
    releaseTitle: {type: String, required: true},
    releaseArtist: {type: String, required: true},
    releaseType: {type: ReleaseType, required: true},  // Not sure if this works
    songs: {type: [Song], required: true, default: []},  // Not sure if this works

    appleMusicLink: {type: String, required: false},
    spotifyLink: {type: String, required: false}
    })
);

const TicketedEvent = BaseEvent.discriminator('TicketedEvent', new Schema({
    getTicketsLink: {type: String, requrired: true},
    destinations: {type: [Destination], required: true}
    })
);

//TODO song and destination stuff
