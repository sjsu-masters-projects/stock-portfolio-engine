# Stock Portfolio Engine - Grader Test Cases

## Setup Instructions

### Option A: Live Demo
- **Frontend**: [stock-portfolio-engine-iota.vercel.app](https://stock-portfolio-engine-iota.vercel.app)
- **Backend API**: [stock-portfolio-engine.onrender.com](https://stock-portfolio-engine.onrender.com)
- **Note**: The backend runs on Render's free tier — the first request may take ~30 seconds to wake from a cold start.

### Option B: Run Locally
1. **Start the Backend**:
   - Open a terminal and navigate to the `backend` folder.
   - Run: `pip install -r requirements.txt`
   - Run: `uvicorn app.main:app --reload`
   - The backend will start at `http://localhost:8000`.
2. **Start the Frontend**:
   - Open a new terminal and navigate to the `frontend` folder.
   - Run: `npm install`
   - Run: `npm run dev`
   - Open `http://localhost:3000` in your browser.

---

## Test Cases

### Test Case 1: Minimum Investment Validation
- **Action**: On the "Builder" page, try to set the investment amount to `$4,000` manually or using the slider. Click "Continue".
- **Expected Result**: An error message appears stating "Minimum investment is $5,000". The wizard prevents moving to the next step.

### Test Case 2: Multi-Step Wizard Flow
- **Action**: Set amount to `$10,000`. Click "Continue". Select the "Growth" strategy. Click "Review Portfolio".
- **Expected Result**: The UI smoothly transitions through 3 steps, displaying a summary of the $10,000 amount and the Growth strategy assets (NVDA, TSLA, AMZN, META) on the final Review step.

### Test Case 3: Generating a Portfolio (Backend Integration)
- **Action**: On the Review step, click "Generate Portfolio".
- **Expected Result**: The app transitions to the Dashboard. A success message might briefly appear. The Dashboard populates with data allocated specifically for the $10,000 across the selected strategy.

### Test Case 4: Dashboard - Real-time Ticker
- **Action**: View the top horizontal scrolling bar on the Dashboard.
- **Expected Result**: It displays mini-cards for the allocated stocks (e.g., NVDA, TSLA) with their current live prices fetched from Yahoo Finance (via the backend) and a 5-day return percentage indicator.

### Test Case 5: Dashboard - Risk Metrics
- **Action**: Look at the 4 metric cards below the ticker on the Dashboard.
- **Expected Result**: You should see computed values for Portfolio Beta, Volatility (5D), Diversification score, and Sharpe Ratio, reflecting the risk profile of the selected stocks.

### Test Case 6: Dashboard - Sortable Allocation Table
- **Action**: In the "Holdings" table, click on the "Weight" column header, then click it again.
- **Expected Result**: The rows sort dynamically in descending, then ascending order based on the allocated performance weight.

### Test Case 7: Stock Detail Modal
- **Action**: Click on any stock row in the "Holdings" table (or a ticker card).
- **Expected Result**: A beautiful glassmorphism modal opens displaying the stock's 52-week high/low, P/E ratio, Market Cap, and a list of the latest 5 news articles specific to that company. Press `Esc` or click the `X` to close it.

### Test Case 8: Saving & Loading Portfolios
- **Action**: Navigate to the "History" tab in the sidebar. Click "Save Current Portfolio".
- **Expected Result**: The current configuration is saved and appears under the "Saved Configurations" list with a timestamp. Clicking the "Play" (Load) icon on it restores that exact portfolio to the Dashboard.

### Test Case 9: Portfolio Comparison
- **Action**: Navigate to the "Compare" tab. Set amount to `$10,000`. Select "Index" for Portfolio A, and "Value" for Portfolio B. Click "Compare Portfolios".
- **Expected Result**: The app generates both portfolios simultaneously and displays a side-by-side comparison of their values, risk metrics, and historical trend lines. A "WINNER" badge is highlighted on the one with the higher 5-day simulated value.

### Test Case 10: Error Handling & API Resilience
- **Action**: 
  1. Generate a portfolio with an extremely large amount (e.g., `$999,999,999`).
  2. Observe the dashboard loading states while the backend processes live Yahoo Finance data.
- **Expected Result**: The application handles the large amount gracefully — the backend still allocates shares correctly based on performance weights, all price data loads with proper loading skeletons, and no UI crashes occur. If any external API call fails, the relevant section shows a friendly fallback instead of breaking the page.
