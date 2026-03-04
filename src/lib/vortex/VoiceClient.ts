import EventEmitter from "eventemitter3";
import {
    Room,
    RoomEvent,
    RemoteParticipant,
    RemoteTrackPublication,
    RemoteTrack,
    Track,
    createLocalAudioTrack,
    LocalTrack,
} from "livekit-client";

import type { ProduceType, VoiceUser, VoiceError } from "./Types";

interface VoiceEvents {
    ready: () => void;
    error: (error: Error) => void;
    close: (error?: VoiceError) => void;

    startProduce: (type: ProduceType) => void;
    stopProduce: (type: ProduceType) => void;

    userJoined: (userId: string) => void;
    userLeft: (userId: string) => void;

    userStartProduce: (userId: string, type: ProduceType) => void;
    userStopProduce: (userId: string, type: ProduceType) => void;
}

export default class VoiceClient extends EventEmitter<VoiceEvents> {
    private _supported: boolean;
    private room: Room;

    isDeaf?: boolean;
    userId?: string;
    roomId?: string;
    participants: Map<string, VoiceUser>;
    consumers: Map<string, { audio?: HTMLAudioElement }>;
    audioProducer?: MediaStreamTrack;

    private token?: string;
    private address?: string;

    constructor() {
        super();
        this._supported = typeof RTCPeerConnection !== "undefined";
        this.participants = new Map();
        this.consumers = new Map();
        this.isDeaf = false;
        this.room = new Room();

        this.room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
            this.participants.set(participant.identity, {});
            this.emit("userJoined", participant.identity);
        });

        this.room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
            this.participants.delete(participant.identity);
            const audio = this.consumers.get(participant.identity)?.audio;
            if (audio) {
                audio.pause();
                audio.srcObject = null;
            }
            this.consumers.delete(participant.identity);
            this.emit("userLeft", participant.identity);
        });

        this.room.on(RoomEvent.TrackSubscribed, (
            track: RemoteTrack,
            _publication: RemoteTrackPublication,
            participant: RemoteParticipant,
        ) => {
            if (track.kind === Track.Kind.Audio) {
                const audio = new Audio();
                audio.srcObject = new MediaStream([track.mediaStreamTrack]);
                if (!this.isDeaf) audio.play();
                this.consumers.set(participant.identity, { audio });

                const user = this.participants.get(participant.identity) || {};
                user.audio = true;
                this.participants.set(participant.identity, user);
                this.emit("userStartProduce", participant.identity, "audio");
            }
        });

        this.room.on(RoomEvent.TrackUnsubscribed, (
            track: RemoteTrack,
            _publication: RemoteTrackPublication,
            participant: RemoteParticipant,
        ) => {
            if (track.kind === Track.Kind.Audio) {
                const consumer = this.consumers.get(participant.identity);
                if (consumer?.audio) {
                    consumer.audio.pause();
                    consumer.audio.srcObject = null;
                }
                this.consumers.delete(participant.identity);

                const user = this.participants.get(participant.identity) || {};
                user.audio = false;
                this.participants.set(participant.identity, user);
                this.emit("userStopProduce", participant.identity, "audio");
            }
        });

        this.room.on(RoomEvent.Disconnected, () => {
            this.emit("close");
        });
    }

    supported() {
        return this._supported;
    }

    connect(address: string, roomId: string) {
        this.roomId = roomId;
        this.address = address;
        return Promise.resolve();
    }

    async authenticate(token: string) {
        this.token = token;

        await this.room.connect(this.address!, token);

        this.userId = this.room.localParticipant.identity;

        this.room.remoteParticipants.forEach((participant) => {
            const user: VoiceUser = {};
            participant.audioTrackPublications.forEach((pub) => {
                if (pub.isSubscribed) user.audio = true;
            });
            this.participants.set(participant.identity, user);
        });
    }

    disconnect() {
        this.room.disconnect();
        this.participants.clear();
        this.consumers.clear();
        this.userId = undefined;
        this.roomId = undefined;
        this.audioProducer = undefined;
        this.token = undefined;
        this.address = undefined;
    }

    async startProduce(track: MediaStreamTrack, type: ProduceType) {
        if (type === "audio") {
            await this.room.localParticipant.publishTrack(track);
            this.audioProducer = track as any;
            
            const user = this.participants.get(this.userId || "") || {};
            user.audio = true;
            this.participants.set(this.userId || "", user);
            
            this.emit("startProduce", type);
        }
    }

    async stopProduce(type: ProduceType) {
        if (type === "audio" && this.audioProducer) {
            await this.room.localParticipant.unpublishTrack(this.audioProducer);
            this.audioProducer = undefined;
            
            const user = this.participants.get(this.userId || "") || {};
            user.audio = false;
            this.participants.set(this.userId || "", user);
            
            this.emit("stopProduce", type);
        }
    }
}