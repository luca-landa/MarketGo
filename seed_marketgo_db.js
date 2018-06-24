"use strict";

function seed(mongoUrl) {
    let MongoClient = require('mongodb').MongoClient;

    MongoClient.connect(mongoUrl, (err, db) => {
        if (err) throw err;
        onConnection(db);
        db.close();
    });
}

function onConnection(db) {
    db.admin().addUser('node-red', 'MarketGo', {
        roles: [
            {
                role: 'readWrite',
                db: 'MarketGo'
            }
        ]
    });

    const collectionNames = [
        "shelves",
        "employees",
        "products",
        "clients",
        "purchases",
        "ratings"];

    collectionNames.forEach((name) => {
        db.createCollection(name);
        db.collection(name).remove({}, defaultCallback);
    });

    db.collection('shelves').insert([
        {idx: 0, minimumQuantity: 2},
        {idx: 1, minimumQuantity: 2},
        {idx: 2, minimumQuantity: 2}
    ], defaultCallback);

    db.collection('employees').insert([
        {idx: 0, completedActions: []},
        {idx: 1, completedActions: []}
    ], defaultCallback);

    db.collection('products').insert([
        {
            idx: 0,
            name: 'Peanut butter',
            data: {
                type: 'food',
                ingredients: ['Peanuts', 'Sugar', 'Palm oil', 'Salt'],
                allergens: ['peanuts']
            },
            price: 5,
            img: '/images/peanut-butter.png'
        },
        {
            idx: 1,
            name: 'Asiago DOP cheese',
            data: {
                type: 'food',
                ingredients: ['Milk', 'Salt', 'Rennet', 'Milk enzymes'],
                allergens: ['lactose']
            },
            price: 10,
            img: '/images/cheese.png'
        },
        {
            idx: 2,
            name: 'Pizza',
            data: {
                type: 'food',
                ingredients: ['Flour', 'Yeast', 'Water', 'Salt', 'Oil', 'Mozzarella cheese', 'Tomatoes'],
                allergens: ['lactose']
            },
            price: 10,
            img: '/images/pizza.png'
        }
    ], defaultCallback);

    db.collection('clients').insert([
        {
            idx: 0,
            name: 'Pippo',
            email: 'pippo.marketgo@gmail.com',
            allergies: [
                'peanuts'
            ],
            creditCardNumber: '123456',
            publicKey: 'MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgHw69Qdomr+rgUSKIOvlmAXEAsPK\n' +
            'oUUV8ek/JFPAk+h4dUSEZIfnRu0MvFtDupM9s/eAveaR2DLJ+LAaqZRGL7PbMjQe\n' +
            '1sJNUd3hgcjF46MijDdfD/MhE/4xmeVMj4B69lNrkNfx6mjxXz92GG02K8yx8hWt\n' +
            'pxqkgkTi8xhAb5gzAgMBAAE='
        },
        {
            idx: 1,
            name: 'Pluto',
            email: 'pluto.marketgo@gmail.com',
            allergies: [
                'lactose'
            ],
            creditCardNumber: '654321',
            publicKey: 'MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgHplYLW3Fll19I9PKHqgB8ikIlnK\n' +
            'jUjZ7DwC4v9ngPr/FCIKVcNsdcGcETUnfQ5ZMniaCFzQ5UzdSUaZ7HcDO0R5VD/C\n' +
            'cosn1PV0Go1WfPhKAuH+aF+v/MRnYrcKe8LdfzoUtTkGIvt57ChPVihXSQ0Vaph0\n' +
            '/eMR1T5pZ5ezVqoxAgMBAAE='
        }
    ], defaultCallback);

    db.collection('purchases').insert([
        {
            "clientIdx": 0,
            "date": getISODate(0),
            "total": 5,
            "list": [{"idx": "0", "quantity": 10}, {"idx": "1", "quantity": 20}, {"idx": "2", "quantity": 4}]
        },
        {
            "clientIdx": 1,
            "date": getISODate(1),
            "total": 30,
            "list": [{"idx": "0", "quantity": 15}, {"idx": "1", "quantity": 5}, {"idx": "2", "quantity": 20}]
        },
        {
            "clientIdx": 0,
            "date": getISODate(2),
            "total": 30,
            "list": [{"idx": "0", "quantity": 8}, {"idx": "1", "quantity": 14}, {"idx": "2", "quantity": 12}]
        },
        {
            "clientIdx": 1,
            "date": getISODate(3),
            "total": 30,
            "list": [{"idx": "0", "quantity": 3}, {"idx": "1", "quantity": 6}, {"idx": "2", "quantity": 8}]
        },
        {
            "clientIdx": 0,
            "date": getISODate(4),
            "total": 30,
            "list": [{"idx": "0", "quantity": 5}, {"idx": "1", "quantity": 1}, {"idx": "2", "quantity": 6}]
        },
        {
            "clientIdx": 0,
            "date": getISODate(5),
            "total": 30,
            "list": [{"idx": "0", "quantity": 2}, {"idx": "1", "quantity": 9}, {"idx": "2", "quantity": 8}]
        },
        {
            "clientIdx": 0,
            "date": getISODate(6),
            "total": 30,
            "list": [{"idx": "0", "quantity": 4}, {"idx": "1", "quantity": 2}, {"idx": "2", "quantity": 7}]
        }
    ], defaultCallback);
}

function getISODate(prevDays) {
    let today = new Date();
    let day = today.getDate(),
        month = today.getMonth(),
        year = today.getFullYear();

    if (day - prevDays < 0) {

    } else {
        return new Date(year, month, day - prevDays);
    }
}

function defaultCallback() {

}

exports.seed = seed;

//dati email
//pippo.marketgo@gmail.com
//password: MarketGo1