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
        idx: 0, name: 'Peanut butter', data: {
            type: 'food',
            ingredients: ['Peanuts', 'Sugar', 'Palm oil', 'Salt'],
            allergens: ['peanuts']
        }, price: 5
    },
    {
        idx: 1, name: 'Asiago DOP cheese', data: {
            type: 'food',
            ingredients: ['Milk', 'Salt', 'Rennet', 'Milk enzymes'],
            allergens: ['lactose']
        }, price: 10
    },
    {
        idx: 2, name: 'Pizza', data: {
            type: 'food',
            ingredients: ['Flour', 'Yeast', 'Water', 'Salt', 'Oil', 'Mozzarella cheese', 'Tomatoes'],
            allergens: ['lactose']
        }, price: 10
    }
]);

db.clients.insert([
    {
        idx: 0,
        name: 'Pippo',
        email: 'pippo.marketgo@gmail.com',
        allergies: [
            'peanuts'
        ]
    },
    {
        idx: 1,
        name: 'Pluto',
        email: 'pluto.marketgo@gmail.com',
        allergies: [
            'lactose'
        ]
    }
]);
