const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const TestimonySchema = new Schema({
    name: { type: String, required: true },
    created_at: { type: Date, default: Date.now, required: true },
    testimony: { type: String, minLength: 40, required: true },
    city: {
        name: { type: String },
        postal_code: { type: String },
        geopoints: {
            latitude: { type: Schema.Types.Decimal128 },
            longitude: { type: Schema.Types.Decimal128 },
        },
        department: {
            code: { type: String },
            name: { type: String }
        },
        region: {
            code: { type: String },
            name: { type: String },
        },
        epci: {
            code: { type: String },
            name: { type: String }
        }
    },
    state: {
        type: String,
        required: true,
        enum: ["Draft", "Published", "Archived"],
        default: "Draft",
    },
    gender:{
        type: String,
        enum: ["Homme", "Femme", "Autre", ""],
        default: ""
    },
    age: { type: Number },
    mail: { type: String },
    tel: { type: String },
    published_on_Osuny: { type: Boolean, default: false },
});

// Virtual for bookinstance's URL
TestimonySchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/testimony/${this._id}`;
});

TestimonySchema.virtual("excerpt").get(function() {
    const maxNbOfWords = 30;
    //taken from https://medium.com/@paulohfev/problem-solving-how-to-create-an-excerpt-fdb048687928
    const listOfWords = this.testimony.trim().split(' ');
    const truncatedContent = listOfWords.slice(0, maxNbOfWords).join(' ');
    const excerpt = truncatedContent + "...";

    const output = listOfWords.length > maxNbOfWords ? excerpt : this.testimony;
    
    return output;
})

TestimonySchema.virtual("readable_date").get(function () {
    return DateTime.fromJSDate(this.created_at).toLocaleString(DateTime.DATETIME_MED);
})

module.exports = mongoose.model("Testimony", TestimonySchema);