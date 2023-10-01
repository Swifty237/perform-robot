import EventModel from "../models/event-model.js";
import FighterModel from "../models/fighter-model.js";

export const getYears = () => {
    const years = [];

    for (let i = 2021; i < 2023; i++) {
        years.push(i);
    }

    return years;
}

export const getFigtherIds = (tab) => {
    const fighterIds = [];
    tab.map(elt => {
        fighterIds.push(elt.FighterId);
    })
    return fighterIds;
}

export const FighterIdentities = (tabJson) => {

    console.log("FighterIdentity ==========================================");

    const fighterNames = [];

    if (tabJson != []) {

        for (let elt of tabJson) {

            for (let fight of elt.Fights) {

                for (let fighter of fight.Fighters) {

                    if (fighterNames == []) {

                        const newElement = {
                            FighterId: fighter.FighterId,
                            FirstName: fighter.FirstName,
                            LastName: fighter.LastName
                        }

                        fighterNames.push(newElement);

                    } else {

                        const fighterIds = getFigtherIds(fighterNames);
                        const found = fighterIds.find(elt => elt == fighter.FighterId);

                        if (found == null) {

                            const newElement = {
                                FighterId: fighter.FighterId,
                                FirstName: fighter.FirstName,
                                LastName: fighter.LastName
                            }

                            fighterNames.push(newElement);
                        }
                    }
                }
            }
        }

        return fighterNames;

    } else {
        console.log("eventDetailsData is empty");
    }
}

export const getMongodbEvents = async () => {
    return await EventModel.find();
}

export const getMongodbFighters = async () => {
    return await FighterModel.find();
}