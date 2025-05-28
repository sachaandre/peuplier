const express = require("express");
const router = express.Router();

const city_data_fr = require('../public/javascripts/communes.json');

const Testimony = require("../models/testimony");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const { OsunyOwl, OsunyUtility } = require("osuny-owl");

/**
 * Configuration du site internet
 * Besoin de rendre ça accessible par UI
 */

const owl = new OsunyOwl(process.env.OSUNY_WEBSITE_ID, "https://sachaandre.osuny.org/api/osuny/v1/")
owl.addCategory_id(process.env.OSUNY_CATEGORY_ID) // ajout de la catégorie API du site



exports.testimony_index = asyncHandler(async (req, res, next) => {
    const allTestimonies = await Testimony.find()
        .sort({ created_at: "desc" })
        .exec();
    
    res.render("testimony_list", {
        title: "Ensemble des témoignages", 
        testimony_list: allTestimonies,
    });
});

exports.testimony_detail = asyncHandler(async (req, res, next) => {
    const testimony = await Testimony.findById(req.params.id).exec();

    if(testimony === null){
        const err = new Error("Témoignage non trouvé");
        err.status = 404;
        return next(err);
    }

    res.render("testimony_detail", {
        title: 'Détail du témoignage',
        testimony: testimony
    })

})

exports.testimony_create_get = (req, res, next) => {
    const data = city_data_fr.data;
    const city_value = [],
        city_name = [];
    
    data.forEach(city => {
        city_value.push(city.nom_sans_accent + "-" + city.dep_code);
        city_name.push(city.nom_standard + " (" + city.dep_code + ")");
    });

    res.render("testimony_form", {
        title: "Déposer un nouveau témoignage",
        city_names: city_name,
        city_values: city_value
    });
}

exports.testimony_create_post = [
    body("name")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Un nom doit être donné (peut être un pseudo ou 'Anonyme')."),

    body("testimony", "Le témoignage doit faire au moins 50 caractères.")
        .isLength({ min: 40 }),
    
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
        const errors = validationResult(req);

        const data = city_data_fr.data;
        const city_value = [],
            city_name = [];
        
        data.forEach(city => {
            city_value.push(city.nom_sans_accent + "-" + city.dep_code);
            city_name.push(city.nom_standard + " (" + city.dep_code + ")");
        });

        console.log(req.body.city);

        const testimony = new Testimony({
                name: req.body.name.toString("utf8"),
                age: req.body.age,
                gender: req.body.gender,
                testimony: req.body.testimony.toString("utf8"),
                mail: req.body.email,
                tel: req.body.tel
        });

        if(req.body.city != ''){
            //remove the department code at the end of the name.
            let city_split = req.body.city.split(/( \((\d*|\d[A-Z])\))/g)

            //Set the city name
            let city_name;
            city_name = city_split[0];

            //Find the city's associated data
            const city = data.find(el => el.nom_standard == city_name && el.dep_code == city_split[2]);
            
            console.log(city);
            testimony.city.name = city.nom_standard
            testimony.city.postal_code = city.code_postal;
            testimony.city.geopoints = {
                latitude: city.latitude_centre,
                longitude: city.longitude_centre
            },
            testimony.city.department = {
                code: city.dep_code,
                name: city.dep_nom
            },
            testimony.city.region = {
                code: city.reg_code,
                name: city.reg_nom
            },
            testimony.city.epci = {
                code: city.epci_code,
                name: city.epci_nom
            }
            
        }

        if (!errors.isEmpty()){
            // There are errors. Render form again with sanitized values/errors messages.
            res.render("testimony_form", {
                title: "Déposer un nouveau témoignage",
                city_names: city_name,
                city_values: city_value,
                testimony: testimony,
                testimony_city: req.body.city,
                errors: errors.array(),
            });
            return;
        } else {
            await testimony.save();
            res.render("thanks")
        }
    })
    
];


exports.testimony_delete_post = asyncHandler(async (req, res, next) => {
    await Testimony.findByIdAndDelete(req.params.id);
    res.redirect("/temoignages");
});

exports.testimony_archive_post = asyncHandler(async (req, res, next) => {
    const testimony = await Testimony.findById(req.params.id).exec();
    testimony.state = "Archived";
    testimony.save();
    res.redirect("/temoignages");
});

exports.testimony_draft_post = asyncHandler(async (req, res, next) => {
    const testimony = await Testimony.findById(req.params.id).exec();
    testimony.state = "Draft";
    testimony.save();
    res.redirect("/temoignages");
});

exports.testimony_publish_post = asyncHandler(async (req, res, next) => {
    const testimony = await Testimony.findById(req.params.id).exec();
    let migrationId = "testimony_" + testimony._id.toString()

    let datatable = [
        {
            "cells": [
                "Genre",
                testimony.gender == "" ? "Non renseigné" : testimony.gender
            ]
        },
        {
            "cells": [
                "Commune",
                testimony.city.name ? `${testimony.city.name} (${testimony.city.department.code}) ` : "Non renseignée"
            ]
        },
        {
            'cells': [
                "Age",
                testimony.age ? testimony.age : "Non renseigné"
            ]
        }
    ]

    let dataheader = ["Libellé", "Données"]

    const testimonyContentBlock = OsunyUtility.createChapter(
        testimony.testimony,
        migrationId,
        0
    )

    const testimonyDataBlock = OsunyUtility.createDatatable(
        datatable,
        dataheader,
        "testimony_metadata_" + testimony._id,
        1,
        "Métadonnées du témoignage"
    )

    const postBlocks = OsunyUtility.composePost(testimonyContentBlock, testimonyDataBlock)

    const post = OsunyUtility.createPost(
        "Témoignage de " + testimony.name,
        "testimony_post_"+ testimony._id,
        postBlocks,
        owl._category_ids,
        false
    )

    owl.postToOsuny(post)

    testimony.state = "Published";
    testimony.published_on_Osuny = true;
    testimony.save();
    res.redirect("/temoignages");

});