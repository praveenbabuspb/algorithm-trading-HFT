const WebSocket = require('ws');
const Api = require('./lib/RestApi');
const cred = require('./cred');

const api = new Api({});
const TRADE_QTY = 1;
const MAX_DAILY_LOSS = 5;

let dailyPnL = 0;
let tradingStopped = false;

// Login to API
api.login(cred.authparams)
    .then((res) => {
        console.log('Login successful:', res);
        if (res.stat !== 'Ok') return console.error('Login failed. Exiting...');
        startWebSocket();
    })
    .catch((err) => console.error('Login failed:', err));

function startWebSocket() {
    function receiveMarketDepth(data) {
        if (!data.lp || tradingStopped) return;
        const ltp = parseFloat(data.lp);

        const bids = [], asks = [];
        for (let i = 1; i <= 10; i++) {
            if (data[`bp${i}`] && data[`bq${i}`]) bids.push({ price: parseFloat(data[`bp${i}`]), quantity: parseFloat(data[`bq${i}`]) });
            if (data[`sp${i}`] && data[`sq${i}`]) asks.push({ price: parseFloat(data[`sp${i}`]), quantity: parseFloat(data[`sq${i}`]) });
        }

        const hugeBuyOrder = bids.find(bid => bid.quantity >= 100000 && Math.abs(bid.price - ltp) <= 0.04);
        const hugeSellOrder = asks.find(ask => ask.quantity >= 100000 && Math.abs(ask.price - ltp) <= 0.04);

        if (hugeBuyOrder) {
            executeTrade("BUY", ltp);
        } else if (hugeSellOrder) {
            executeTrade("SELL", ltp);
        }
    }

    function executeTrade(type, ltp) {
        if (tradingStopped) return;
        const oppositeType = type === "BUY" ? "SELL" : "BUY";
        const tradePrice = type === "BUY" ? (ltp + 0.01).toFixed(2) : (ltp - 0.01).toFixed(2);

        api.place_order({
            exch: "NSE",
            token: "14366",
            ordertype: "LIMIT",
            qty: TRADE_QTY,
            price: ltp.toFixed(2),
            buysell: type,
            product: "MIS"
        }).then(res => {
            console.log(`${type} order placed at ${ltp.toFixed(2)}`, res);
            trackPnL(type, ltp, tradePrice); // Track PnL after trade execution

            return api.place_order({
                exch: "NSE",
                token: "14366",
                ordertype: "LIMIT",
                qty: TRADE_QTY,
                price: tradePrice,
                buysell: oppositeType,
                product: "MIS"
            });
        }).then(res => {
            console.log(`${oppositeType} order placed at ${tradePrice}`, res);
        }).catch(err => console.error(`${type} order failed:`, err));
    }

    function trackPnL(type, entryPrice, exitPrice) {
        let profit = type === "BUY" ? (exitPrice - entryPrice) * TRADE_QTY : (entryPrice - exitPrice) * TRADE_QTY;
        dailyPnL += profit;
        console.log(`Current PnL: ₹${dailyPnL.toFixed(2)}`);

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

console.log("Trading bot running...");
