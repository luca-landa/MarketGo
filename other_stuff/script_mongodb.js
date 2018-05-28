use; MarketGo;

db.createUser({
    user: 'node-red',
    pwd: 'MarketGo',
    roles: ['readWrite']
});

db.createCollection("shelves");
db.createCollection("employees");
db.createCollection("products");

db.shelves.insert([
      {idx: 0, minimumQuantity: 2},
      {idx: 1, minimumQuantity: 2},
      {idx: 2, minimumQuantity: 2}
]);

db.employees.insert([
    {idx: 0, completedActions: []},
    {idx: 1, completedActions: []}
]);

// allergies to introduce later: lactose intolerance
db.products.insert([
    {
        idx: 0, name: 'Peanut butter', data: {
            type: 'food',
            ingredients: ['Peanuts', 'Sugar', 'Palm oil', 'Salt'],
            allergens: ['Peanuts']
        }, price: 5
    },
    {
        idx: 1, name: 'Asiago DOP cheese', data: {
            type: 'food',
            ingredients: ['Milk', 'Salt', 'Rennet', 'Milk enzymes'],
            allergens: ['Lactose']
        }, price: 10
    },
    {
        idx: 2, name: 'Pizza', data: {
            type: 'food',
            ingredients: ['Flour', 'Yeast', 'Water', 'Salt', 'Oil', 'Mozzarella cheese', 'Tomatoes'],
            allergens: ['Lactose']
        }, price: 10
    }
]);

db.clients.insert([
    {
        idx: 0,
        name: 'Pippo',
        email: 'pippo.marketgo@gmail.com',
        allergies: [
            'Peanuts'
        ]
    },
    {
        idx: 1,
        name: 'Pluto',
        email: 'pluto.marketgo@gmail.com',
        allergies: [
            'Lactose'
        ]
    }
]);