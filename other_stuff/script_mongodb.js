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
        creditCardNumber: '123456'
    },
    {
        idx: 1,
        name: 'Pluto',
        email: 'pluto.marketgo@gmail.com',
        allergies: [
            'lactose'
        ],
        creditCardNumber: '654321'
    }
]);

db.purchases.insert([
    {
        "clientIdx": 0,
        "date": ISODate("2018-06-09T14:33:14.430Z"),
        "total": 5,
        "list": [{"idx": "0", "quantity": 1}]
    },
    {
        "clientIdx": 0,
        "date": ISODate("2018-06-09T14:33:49.996Z"),
        "total": 30,
        "list": [{"idx": "1", "quantity": 2}, {"idx": "2", "quantity": 1}]
    }

]);

//dati email
//pippo.marketgo@gmail.com
//password: MarketGo1

//chiave AES per carrello cliente
//bhaHswvPJHd6mFp+QDdXXg3pgjO+YlyJabEP1+1cHeU=
