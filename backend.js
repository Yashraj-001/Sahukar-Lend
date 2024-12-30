const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Route to handle Normal Actions
app.post("/normal-action", (req, res) => {
    const { action, mintAddress, amount } = req.body;

    // Simulating command-line execution
    const result = `Executed ${action} on mint address ${mintAddress} for amount ${amount}`;
    console.log(result); // Command-line output
    res.json({ status: "success", message: result });
});

// Route to handle Special Actions
app.post("/special-action", (req, res) => {
    const { action, address, amount } = req.body;

    // Simulating command-line execution
    const result = `Executed ${action} on address ${address} for amount ${amount}`;
    console.log(result); // Command-line output
    res.json({ status: "success", message: result });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
