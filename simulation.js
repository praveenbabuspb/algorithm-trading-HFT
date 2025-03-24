const WebSocket = require('ws');
const Api = require('./lib/RestApi');
const cred = require('./cred');

const api = new Api({});
const TRADE_QTY = 1; 
const MAX_DAILY_LOSS = 5000; 

let dailyPnL = 0;
let tradingStopped = false;
let simulatedTrades = []; // Store simulated trades

api.login(cred.authparams)
    .then((res) => {
        if (res.stat !== 'Ok') return console.error('Login failed. Exiting...');
        startWebSocket();
    })
    .catch(err => console.error('Login failed:', err));

function startWebSocket() {
    function receiveMarketDepth(data) {
        if (!data.lp || tradingStopped) return;
        const ltp = parseFloat(data.lp);

        const bids = [], asks = [];
        for (let i = 1; i <= 10; i++) {
            if (data[`bp${i}`] && data[`bq${i}`]) bids.push({ price: parseFloat(data[`bp${i}`]), quantity: parseFloat(data[`bq${i}`]) });
            if (data[`sp${i}`] && data[`sq${i}`]) asks.push({ price: parseFloat(data[`sp${i}`]), quantity: parseFloat(data[`sq${i}`]) });
        }
                                                          //this vale 1000 have to be changed according to the average volume of a stock.
        const hugeBuyOrder = bids.find(bid => bid.quantity >= 100000  && Math.abs(bid.price - ltp) <= 0.04);
        const hugeSellOrder = asks.find(ask => ask.quantity >= 100000 && Math.abs(ask.price - ltp) <= 0.04);

        if (hugeBuyOrder) {
            executeTrade("BUY", ltp);
        } else if (hugeSellOrder) {
            executeTrade("SELL", ltp);
        }
    }

    function simulateTrade(type, ltp) {
        if (tradingStopped) return;
        const oppositeType = type === "BUY" ? "SELL" : "BUY";
        const exitPrice = type === "BUY" ? (ltp + 0.01).toFixed(2) : (ltp - 0.01).toFixed(2);

        simulatedTrades.push({ type, entry: ltp, exit: parseFloat(exitPrice), status: "OPEN" });
        console.log(`[SIMULATED] ${type} at ${ltp}, exit at ${exitPrice}`);

        // Simulate PnL calculation
        setTimeout(() => closeTrade(type, exitPrice), 2000);
    }

    function closeTrade(type, exitPrice) {
        const trade = simulatedTrades.find(t => t.type === type && t.status === "OPEN");
        if (!trade) return;

        trade.status = "CLOSED";
        trade.exit = parseFloat(exitPrice);
        const profit = type === "BUY" ? trade.exit - trade.entry : trade.entry - trade.exit;
        dailyPnL += profit * TRADE_QTY;
        
        console.log(`[SIMULATED] ${type} closed at ${exitPrice}. PnL: ₹${profit.toFixed(2)}`);
        console.log(`Total PnL: ₹${dailyPnL.toFixed(2)}`);

        if (dailyPnL <= -MAX_DAILY_LOSS) {
            console.log(`Max loss reached (₹${MAX_DAILY_LOSS}). Stopping trading.`);
            tradingStopped = true;
        }
    }

    function onOpen() {
        console.log("WebSocket connected.");
        api.subscribe('NSE|14366');
    }

    api.start_websocket({ socket_open: onOpen, quote: receiveMarketDepth });
}

console.log("Paper trading simulation running...");
