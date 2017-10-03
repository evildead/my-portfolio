const Event = require('../models/event');

module.exports = {
    showEvents: showEvents,
    showSingle: showSingle,
    seedEvents: seedEvents,
    showCreate: showCreate,
    processCreate: processCreate,
    showEdit: showEdit,
    processEdit: processEdit,
    deleteEvent: deleteEvent
}

/**
 * Show all the events
 * @param {request} req 
 * @param {response} res 
 */
function showEvents(req, res) {
    // get all the events
    Event.find({}, (err, events) => {
        // error found
        if(err) {
            res.status(404);
            res.send('Events not found');
        }

        // no error
        // return a view with data
        res.render('pages/events', {
            events: events,
            success: req.flash('success')
        });
    });
}

/**
 * Show a single event
 * @param {request} req 
 * @param {response} res 
 */
function showSingle(req, res) {
    Event.findOne({slug: req.params.slug}, (err, event) => {
        // error found
        if(err) {
            res.status(404);
            res.send('Events not found');
        }

        // no error
        // return a view with data
        res.render('pages/single', {
            event: event,
            success: req.flash('success')
        });
    });
}

/**
 * Seed the database
 * @param {request} req 
 * @param {response} res 
 */
function seedEvents(req, res) {
    // create dummy events
    const events = [{
            name: 'Basketball',
            description: 'Throwing into a basket.'
        },
        {
            name: 'Swimming',
            description: 'Michael Phelps is the fast fish.'
        },
        {
            name: 'Weightlifting',
            description: 'Lifting heavy things up'
        },
        {
            name: 'Ping Pong',
            description: 'Super fast paddles'
        },
        {
            name: 'Volleyball',
            description: 'Heroes of pipes'
        }
    ];

    // use the Event model to insert/save
    Event.remove({}, () => {
        // After removing all the events present in the database, perform the seeding!
        for (event of events) {
            var newEvent = new Event(event);
            newEvent.save();
        }
    });

    // seeded!
    res.send('Database seeded!');
}

/**
 * Show form to create events
 * @param {request} req 
 * @param {response} res 
 */
function showCreate(req, res) {
    res.render('pages/create', {
        errors: req.flash('errors')
    });
}

/**
 * Process the creation form
 * @param {request} req 
 * @param {response} res 
 */
function processCreate(req, res) {
    // validate information
    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('description', 'Description is required!').notEmpty();

    // if there are errors, redirect and save errors to flash
    const errors = req.validationErrors();
    if(errors) {
        req.flash('errors', errors.map(err => err.msg));
        return res.redirect('/events/create');
    }

    const event = new Event({
        name: req.body.name,
        description: req.body.description
    });

    // save the event
    event.save((err) => {
        if(err) {
            throw err;
        }

        // set a successful flash message
        req.flash('success', 'Successfully created event!');

        // redirect to the newly created event
        res.redirect(`/events/${event.slug}`);
    });
}

/**
 * Show the edit form
 * @param {request} req 
 * @param {response} res 
 */
function showEdit(req, res) {
    // finding current event
    Event.findOne({slug: req.params.slug}, (err, event) => {
        res.render('pages/edit', {
            event: event,
            errors: req.flash('errors')
        });
    });
}

/**
 * Process the edit form
 * @param {request} req 
 * @param {response} res
 */
function processEdit(req, res) {
    // validate information
    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('description', 'Description is required!').notEmpty();

    // if there are errors, redirect and save errors to flash
    const errors = req.validationErrors();
    if(errors) {
        req.flash('errors', errors.map(err => err.msg));
        return res.redirect(`/events/${req.params.slug}/edit`);
    }

    // finding current event
    Event.findOne({slug: req.params.slug}, (err, event) => {
        // updating that event
        event.name = req.body.name;
        event.description = req.body.description;

        event.save((err) => {
            if(err) {
                throw err;
            }

            // success flash message
            // redirect back to the /events
            req.flash('success', 'Successfully updated event!');
            res.redirect('/events');
        });
    });
}

/**
 * Delete the event
 * @param {request} req 
 * @param {response} res
 */
function deleteEvent(req, res) {
    Event.remove({slug: req.params.slug}, (err) => {
        // set flash data
        // redirect back to events page
        req.flash('success', 'Event deleted!');
        res.redirect('/events');
    });
}
