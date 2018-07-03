"use strict";

//default user email data
//pippo.marketgo@gmail.com
//password: MarketGo1

const config = require('./lib/config').config;

const clientEmail = config['default_client_email'];
const clientIdx = config['default_client_idx'];
const mongoURL = config['mongodb_url'];

let MongoClient = require('mongodb').MongoClient;

MongoClient.connect(mongoURL, { useNewUrlParser: true }, (err, client) => {
    if (err) throw err;
    onConnection(client.db('MarketGo'));
    console.log('MarketGo db seeded');
    client.close();
});

function onConnection(db) {
    db.admin().addUser('node-red', 'MarketGo', {
        roles: [
            {
                role: 'readWrite',
                db: 'MarketGo'
            }
        ]
    }).catch(defaultCallback);

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
        {
            idx: 0,
            completedActions: [
                {"date": getPrevDate(0), "type": "help_client", "clientIdx": 0},
                {"date": getPrevDate(1), "type": "help_client", "clientIdx": 1},
                {"date": getPrevDate(0), "type": "restock", "shelfIdx": 0},
                {"date": getPrevDate(1), "type": "restock", "shelfIdx": 1},
                {"date": getPrevDate(1), "type": "restock", "shelfIdx": 2},
                {"date": getPrevDate(2), "type": "restock", "shelfIdx": 1}
            ]
        },
        {
            idx: 1,
            completedActions: [
                {"date": getPrevDate(0), "type": "help_client", "clientIdx": 0},
                {"date": getPrevDate(1), "type": "help_client", "clientIdx": 1},
                {"date": getPrevDate(2), "type": "help_client", "clientIdx": 1},
                {"date": getPrevDate(1), "type": "help_client", "clientIdx": 0},
                {"date": getPrevDate(1), "type": "restock", "shelfIdx": 2},
                {"date": getPrevDate(2), "type": "restock", "shelfIdx": 1}
            ]
        }
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
            email: clientIdx === 0 ? clientEmail : 'pippo.marketgo@gmail.com',
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
            email: clientIdx === 1 ? clientEmail : 'pluto.marketgo@gmail.com',
            allergies: [
                'lactose'
            ],
            creditCardNumber: '654321',
            publicKey: 'MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgHw69Qdomr+rgUSKIOvlmAXEAsPK\n' +
            'oUUV8ek/JFPAk+h4dUSEZIfnRu0MvFtDupM9s/eAveaR2DLJ+LAaqZRGL7PbMjQe\n' +
            '1sJNUd3hgcjF46MijDdfD/MhE/4xmeVMj4B69lNrkNfx6mjxXz92GG02K8yx8hWt\n' +
            'pxqkgkTi8xhAb5gzAgMBAAE='
        }
    ], defaultCallback);

    db.collection('purchases').insert([
        {
            "clientIdx": 0,
            "date": getPrevDate(0),
            "total": 5,
            "list": [{"idx": "0", "quantity": 10}, {"idx": "1", "quantity": 20}, {"idx": "2", "quantity": 4}]
        },
        {
            "clientIdx": 1,
            "date": getPrevDate(1),
            "total": 30,
            "list": [{"idx": "0", "quantity": 15}, {"idx": "1", "quantity": 5}, {"idx": "2", "quantity": 20}]
        },
        {
            "clientIdx": 0,
            "date": getPrevDate(2),
            "total": 30,
            "list": [{"idx": "0", "quantity": 8}, {"idx": "1", "quantity": 14}, {"idx": "2", "quantity": 12}]
        },
        {
            "clientIdx": 1,
            "date": getPrevDate(3),
            "total": 30,
            "list": [{"idx": "0", "quantity": 3}, {"idx": "1", "quantity": 6}, {"idx": "2", "quantity": 8}]
        },
        {
            "clientIdx": 0,
            "date": getPrevDate(4),
            "total": 30,
            "list": [{"idx": "0", "quantity": 5}, {"idx": "1", "quantity": 1}, {"idx": "2", "quantity": 6}]
        },
        {
            "clientIdx": 0,
            "date": getPrevDate(5),
            "total": 30,
            "list": [{"idx": "0", "quantity": 2}, {"idx": "1", "quantity": 9}, {"idx": "2", "quantity": 8}]
        },
        {
            "clientIdx": 0,
            "date": getPrevDate(6),
            "total": 30,
            "list": [{"idx": "0", "quantity": 4}, {"idx": "1", "quantity": 2}, {"idx": "2", "quantity": 7}]
        }
    ], defaultCallback);

    db.collection('ratings').insert([
        {
            date: getPrevDate(0),
            clientIdx: 0,
            value: 5
        },
        {
            date: getPrevDate(2),
            clientIdx: 1,
            value: 2
        },
        {
            date: getPrevDate(4),
            clientIdx: 1,
            value: 3
        },
        {
            date: getPrevDate(1),
            clientIdx: 0,
            value: 5
        }
    ], defaultCallback);
}

function getPrevDate(prevDays) {
    let today = new Date();
    let day = today.getDate(),
        month = today.getMonth(),
        year = today.getFullYear();

    return new Date(year, month, day - prevDays);
}

function defaultCallback() {
}
