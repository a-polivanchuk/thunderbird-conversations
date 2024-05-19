/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/*
 * This file contains various attribute providers for Gloda, we're all storing
 *  them in this file. This file acts like a "plugin" for Gloda.
 *
 * The first one is a trivial plugin that adds some extra information to store
 *  on GlodaMessages. This is not even a new column in the table or whatever,
 *  but simply a new entry in the JSON that's stored alongside this message. For
 *  a more detailed explanation of this mechanism, feel free to read:
 *  http://blog.xulforum.org/index.php?post/2011/01/03/An-overview-of-Thunderbird-Conversations
 * This plugin adds a alternativeSender property on GlodaMessage that
 *  corresponds to the X-Bugzilla-Who header, if found. In case we don't have a
 *  GlodaMessage in message.js, we just recover that information through a
 *  lookup in the MimeMessage's headers.
 * We guarantee alternativeSender to be parsable as:
 *  Sender Name <xx@xx.xx>
 */

const lazy = {};

ChromeUtils.defineESModuleGetters(lazy, {
  Gloda: "resource:///modules/gloda/GlodaPublic.sys.mjs",
  GlodaConstants: "resource:///modules/gloda/GlodaConstants.sys.mjs",
});

let AlternativeSender = {
  init() {
    this.defineAttributes();
  },

  defineAttributes() {
    this._alternativeSenderAttribute = lazy.Gloda.defineAttribute({
      provider: this,
      extensionName: "bugzilla-alternative-sender",
      attributeType: lazy.GlodaConstants.kAttrDerived,
      attributeName: "alternativeSender",
      bind: true,
      singular: true,
      subjectNouns: [lazy.GlodaConstants.NOUN_MESSAGE],
      objectNoun: lazy.GlodaConstants.NOUN_STRING,
    });
  },

  process: function* _AlternativeSender_process(
    aGlodaMessage,
    aRawReps,
    aIsNew,
    aCallbackHandle
  ) {
    try {
      let alternativeSender = this.alternativeSender(aRawReps);
      if (alternativeSender) {
        aGlodaMessage.alternativeSender = alternativeSender;
      }
    } catch (e) {
      dump(e + "\n" + e.stack + "\n");
    }

    yield lazy.GlodaConstants.kWorkDone;
  },

  // About to do more special-casing here? Please check out the corresponding
  //  code in contact.js and make sure you modify it too.
  alternativeSender(aRawReps) {
    const aMimeMsg = aRawReps.mime;

    // This header is a bare email address
    if (aMimeMsg && "x-bugzilla-who" in aMimeMsg.headers) {
      return aMimeMsg.headers["x-bugzilla-who"];
    }

    return null;
  },
};

let ContentType = {
  init() {
    this.defineAttributes();
  },

  defineAttributes() {
    this._bugzillaAttribute = lazy.Gloda.defineAttribute({
      provider: this,
      extensionName: "content-type",
      attributeType: lazy.GlodaConstants.kAttrDerived,
      attributeName: "contentType",
      bind: true,
      singular: true,
      subjectNouns: [lazy.GlodaConstants.NOUN_MESSAGE],
      objectNoun: lazy.GlodaConstants.NOUN_STRING,
    });
  },

  process: function* _ContentType_process(
    aGlodaMessage,
    aRawReps,
    aIsNew,
    aCallbackHandle
  ) {
    try {
      if (aRawReps.mime) {
        aGlodaMessage.contentType = aRawReps.mime.headers["content-type"];
      }
    } catch (e) {
      dump(e + "\n" + e.stack + "\n");
    }

    yield lazy.GlodaConstants.kWorkDone;
  },
};

export var GlodaAttrProviders = {
  init() {
    ContentType.init();
    AlternativeSender.init();
  },
};
