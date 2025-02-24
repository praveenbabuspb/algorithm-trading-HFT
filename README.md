# 📈 Algorithmic Trading Bot 

## 🚀 Overview

This is a high-speed **algorithmic trading bot** built with **Shoonya API**, designed to detect large order book movements and execute trades accordingly. The bot monitors real-time market depth and places trades when significant buy or sell orders appear near the **Last Traded Price (LTP)**.

It aims to achieve a level of **high-frequency trading (HFT)** by executing trades based on rapid market movements, optimizing order execution speed, and minimizing latency.

## 🎯 Features

- ✅ **Real-time Order Book Monitoring** using WebSocket.
- ✅ **Automated Trade Execution** based on large buy/sell orders.
- ✅ **Risk Management** with a **max daily loss limit**.
- ✅ **Immediate Profit Booking** with 1 paisa price difference.
- ✅ **Simulation & Backtesting** using live paper trading.
- ✅ **Built with ShoonyaApi-js** for seamless integration.
- ✅ **Optimized for speed** to execute trades with minimal delay.

## 🏗️ Setup & Installation

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/yourusername/algorithmic-trading-HFT.git
cd algorithmic-trading-HFT
```

### 2️⃣ Install Dependencies

```sh
npm install shoonyaapi-js
```

### 3️⃣ Configure API Credentials

Create a `cred.js` file and add your **Shoonya API credentials**:

```js
module.exports = {
  authparams: {
    userid: "your_user_id",
    password: "your_password",
    twoFA: "your_2fa_code",
    vendor_code: "your_vendor_code",
    api_secret: "your_api_secret",
  }
};
```

### 4️⃣ Run the Bot

```sh
node simulation.js
```

## ⚙️ How It Works

1️⃣ **Connects to Shoonya API** and logs in.
2️⃣ **Subscribes to Market Depth Data** for a specific stock.
3️⃣ **Scans top 10 bids & asks** for large orders (≥1000 quantity).
4️⃣ If a **huge buy order** is found:
   - **BUY at LTP** → **SELL at LTP + 1 paisa**
5️⃣ If a **huge sell order** is found:
   - **SELL at LTP** → **BUY at LTP - 1 paisa**
6️⃣ **Stops trading if daily loss exceeds ₹5.**

## 📜 Example Code Snippet

```js
const ShoonyaApi = require('shoonyaapi-js');

const api = new ShoonyaApi({
    apiKey: 'your_api_key',
    secretKey: 'your_secret_key',
});

api.login()
    .then(() => {
        console.log('Logged in successfully');
        // Your trading logic here
    })
    .catch((error) => {
        console.error('Login failed', error);
    });
```

## 📘 Documentation

For detailed documentation, please refer to the [Shoonya API documentation](https://shoonyaapi-docs.com).

## 🔍 Future Enhancements

- ✅ **Improve backtesting without historical order book data**
- ✅ **Optimize order execution speed for faster trades**
- ✅ **Separate front-end for visualization**
- ✅ **Enhance trade decision-making logic for better accuracy**

## 🛠️ Contributions

Contributions are welcome! Please open an issue or submit a pull request on GitHub. 🚀

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## 📩 Contact

For any questions or support, please DM me in [LinkedIn](https://www.linkedin.com/in/praveenbabuspb).

---

Made with ❤️ by [PRAVEEN BABU](https://github.com/praveenbabuspb)

