const mysql = require("mysql");
const inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'bamazon'
});

//checks connection
// connection.connect(function(err) {
//     if (err) {
//       console.error('error connecting: ' + err);
//       return;
//     }

//     console.log('connected as id ' + connection.threadId);
//   });

//initial prompt to access database table

const initialPrompt = function () {
    inquirer.prompt([
        {
            type: "confirm",
            message: "Click 'Y' to access our catalog!",
            name: "confirm",
            default: true
        }
    ])

        .then(function (resp) {
            // If the inquirerResponse confirms, we displays the inquirerResponse's username and pokemon from the answers.
            if (resp.confirm) {
                connection.query("SELECT * FROM products", function (err, res) {
                    if (err) throw err;
                    console.log(res);
                    selectItem();
                });
            }
            else {
                console.log("\nThat's okay visit us again in the future");
                connection.query("SELECT * FROM products", function(err, res) {
                    connection.end();
                  });
            }
        });

};

const selectItem = function () {
    inquirer.prompt([
        {
            type: "prompt",
            message: "Please input the item id of the item you would like to purchase.",
            name: "chosenId"
        },

    ])

        .then(function (resp) {
            connection.query("SELECT * FROM products WHERE item_id = " + resp.chosenId, function (err, res) {
                console.log(res);
                howMany(resp.chosenId);
            });
        });

};

const howMany = function (item_id) {
    inquirer.prompt([
        {
            type: "prompt",
            message: "How many of this item would you like to purchase?",
            name: "amount"
        },
        {
            type: "confirm",
            message: "Are you sure:",
            name: "confirm",
            default: true
        }
    ])

        .then(function (resp) {

            connection.query("SELECT stock_quantity FROM products WHERE item_id = " + item_id, function (err, res){
                if(res[0].stock_quantity > resp.amount) {
                    priceOfOrder();
                }
                else{
                    console.log("not enough stock for your order.");
                    inquirer.prompt([
                        {
                            type: "confirm",
                            message: "Would you like to continue shopping?:",
                            name: "tryAgain",
                            default: true
                        }
                    ])
                    .then(function(inquirerResponse){
                        if(inquirerResponse.tryAgain){
                            initialPrompt();
                        }
                    })
                    
                }
            });

           const priceOfOrder = function(){ connection.query("SELECT price FROM products WHERE item_id = " + item_id, function (err, res) {
                if (resp.confirm) {
                    console.log("your total cost is $" + res[0].price * (resp.amount));
                }
            });
        
            connection.query("SELECT stock_quantity FROM products WHERE item_id = " + item_id, function (err, res) {
                let stockNumber = res[0].stock_quantity;

                connection.query("UPDATE products SET stock_quantity = ?  WHERE item_id = ?", [stockNumber - resp.amount, item_id], function (err, response) {
                    inquirer.prompt([
                        {
                            type: "confirm",
                            message: "Would you like to continue shopping?:",
                            name: "again",
                            default: true
                        }
                    ])
                        .then(function (response1) {
                            initialPrompt();
                        });


                });

            });
        };
        });

}



//calls initial function
initialPrompt();