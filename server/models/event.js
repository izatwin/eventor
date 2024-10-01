const crypto = require("crypto");

class Event {
    /*
    eventId : string;
    name : string;
    description : string;

    startTime : Date | undefined;
    endTime : Date | undefined;
    embeddedImage : string | undefined;
    */
    
    constructor(name, description) {
        let eventId = crypto.randomUUID();

        this.eventId = eventId;
        this.name = name;
        this.description = description;

        this.startTime = undefined;
        this.endTime = undefined;
        this.embeddedImage = undefined;
    }
}

class NormalEvent extends Event {
    /*
    location : str;
    */
    constructor(name, description, location) {
        super(name, description);

        this.location = location;
    }

}

const ReleaseType = Object.freeze({
    SINGLE:     Symbol("single"),
    EP:         Symbol("ep"),
    ALBUM:      Symbol("album")
})

class MusicReleaseEvent extends Event {
    /*
    releaseTitle : str;
    releaseArtist : str;
    releaseType : enum ReleaseType;
    songs : Song[];

    appleMusicLink : str;
    spotifyLink : str;
    */
    constructor(name, description, releaseTitle, releaseArtist, releaseType, songs) {
        super(name, description)

        this.releaseTitle = releaseTitle;
        this.releaseArtist = releaseArtist;
        this.releaseType = releaseType;
        this.songs = songs;

        this.appleMusicLink = "";
        this.spotifyLink = "";

    }

}

class Song {
    /*
    songTitle : str;
    songArtist : str;
    songDuration : int;
    */
    constructor(songTitle, songArtist, songDuration) {
        this.songTitle = songTitle;
        this.songArtist = songArtist;
        this.songDuration = songDuration;
    }
}

class TicketedEvent extends Event {
    /*
    getTicketsLink : str;
    destinations : Destination[]
    */
    constructor(getTicketsLink, destinations) {
        this.getTicketsLink = getTicketsLink;
        this.destinations = destinations;
    }
}

class Destination {
    /*
    location : str;

    time : Date | undefined;
    */
    constructor(location) {
        this.location = location;

        this.time = undefined;
    }
}