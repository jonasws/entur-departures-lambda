import * as Alexa from "alexa-sdk";

import * as R from "ramda";

import { getDeparturesByQuayId } from "entur-departures";

import { GetDeparturesIntent } from "./intents/getDepartures";
import { GuideMeHomeIntent } from "./intents/guideMeHome";

const handlers = {
  GetDeparturesIntent,
  GuideMeHomeIntent,

  Unhandled() {
    this.emit(":tell", "I'm sorry. I don't know.");
  }
};

exports.handler = (event, context, callback) => {
  const alexa = Alexa.handler(event, context, callback);
  alexa.appId = process.env.SKILL_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
