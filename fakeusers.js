#!/usr/bin/env node
"use strict";

const crypto = require('crypto');
const faker = require('faker');

const formatCSV = "csv";
const formatMongo = "mongo";
const supportedFormats = [formatCSV, formatMongo];

const prologues = {
    [formatCSV]: "email,username,firstname,lastname,photourl",
    [formatMongo]: "var bulk = db.users.initializeUnorderedBulkOp();"
};

const epilogues = {
    [formatMongo]: "bulk.execute();"
};

const gravatarURL = "https://www.gravatar.com/avatar/";

if (process.argv.length < 3) {
    console.error("usage:\n\t./fakeusers <number>\n")
    process.exit(1)
}

var numUsers = parseInt(process.argv[2], 10)
if (isNaN(numUsers)) {
    console.error("'%s' is not a valid integer", process.argv[2])
    process.exit(1)
}

var format = formatCSV;
if (process.argv.length >= 4) {
    format = process.argv[3]
    if (supportedFormats.findIndex(f => f === format) < 0) {
        console.error("'%s' is not a supported format: use one of %s", format, supportedFormats.join(", "));
        process.exit(1);
    }
}

//previously-generated emails and usernames
//since these must be unique, we have to keep
//track of previously-generated ones
var emails = {}
var unames = {}

/**
 * genFakeUser generates a new fake user with a unique
 * email address and username
 */
function genFakeUser() {
    let fn = faker.name.firstName()
    let ln = faker.name.lastName()
    
    let e = faker.internet.exampleEmail(fn, ln)
    while (emails.hasOwnProperty(e)) {
        e = faker.internet.exampleEmail(fn, ln)
    }
    emails[e] = true
    let purl = gravatarURL + crypto.createHash("md5").update(e.trim().toLowerCase()).digest("hex");

    let un = faker.internet.userName(fn, ln)
    while (unames.hasOwnProperty(un)) {
        un = faker.internet.userName(fn, ln)
    }
    unames[un] = true

    return {
        email: e,
        username: un,
        firstname: fn,
        lastname: ln,
        photourl: purl
    };
}

//write prologue (if any)
if (prologues.hasOwnProperty(format)) {
    console.log(prologues[format]);
}

for (let i = 0; i < numUsers; i++) {
    let user = genFakeUser()
    switch (format) {
        case formatCSV:
            console.log(`"${user.email}","${user.username}","${user.firstname}","${user.lastname}","${user.photourl}"`);
            break;
        case formatMongo:
            console.log(`bulk.insert(${JSON.stringify(user)});`);        
            break;
    }
}

//write eiplogue (if any)
if (epilogues.hasOwnProperty(format)) {
    console.log(epilogues[format]);
}
