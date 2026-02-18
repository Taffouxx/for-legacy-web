import { action, makeAutoObservable, runInAction } from "mobx";

import { changelogEntries } from "../../assets/changelogs";
import { modalController } from "../../controllers/modals/ModalController";
import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";
import Syncable from "../interfaces/Syncable";

export interface Data {
    viewed?: number;
}

/**
 * Keeps track of viewed changelog items
 */
export default class Changelog implements Store, Persistent<Data>, Syncable {
    /**
     * Last viewed changelog date timestamp
     */
    private viewed: number;

    /**
     * Construct new Layout store.
     */
    constructor() {
        this.viewed = 0;
        makeAutoObservable(this);
    }

    get id() {
        return "changelog";
    }

    toJSON() {
        return {
            viewed: this.viewed,
        };
    }

    @action hydrate(data: Data) {
        if (data.viewed) {
            this.viewed = data.viewed;
        }
    }

    apply(_key: string, data: unknown, _revision: number): void {
        this.hydrate(data as Data);
    }

    toSyncable(): { [key: string]: object } {
        return {
            changelog: this.toJSON(),
        };
    }

    /**
     * Check whether there are new updates
     */
    checkForUpdates() {
        // Use the date timestamp as the version identifier
        const latestEntry = changelogEntries[0];
        if (!latestEntry) return;

        const latestVersion = +latestEntry.date;

        if (this.viewed < latestVersion) {
            const expires = new Date(latestVersion);
            expires.setDate(expires.getDate() + 7);

            // Only show if the update is less than a week old
            if (+new Date() < +expires) {
                modalController.push({
                    type: "changelog",
                    initial: 1, // Open the first entry (index 0)
                });
            }

            runInAction(() => {
                this.viewed = latestVersion;
            });
        }
    }
}
