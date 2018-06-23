// use MarketGo;

db.createUser({
    user: 'node-red',
    pwd: 'MarketGo',
    roles: ['readWrite']
});

db.createCollection("shelves");
db.createCollection("employees");
db.createCollection("products");
db.createCollection("clients");
db.createCollection("purchases");
db.createCollection("ratings");

db.shelves.insert([
    {idx: 0, minimumQuantity: 2},
    {idx: 1, minimumQuantity: 2},
    {idx: 2, minimumQuantity: 2}
]);

db.employees.insert([
    {idx: 0, completedActions: []},
    {idx: 1, completedActions: []}
]);

db.products.insert([
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
]);

db.clients.insert([
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
]);

db.purchases.insert([
    {
        "clientIdx": 0,
        "date": ISODate("2018-06-09"),
        "total": 5,
        "list": [{"idx": "0", "quantity": 10}, {"idx": "1", "quantity": 20}, {"idx": "2", "quantity": 4}]
    },
    {
        "clientIdx": 0,
        "date": ISODate("2018-06-08"),
        "total": 30,
        "list": [{"idx": "0", "quantity": 15}, {"idx": "1", "quantity": 5}, {"idx": "2", "quantity": 20}]
    },
    {
        "clientIdx": 0,
        "date": ISODate("2018-06-07"),
        "total": 30,
        "list": [{"idx": "0", "quantity": 8}, {"idx": "1", "quantity": 14}, {"idx": "2", "quantity": 12}]
    },
    {
        "clientIdx": 0,
        "date": ISODate("2018-06-06"),
        "total": 30,
        "list": [{"idx": "0", "quantity": 3}, {"idx": "1", "quantity": 6}, {"idx": "2", "quantity": 8}]
    }
]);

//dati email
//pippo.marketgo@gmail.com
//password: MarketGo1

//chiave AES per carrello cliente
//bhaHswvPJHd6mFp+QDdXXg3pgjO+YlyJabEP1+1cHeU=
