const errors = require("./errors");

const mentionRegex = /^(<(@!?|#))|>$/g;

class Converter {
  constructor(message, argument) {
    this.message = message;
    this.argument = argument;
  }

  /**
   * Converts this argument to an object.
   */
  convert() {
    throw new Error("Not implemented.");
  }

  /**
   * Strips mentions from this argument.
   */
  stripMentions() {
    if (mentionRegex.test(this.argument)) {
      this.argument = this.argument.replace(mentionRegex, "");
    }
  }
}

class MemberConverter extends Converter {
  convert() {
    if (!this.message.guild) {
      throw new errors.ArgumentParsingError("Not in guild.");
    }

    this.stripMentions();

    let member = this.message.guild.member(this.argument);
    if (member == undefined) {
      throw new errors.BadArgument("Member not found.");
    }
    return member;
  }
}

class UserConverter extends Converter {
  convert() {
    this.stripMentions();

    let user = this.message.client.users.get(this.argument);
    if (user == undefined) {
      throw new errors.BadArgument("User not found.");
    }
    return member;
  }
}

class ChannelConverter extends Converter {
  convert() {
    this.stripMentions();

    let channel = this.message.client.channels.get(this.argument);
    if (channel == undefined) {
      throw new errors.BadArgument("Channel not found.");
    }
    return channel;
  }
}

class IntConverter extends Converter {
  convert() {
    let result = parseInt(this.argument, 10);
    if (isNaN(result)) {
      throw new errors.BadArgument("Invalid integer.");
    }
    return result;
  }
}

class FloatConverter extends Converter {
  convert() {
    let result = parseFloat(this.argument);
    if (isNaN(result)) {
      throw new errors.BadArgument("Invalid float.");
    }
    return result;
  }
}

const boolTrue = ["yes", "on", "true", "y", "enable"];
const boolFalse = ["no", "off", "false", "n", "disable"];
class BooleanConverter extends Converter {
  convert() {
    if (boolTrue.includes(this.argument)) {
      return true;
    } else if (boolFalse.includes(this.argument)) {
      return false;
    } else {
      throw new errors.BadArgument("Invalid boolean provided.");
    }
  }
}

module.exports = {
  Converter,

  channel: ChannelConverter,
  member: MemberConverter,
  int: IntConverter,
  float: FloatConverter,
  user: UserConverter,
  boolean: BooleanConverter
};
